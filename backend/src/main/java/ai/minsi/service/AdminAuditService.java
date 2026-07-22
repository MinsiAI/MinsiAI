package ai.minsi.service;

import ai.minsi.entity.AdminAuditLog;
import ai.minsi.entity.AdminUser;
import ai.minsi.mapper.AdminAuditLogMapper;
import ai.minsi.security.AdminAuthenticatedUser;
import ai.minsi.util.HashUtils;
import ai.minsi.util.IpUtils;
import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.ObjectMapper;
import jakarta.servlet.http.HttpServletRequest;
import org.springframework.stereotype.Service;
import org.springframework.util.StringUtils;

import java.time.LocalDateTime;
import java.util.Collection;
import java.util.LinkedHashMap;
import java.util.Map;
import java.util.Set;
import java.util.UUID;
import java.util.regex.Pattern;

@Service
public class AdminAuditService {

    private static final Pattern SAFE_REQUEST_ID = Pattern.compile("[A-Za-z0-9._:-]{1,128}");
    private static final int MAX_METADATA_VALUE_LENGTH = 128;
    private static final Set<String> ALLOWED_METADATA_KEYS = Set.of(
            "from_status",
            "to_status",
            "field_names"
    );

    private final AdminAuditLogMapper adminAuditLogMapper;
    private final HashUtils hashUtils;
    private final ObjectMapper objectMapper;

    public AdminAuditService(AdminAuditLogMapper adminAuditLogMapper, HashUtils hashUtils) {
        this.adminAuditLogMapper = adminAuditLogMapper;
        this.hashUtils = hashUtils;
        this.objectMapper = new ObjectMapper();
    }

    public AdminAuditContext contextFrom(HttpServletRequest request) {
        String requestId = safeRequestId(request.getHeader("X-Request-Id"));
        String clientIp = IpUtils.resolveClientIp(request);
        String ipHash = hashUtils.sha256WithConfiguredSalt(clientIp == null ? "" : clientIp);
        return new AdminAuditContext(requestId, ipHash);
    }

    public void record(
            AdminAuthenticatedUser adminUser,
            String action,
            String targetType,
            String targetId,
            String result,
            AdminAuditContext context,
            Map<String, ?> metadata
    ) {
        insert(
                adminUser.adminUserId(),
                adminUser.adminUserHash(),
                action,
                targetType,
                targetId,
                result,
                context,
                metadata
        );
    }

    public void record(
            AdminUser adminUser,
            String action,
            String targetType,
            String targetId,
            String result,
            AdminAuditContext context,
            Map<String, ?> metadata
    ) {
        insert(
                adminUser.getId(),
                hashUtils.sha256WithConfiguredSalt(String.valueOf(adminUser.getId())),
                action,
                targetType,
                targetId,
                result,
                context,
                metadata
        );
    }

    private void insert(
            Long adminUserId,
            String adminUserHash,
            String action,
            String targetType,
            String targetId,
            String result,
            AdminAuditContext context,
            Map<String, ?> metadata
    ) {
        AdminAuditLog auditLog = new AdminAuditLog();
        auditLog.setAdminUserId(adminUserId);
        auditLog.setAdminUserHash(adminUserHash);
        auditLog.setAction(action);
        auditLog.setTargetType(targetType);
        auditLog.setTargetId(targetId);
        auditLog.setResult(result);
        auditLog.setRequestId(context.requestId());
        auditLog.setIpHash(context.ipHash());
        auditLog.setMetadataRedacted(toMetadataJson(metadata));
        auditLog.setCreatedAt(LocalDateTime.now());
        adminAuditLogMapper.insert(auditLog);
    }

    private String safeRequestId(String requestId) {
        if (StringUtils.hasText(requestId) && SAFE_REQUEST_ID.matcher(requestId.trim()).matches()) {
            return requestId.trim();
        }
        return UUID.randomUUID().toString();
    }

    private String toMetadataJson(Map<String, ?> metadata) {
        Map<String, Object> sanitized = sanitizeMetadata(metadata);
        if (sanitized.isEmpty()) {
            return null;
        }

        try {
            return objectMapper.writeValueAsString(sanitized);
        } catch (JsonProcessingException exception) {
            return null;
        }
    }

    private Map<String, Object> sanitizeMetadata(Map<String, ?> metadata) {
        Map<String, Object> sanitized = new LinkedHashMap<>();
        if (metadata == null || metadata.isEmpty()) {
            return sanitized;
        }

        for (Map.Entry<String, ?> entry : metadata.entrySet()) {
            if (!ALLOWED_METADATA_KEYS.contains(entry.getKey())) {
                continue;
            }
            Object safeValue = sanitizeMetadataValue(entry.getValue());
            if (safeValue != null) {
                sanitized.put(entry.getKey(), safeValue);
            }
        }

        return sanitized;
    }

    private Object sanitizeMetadataValue(Object value) {
        if (value == null) {
            return null;
        }

        if (value instanceof Collection<?> collection) {
            return collection.stream()
                    .map(this::sanitizeText)
                    .filter(StringUtils::hasText)
                    .toList();
        }

        return sanitizeText(value);
    }

    private String sanitizeText(Object value) {
        String text = String.valueOf(value)
                .replace('\n', ' ')
                .replace('\r', ' ')
                .trim();
        if (!StringUtils.hasText(text)) {
            return null;
        }
        if (text.length() > MAX_METADATA_VALUE_LENGTH) {
            return text.substring(0, MAX_METADATA_VALUE_LENGTH);
        }
        return text;
    }

    public record AdminAuditContext(String requestId, String ipHash) {
    }
}
