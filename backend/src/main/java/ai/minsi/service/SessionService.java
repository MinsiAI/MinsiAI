package ai.minsi.service;

import ai.minsi.entity.User;
import ai.minsi.security.AuthenticatedUser;
import ai.minsi.util.HashUtils;
import ai.minsi.util.SessionTokenGenerator;
import org.springframework.data.redis.core.StringRedisTemplate;
import org.springframework.stereotype.Service;

import java.time.Duration;
import java.time.Instant;
import java.util.Map;
import java.util.Optional;

@Service
public class SessionService {

    public static final Duration SESSION_TTL = Duration.ofDays(30);

    private static final String USER_ID_FIELD = "user_id";
    private static final String EXPIRES_AT_FIELD = "expires_at";

    private final StringRedisTemplate redisTemplate;
    private final HashUtils hashUtils;
    private final SessionTokenGenerator sessionTokenGenerator;
    private final UserService userService;

    public SessionService(
            StringRedisTemplate redisTemplate,
            HashUtils hashUtils,
            SessionTokenGenerator sessionTokenGenerator,
            UserService userService
    ) {
        this.redisTemplate = redisTemplate;
        this.hashUtils = hashUtils;
        this.sessionTokenGenerator = sessionTokenGenerator;
        this.userService = userService;
    }

    public CreatedSession createSession(Long userId) {
        String sessionToken = sessionTokenGenerator.generate();
        String sessionHash = hashUtils.sha256WithConfiguredSalt(sessionToken);
        String key = sessionKey(sessionHash);
        Instant expiresAt = Instant.now().plus(SESSION_TTL);

        redisTemplate.opsForHash().putAll(key, Map.of(
                USER_ID_FIELD, String.valueOf(userId),
                EXPIRES_AT_FIELD, expiresAt.toString()
        ));
        redisTemplate.expire(key, SESSION_TTL);

        return new CreatedSession(sessionToken, SESSION_TTL);
    }

    public Optional<AuthenticatedUser> authenticate(String sessionToken) {
        String sessionHash = hashUtils.sha256WithConfiguredSalt(sessionToken);
        String key = sessionKey(sessionHash);
        Object userIdValue = redisTemplate.opsForHash().get(key, USER_ID_FIELD);
        if (userIdValue == null) {
            return Optional.empty();
        }

        Long userId = parseUserId(userIdValue);
        if (userId == null) {
            redisTemplate.delete(key);
            return Optional.empty();
        }

        Optional<User> user = userService.findActiveById(userId);
        return user.map(value -> new AuthenticatedUser(
                value.getId(),
                value.getEmail(),
                value.getAuthProvider(),
                providerLabel(value.getAuthProvider())
        ));
    }

    public void revoke(String sessionToken) {
        String sessionHash = hashUtils.sha256WithConfiguredSalt(sessionToken);
        redisTemplate.delete(sessionKey(sessionHash));
    }

    private Long parseUserId(Object userIdValue) {
        try {
            return Long.valueOf(String.valueOf(userIdValue));
        } catch (NumberFormatException exception) {
            return null;
        }
    }

    private String sessionKey(String sessionHash) {
        return "session:" + sessionHash;
    }

    private String providerLabel(String authProvider) {
        return switch (authProvider) {
            case "wechat" -> "微信";
            case "qq" -> "QQ";
            default -> "邮箱";
        };
    }

    public record CreatedSession(String token, Duration maxAge) {
    }
}
