package ai.minsi.service;

import ai.minsi.entity.AdminUser;
import ai.minsi.security.AdminAuthenticatedUser;
import ai.minsi.util.EmailMasker;
import ai.minsi.util.HashUtils;
import ai.minsi.util.SessionTokenGenerator;
import org.springframework.data.redis.core.StringRedisTemplate;
import org.springframework.stereotype.Service;
import org.springframework.util.StringUtils;

import java.time.Duration;
import java.time.Instant;
import java.util.Map;
import java.util.Optional;

@Service
public class AdminSessionService {

    public static final Duration SESSION_TTL = Duration.ofHours(12);

    private static final String ADMIN_USER_ID_FIELD = "admin_user_id";
    private static final String ROLE_FIELD = "role";
    private static final String EXPIRES_AT_FIELD = "expires_at";

    private final StringRedisTemplate redisTemplate;
    private final HashUtils hashUtils;
    private final SessionTokenGenerator sessionTokenGenerator;
    private final AdminUserService adminUserService;

    public AdminSessionService(
            StringRedisTemplate redisTemplate,
            HashUtils hashUtils,
            SessionTokenGenerator sessionTokenGenerator,
            AdminUserService adminUserService
    ) {
        this.redisTemplate = redisTemplate;
        this.hashUtils = hashUtils;
        this.sessionTokenGenerator = sessionTokenGenerator;
        this.adminUserService = adminUserService;
    }

    public CreatedAdminSession createSession(AdminUser adminUser) {
        String sessionToken = sessionTokenGenerator.generate();
        String sessionHash = hashUtils.sha256WithConfiguredSalt(sessionToken);
        String key = sessionKey(sessionHash);
        Instant expiresAt = Instant.now().plus(SESSION_TTL);

        redisTemplate.opsForHash().putAll(key, Map.of(
                ADMIN_USER_ID_FIELD, String.valueOf(adminUser.getId()),
                ROLE_FIELD, adminUserService.normalizeRole(adminUser.getRole()),
                EXPIRES_AT_FIELD, expiresAt.toString()
        ));
        redisTemplate.expire(key, SESSION_TTL);

        return new CreatedAdminSession(sessionToken, SESSION_TTL);
    }

    public Optional<AdminAuthenticatedUser> authenticate(String sessionToken) {
        if (!StringUtils.hasText(sessionToken)) {
            return Optional.empty();
        }

        String sessionHash = hashUtils.sha256WithConfiguredSalt(sessionToken);
        String key = sessionKey(sessionHash);
        Object adminUserIdValue = redisTemplate.opsForHash().get(key, ADMIN_USER_ID_FIELD);
        if (adminUserIdValue == null) {
            return Optional.empty();
        }

        Long adminUserId = parseAdminUserId(adminUserIdValue);
        if (adminUserId == null) {
            redisTemplate.delete(key);
            return Optional.empty();
        }

        Optional<AdminUser> adminUser = adminUserService.findActiveById(adminUserId);
        if (adminUser.isEmpty()) {
            redisTemplate.delete(key);
            return Optional.empty();
        }

        return adminUser.map(this::toAuthenticatedUser);
    }

    public AdminAuthenticatedUser toAuthenticatedUser(AdminUser adminUser) {
        return new AdminAuthenticatedUser(
                adminUser.getId(),
                hashUtils.sha256WithConfiguredSalt(String.valueOf(adminUser.getId())),
                EmailMasker.mask(adminUser.getEmail()),
                adminUserService.normalizeRole(adminUser.getRole())
        );
    }

    public void revoke(String sessionToken) {
        if (!StringUtils.hasText(sessionToken)) {
            return;
        }
        String sessionHash = hashUtils.sha256WithConfiguredSalt(sessionToken);
        redisTemplate.delete(sessionKey(sessionHash));
    }

    private Long parseAdminUserId(Object adminUserIdValue) {
        try {
            return Long.valueOf(String.valueOf(adminUserIdValue));
        } catch (NumberFormatException exception) {
            return null;
        }
    }

    private String sessionKey(String sessionHash) {
        return "admin:session:" + sessionHash;
    }

    public record CreatedAdminSession(String token, Duration maxAge) {
    }
}
