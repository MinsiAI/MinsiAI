package ai.minsi.service;

import ai.minsi.common.BusinessException;
import ai.minsi.common.ErrorCode;
import ai.minsi.config.MinsiProperties;
import ai.minsi.util.SessionTokenGenerator;
import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.util.StringUtils;

import javax.crypto.Mac;
import javax.crypto.spec.SecretKeySpec;
import java.io.IOException;
import java.net.URI;
import java.net.URISyntaxException;
import java.nio.charset.StandardCharsets;
import java.security.MessageDigest;
import java.security.NoSuchAlgorithmException;
import java.time.Clock;
import java.time.Duration;
import java.time.Instant;
import java.util.Base64;

@Service
public class OAuthStateService {

    private static final Duration STATE_TTL = Duration.ofMinutes(10);
    private static final int MAX_REDIRECT_LENGTH = 512;
    private static final int MAX_ORIGIN_LENGTH = 256;
    private static final String DEFAULT_REDIRECT_PATH = "/chat";
    private static final String HMAC_ALGORITHM = "HmacSHA256";

    private final MinsiProperties properties;
    private final ObjectMapper objectMapper;
    private final SessionTokenGenerator tokenGenerator;
    private final Clock clock;

    @Autowired
    public OAuthStateService(MinsiProperties properties, ObjectMapper objectMapper, SessionTokenGenerator tokenGenerator) {
        this(properties, objectMapper, tokenGenerator, Clock.systemUTC());
    }

    OAuthStateService(MinsiProperties properties, ObjectMapper objectMapper, SessionTokenGenerator tokenGenerator, Clock clock) {
        this.properties = properties;
        this.objectMapper = objectMapper;
        this.tokenGenerator = tokenGenerator;
        this.clock = clock;
    }

    public String create(String provider, String redirect) {
        return create(provider, redirect, null);
    }

    public String create(String provider, String redirect, String origin) {
        StatePayload payload = new StatePayload(
                provider,
                sanitizeRedirect(redirect),
                sanitizeOrigin(origin),
                Instant.now(clock).getEpochSecond(),
                tokenGenerator.generate()
        );
        String encodedPayload = encodePayload(payload);
        return encodedPayload + "." + sign(encodedPayload);
    }

    public StatePayload verify(String expectedProvider, String state) {
        if (!StringUtils.hasText(state)) {
            throw new BusinessException(ErrorCode.BAD_REQUEST);
        }

        String[] parts = state.split("\\.", 2);
        if (parts.length != 2 || !constantTimeEquals(sign(parts[0]), parts[1])) {
            throw new BusinessException(ErrorCode.BAD_REQUEST);
        }

        StatePayload payload = decodePayload(parts[0]);
        if (!expectedProvider.equals(payload.provider())) {
            throw new BusinessException(ErrorCode.BAD_REQUEST);
        }

        Instant issuedAt = Instant.ofEpochSecond(payload.issuedAtEpochSecond());
        Instant now = Instant.now(clock);
        if (issuedAt.isAfter(now.plusSeconds(30)) || issuedAt.plus(STATE_TTL).isBefore(now)) {
            throw new BusinessException(ErrorCode.BAD_REQUEST);
        }

        return new StatePayload(
                payload.provider(),
                sanitizeRedirect(payload.redirect()),
                sanitizeOrigin(payload.origin()),
                payload.issuedAtEpochSecond(),
                payload.nonce()
        );
    }

    private String sanitizeRedirect(String rawRedirect) {
        if (!StringUtils.hasText(rawRedirect)) {
            return DEFAULT_REDIRECT_PATH;
        }

        String redirect = rawRedirect.trim();
        if (redirect.length() > MAX_REDIRECT_LENGTH
                || !redirect.startsWith("/")
                || redirect.startsWith("//")
                || redirect.startsWith("/\\")) {
            return DEFAULT_REDIRECT_PATH;
        }

        try {
            URI uri = new URI(redirect);
            if (uri.isAbsolute() || uri.getHost() != null || uri.getRawPath() == null) {
                return DEFAULT_REDIRECT_PATH;
            }
            return redirect;
        } catch (URISyntaxException exception) {
            return DEFAULT_REDIRECT_PATH;
        }
    }

    private String sanitizeOrigin(String rawOrigin) {
        if (!StringUtils.hasText(rawOrigin)) {
            return null;
        }

        String origin = rawOrigin.trim();
        if (origin.length() > MAX_ORIGIN_LENGTH) {
            return null;
        }

        try {
            URI uri = new URI(origin);
            if (!StringUtils.hasText(uri.getScheme())
                    || (!"http".equals(uri.getScheme()) && !"https".equals(uri.getScheme()))
                    || !StringUtils.hasText(uri.getHost())
                    || StringUtils.hasText(uri.getRawPath())
                    || StringUtils.hasText(uri.getRawQuery())
                    || StringUtils.hasText(uri.getRawFragment())) {
                return null;
            }

            String normalizedOrigin = uri.toString().replaceAll("/+$", "");
            boolean allowed = properties.getApp().requireAllowedOrigins().stream()
                    .map(value -> value.replaceAll("/+$", ""))
                    .anyMatch(normalizedOrigin::equals);
            return allowed ? normalizedOrigin : null;
        } catch (IllegalArgumentException | URISyntaxException exception) {
            return null;
        }
    }

    private String encodePayload(StatePayload payload) {
        try {
            byte[] json = objectMapper.writeValueAsBytes(payload);
            return Base64.getUrlEncoder().withoutPadding().encodeToString(json);
        } catch (JsonProcessingException exception) {
            throw new BusinessException(ErrorCode.INTERNAL_ERROR);
        }
    }

    private StatePayload decodePayload(String encodedPayload) {
        try {
            byte[] json = Base64.getUrlDecoder().decode(encodedPayload);
            return objectMapper.readValue(json, StatePayload.class);
        } catch (IllegalArgumentException | IOException exception) {
            throw new BusinessException(ErrorCode.BAD_REQUEST);
        }
    }

    private String sign(String encodedPayload) {
        String hashSalt = properties.getSecurity().getHashSalt();
        if (!StringUtils.hasText(hashSalt)) {
            throw new IllegalStateException("HASH_SALT must be configured.");
        }

        try {
            Mac mac = Mac.getInstance(HMAC_ALGORITHM);
            mac.init(new SecretKeySpec(hashSalt.getBytes(StandardCharsets.UTF_8), HMAC_ALGORITHM));
            return Base64.getUrlEncoder().withoutPadding().encodeToString(mac.doFinal(encodedPayload.getBytes(StandardCharsets.UTF_8)));
        } catch (NoSuchAlgorithmException exception) {
            throw new IllegalStateException("HMAC-SHA256 is not available.");
        } catch (java.security.InvalidKeyException exception) {
            throw new IllegalStateException("HASH_SALT is not valid for OAuth state signing.");
        }
    }

    private boolean constantTimeEquals(String first, String second) {
        return MessageDigest.isEqual(
                first.getBytes(StandardCharsets.UTF_8),
                second.getBytes(StandardCharsets.UTF_8)
        );
    }

    public record StatePayload(
            String provider,
            String redirect,
            String origin,
            long issuedAtEpochSecond,
            String nonce
    ) {
    }
}
