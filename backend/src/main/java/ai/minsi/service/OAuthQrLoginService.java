package ai.minsi.service;

import ai.minsi.util.HashUtils;
import ai.minsi.util.SessionTokenGenerator;
import org.springframework.data.redis.core.StringRedisTemplate;
import org.springframework.stereotype.Service;

import java.time.Duration;
import java.util.Map;
import java.util.Optional;

@Service
public class OAuthQrLoginService {

    private static final Duration RESULT_TTL = Duration.ofMinutes(10);
    private static final String SESSION_TOKEN_FIELD = "session_token";
    private static final String SESSION_MAX_AGE_SECONDS_FIELD = "session_max_age_seconds";
    private static final String REDIRECT_FIELD = "redirect";

    private final StringRedisTemplate redisTemplate;
    private final HashUtils hashUtils;
    private final SessionTokenGenerator tokenGenerator;

    public OAuthQrLoginService(StringRedisTemplate redisTemplate, HashUtils hashUtils, SessionTokenGenerator tokenGenerator) {
        this.redisTemplate = redisTemplate;
        this.hashUtils = hashUtils;
        this.tokenGenerator = tokenGenerator;
    }

    public String registerLaunch(String provider, String authorizeUrl) {
        String token = tokenGenerator.generate();
        String key = launchKey(provider, token);
        redisTemplate.opsForValue().set(key, authorizeUrl, RESULT_TTL);
        return token;
    }

    public Optional<String> resolveLaunch(String provider, String token) {
        String authorizeUrl = redisTemplate.opsForValue().get(launchKey(provider, token));
        return Optional.ofNullable(authorizeUrl);
    }

    public void markCompleted(String provider, String state, String redirect, SessionService.CreatedSession session) {
        String key = resultKey(provider, state);
        redisTemplate.opsForHash().putAll(key, Map.of(
                SESSION_TOKEN_FIELD, session.token(),
                SESSION_MAX_AGE_SECONDS_FIELD, String.valueOf(session.maxAge().toSeconds()),
                REDIRECT_FIELD, redirect
        ));
        redisTemplate.expire(key, RESULT_TTL);
    }

    public Optional<CompletedLogin> consume(String provider, String state) {
        String key = resultKey(provider, state);
        Map<Object, Object> values = redisTemplate.opsForHash().entries(key);
        if (values.isEmpty()) {
            return Optional.empty();
        }

        redisTemplate.delete(key);
        String sessionToken = text(values.get(SESSION_TOKEN_FIELD));
        String redirect = text(values.get(REDIRECT_FIELD));
        Long maxAgeSeconds = parseLong(values.get(SESSION_MAX_AGE_SECONDS_FIELD));
        if (sessionToken.isBlank() || redirect.isBlank() || maxAgeSeconds == null || maxAgeSeconds <= 0) {
            return Optional.empty();
        }

        return Optional.of(new CompletedLogin(sessionToken, Duration.ofSeconds(maxAgeSeconds), redirect));
    }

    private String resultKey(String provider, String state) {
        return "oauth:qr:" + provider + ":" + hashUtils.sha256WithConfiguredSalt(state);
    }

    private String launchKey(String provider, String token) {
        return "oauth:qr:launch:" + provider + ":" + hashUtils.sha256WithConfiguredSalt(token);
    }

    private String text(Object value) {
        return value == null ? "" : String.valueOf(value);
    }

    private Long parseLong(Object value) {
        try {
            return Long.valueOf(String.valueOf(value));
        } catch (NumberFormatException exception) {
            return null;
        }
    }

    public record CompletedLogin(String sessionToken, Duration maxAge, String redirect) {
    }
}
