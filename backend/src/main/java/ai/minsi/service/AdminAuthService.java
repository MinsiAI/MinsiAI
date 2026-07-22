package ai.minsi.service;

import ai.minsi.client.EmailClient;
import ai.minsi.common.BusinessException;
import ai.minsi.common.ErrorCode;
import ai.minsi.entity.AdminUser;
import ai.minsi.security.AdminAuthenticatedUser;
import ai.minsi.util.HashUtils;
import ai.minsi.util.OtpCodeGenerator;
import org.springframework.data.redis.core.StringRedisTemplate;
import org.springframework.stereotype.Service;

import java.time.Duration;
import java.time.Instant;
import java.util.Locale;
import java.util.Map;

@Service
public class AdminAuthService {

    private static final Duration OTP_TTL = Duration.ofMinutes(10);
    private static final int MAX_VERIFY_ATTEMPTS = 5;
    private static final String START_ENDPOINT = "/api/admin/auth/email/start";
    private static final String VERIFY_ENDPOINT = "/api/admin/auth/email/verify";
    private static final String CODE_HASH_FIELD = "code_hash";
    private static final String ATTEMPT_COUNT_FIELD = "attempt_count";
    private static final String CREATED_AT_FIELD = "created_at";

    private final StringRedisTemplate redisTemplate;
    private final HashUtils hashUtils;
    private final RateLimitService rateLimitService;
    private final OtpCodeGenerator otpCodeGenerator;
    private final EmailClient emailClient;
    private final AdminUserService adminUserService;
    private final AdminSessionService adminSessionService;
    private final AdminAuditService adminAuditService;

    public AdminAuthService(
            StringRedisTemplate redisTemplate,
            HashUtils hashUtils,
            RateLimitService rateLimitService,
            OtpCodeGenerator otpCodeGenerator,
            EmailClient emailClient,
            AdminUserService adminUserService,
            AdminSessionService adminSessionService,
            AdminAuditService adminAuditService
    ) {
        this.redisTemplate = redisTemplate;
        this.hashUtils = hashUtils;
        this.rateLimitService = rateLimitService;
        this.otpCodeGenerator = otpCodeGenerator;
        this.emailClient = emailClient;
        this.adminUserService = adminUserService;
        this.adminSessionService = adminSessionService;
        this.adminAuditService = adminAuditService;
    }

    public void startEmailLogin(String email, String clientIp) {
        String normalizedEmail = normalizeEmail(email);
        String emailHash = hashUtils.sha256WithConfiguredSalt(normalizedEmail);
        String ipHash = hashUtils.sha256WithConfiguredSalt(clientIp == null ? "" : clientIp);

        rateLimitService.checkAllowed("ip", ipHash, START_ENDPOINT, 3, Duration.ofMinutes(1));
        rateLimitService.checkAllowed("user", emailHash, START_ENDPOINT, 10, Duration.ofHours(1));

        AdminUser adminUser = adminUserService.findActiveByEmail(normalizedEmail).orElse(null);
        if (adminUser == null) {
            return;
        }

        String code = otpCodeGenerator.generate();
        String codeHash = hashUtils.sha256WithConfiguredSalt(code);
        String key = otpKey(emailHash);

        redisTemplate.opsForHash().putAll(key, Map.of(
                CODE_HASH_FIELD, codeHash,
                ATTEMPT_COUNT_FIELD, "0",
                CREATED_AT_FIELD, Instant.now().toString()
        ));
        redisTemplate.expire(key, OTP_TTL);

        try {
            emailClient.sendVerificationCode(normalizedEmail, code);
        } catch (RuntimeException exception) {
            redisTemplate.delete(key);
            throw exception;
        }
    }

    public AdminLoginResult verifyEmailLogin(
            String email,
            String code,
            String clientIp,
            AdminAuditService.AdminAuditContext auditContext
    ) {
        String normalizedEmail = normalizeEmail(email);
        String emailHash = hashUtils.sha256WithConfiguredSalt(normalizedEmail);
        String ipHash = hashUtils.sha256WithConfiguredSalt(clientIp == null ? "" : clientIp);
        String key = otpKey(emailHash);

        rateLimitService.checkAllowed("ip", ipHash, VERIFY_ENDPOINT, 5, Duration.ofMinutes(15));

        AdminUser adminUser = adminUserService.findActiveByEmail(normalizedEmail)
                .orElseThrow(() -> new BusinessException(ErrorCode.BAD_REQUEST));

        Object expectedHashValue = redisTemplate.opsForHash().get(key, CODE_HASH_FIELD);
        if (expectedHashValue == null) {
            throw new BusinessException(ErrorCode.BAD_REQUEST);
        }

        int attempts = readAttemptCount(key);
        if (attempts >= MAX_VERIFY_ATTEMPTS) {
            redisTemplate.delete(key);
            throw new BusinessException(ErrorCode.BAD_REQUEST);
        }

        String suppliedHash = hashUtils.sha256WithConfiguredSalt(code);
        if (!HashUtils.constantTimeEquals(String.valueOf(expectedHashValue), suppliedHash)) {
            redisTemplate.opsForHash().increment(key, ATTEMPT_COUNT_FIELD, 1L);
            throw new BusinessException(ErrorCode.BAD_REQUEST);
        }

        adminUserService.touchLastLogin(adminUser);
        AdminSessionService.CreatedAdminSession session = adminSessionService.createSession(adminUser);
        redisTemplate.delete(key);
        adminAuditService.record(
                adminUser,
                "admin_login",
                "admin_session",
                null,
                "success",
                auditContext,
                Map.of()
        );
        return new AdminLoginResult(session, adminSessionService.toAuthenticatedUser(adminUser));
    }

    public void logout(String sessionToken, AdminAuthenticatedUser adminUser, AdminAuditService.AdminAuditContext auditContext) {
        adminSessionService.revoke(sessionToken);
        adminAuditService.record(
                adminUser,
                "admin_logout",
                "admin_session",
                null,
                "success",
                auditContext,
                Map.of()
        );
    }

    private int readAttemptCount(String key) {
        Object attemptCount = redisTemplate.opsForHash().get(key, ATTEMPT_COUNT_FIELD);
        if (attemptCount == null) {
            return 0;
        }

        try {
            return Integer.parseInt(String.valueOf(attemptCount));
        } catch (NumberFormatException exception) {
            return MAX_VERIFY_ATTEMPTS;
        }
    }

    private String normalizeEmail(String email) {
        if (email == null) {
            throw new BusinessException(ErrorCode.BAD_REQUEST);
        }
        return email.trim().toLowerCase(Locale.ROOT);
    }

    private String otpKey(String emailHash) {
        return "admin:otp:email:" + emailHash;
    }

    public record AdminLoginResult(
            AdminSessionService.CreatedAdminSession session,
            ai.minsi.security.AdminAuthenticatedUser adminUser
    ) {
    }
}
