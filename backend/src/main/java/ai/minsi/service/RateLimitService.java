package ai.minsi.service;

import ai.minsi.common.BusinessException;
import ai.minsi.common.ErrorCode;
import org.springframework.data.redis.core.StringRedisTemplate;
import org.springframework.stereotype.Service;

import java.time.Duration;
import java.util.Locale;
import java.util.Set;

@Service
public class RateLimitService {

    private static final Set<String> ALLOWED_SCOPES = Set.of("ip", "user");

    private final StringRedisTemplate redisTemplate;

    public RateLimitService(StringRedisTemplate redisTemplate) {
        this.redisTemplate = redisTemplate;
    }

    public boolean isAllowed(String subjectHash, String endpoint, int maxRequests, Duration window) {
        return isAllowed("user", subjectHash, endpoint, maxRequests, window);
    }

    public boolean isAllowed(String scope, String subjectHash, String endpoint, int maxRequests, Duration window) {
        validateInputs(subjectHash, endpoint, maxRequests, window);
        String normalizedScope = normalizeScope(scope);
        String key = "rate:%s:%s:%s".formatted(normalizedScope, subjectHash, endpoint);
        Long count = redisTemplate.opsForValue().increment(key);
        if (count != null && count == 1L) {
            redisTemplate.expire(key, window);
        }
        return count != null && count <= maxRequests;
    }

    public void checkAllowed(String subjectHash, String endpoint, int maxRequests, Duration window) {
        if (!isAllowed(subjectHash, endpoint, maxRequests, window)) {
            throw new BusinessException(ErrorCode.RATE_LIMITED);
        }
    }

    public void checkAllowed(String scope, String subjectHash, String endpoint, int maxRequests, Duration window) {
        if (!isAllowed(scope, subjectHash, endpoint, maxRequests, window)) {
            throw new BusinessException(ErrorCode.RATE_LIMITED);
        }
    }

    private String normalizeScope(String scope) {
        if (scope == null) {
            throw new IllegalArgumentException("scope is required.");
        }
        String normalizedScope = scope.toLowerCase(Locale.ROOT);
        if (!ALLOWED_SCOPES.contains(normalizedScope)) {
            throw new IllegalArgumentException("scope is not allowed.");
        }
        return normalizedScope;
    }

    private void validateInputs(String subjectHash, String endpoint, int maxRequests, Duration window) {
        if (subjectHash == null || subjectHash.isBlank()) {
            throw new IllegalArgumentException("subjectHash is required.");
        }
        if (endpoint == null || endpoint.isBlank()) {
            throw new IllegalArgumentException("endpoint is required.");
        }
        if (maxRequests < 1) {
            throw new IllegalArgumentException("maxRequests must be positive.");
        }
        if (window == null || window.isZero() || window.isNegative()) {
            throw new IllegalArgumentException("window must be positive.");
        }
    }
}
