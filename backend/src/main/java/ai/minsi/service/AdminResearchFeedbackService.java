package ai.minsi.service;

import ai.minsi.common.BusinessException;
import ai.minsi.common.ErrorCode;
import ai.minsi.dto.admin.AdminResearchFeedbackDetail;
import ai.minsi.dto.admin.AdminResearchFeedbackListItem;
import ai.minsi.dto.admin.AdminResearchFeedbackPageResponse;
import ai.minsi.dto.admin.AdminResearchFeedbackUpdateRequest;
import ai.minsi.entity.ResearchFeedback;
import ai.minsi.mapper.ResearchFeedbackMapper;
import ai.minsi.security.AdminAuthenticatedUser;
import com.baomidou.mybatisplus.core.toolkit.Wrappers;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.util.StringUtils;

import java.time.LocalDateTime;
import java.util.LinkedHashMap;
import java.util.LinkedHashSet;
import java.util.List;
import java.util.Locale;
import java.util.Map;
import java.util.Set;
import java.util.regex.Pattern;

@Service
public class AdminResearchFeedbackService {

    public static final String STATUS_PENDING = "pending";
    public static final String STATUS_APPROVED = "approved";
    public static final String STATUS_REJECTED = "rejected";

    private static final int DEFAULT_LIMIT = 20;
    private static final Set<Integer> ALLOWED_LIMITS = Set.of(20, 50);
    private static final int PREVIEW_MAX_LENGTH = 120;
    private static final Pattern REJECTION_REASON_CODE = Pattern.compile("[a-z0-9_-]{1,64}");
    private static final Set<String> ALLOWED_STATUSES = Set.of(STATUS_PENDING, STATUS_APPROVED, STATUS_REJECTED);

    private final ResearchFeedbackMapper researchFeedbackMapper;
    private final AdminAuthorizationService adminAuthorizationService;
    private final AdminAuditService adminAuditService;

    public AdminResearchFeedbackService(
            ResearchFeedbackMapper researchFeedbackMapper,
            AdminAuthorizationService adminAuthorizationService,
            AdminAuditService adminAuditService
    ) {
        this.researchFeedbackMapper = researchFeedbackMapper;
        this.adminAuthorizationService = adminAuthorizationService;
        this.adminAuditService = adminAuditService;
    }

    public AdminResearchFeedbackPageResponse list(
            AdminAuthenticatedUser adminUser,
            String reviewStatus,
            Integer page,
            Integer limit
    ) {
        adminAuthorizationService.requireModeratorOrOwner(adminUser);
        String normalizedStatus = normalizeStatusOrDefault(reviewStatus);
        int normalizedPage = normalizePage(page);
        int normalizedLimit = normalizeLimit(limit);
        long offset = (long) (normalizedPage - 1) * normalizedLimit;
        long totalCount = researchFeedbackMapper.selectCount(
                Wrappers.lambdaQuery(ResearchFeedback.class)
                        .eq(ResearchFeedback::getReviewStatus, normalizedStatus)
        );

        List<AdminResearchFeedbackListItem> items = researchFeedbackMapper.selectList(
                        Wrappers.lambdaQuery(ResearchFeedback.class)
                                .eq(ResearchFeedback::getReviewStatus, normalizedStatus)
                                .orderByAsc(ResearchFeedback::getCreatedAt)
                                .last("LIMIT " + normalizedLimit + " OFFSET " + offset)
                )
                .stream()
                .map(this::toListItem)
                .toList();

        return new AdminResearchFeedbackPageResponse(
                items,
                normalizedPage,
                normalizedLimit,
                totalCount,
                normalizedPage > 1,
                offset + items.size() < totalCount
        );
    }

    public AdminResearchFeedbackDetail get(AdminAuthenticatedUser adminUser, Long id) {
        adminAuthorizationService.requireModeratorOrOwner(adminUser);
        return toDetail(findById(id));
    }

    @Transactional
    public AdminResearchFeedbackDetail update(
            AdminAuthenticatedUser adminUser,
            Long id,
            AdminResearchFeedbackUpdateRequest request,
            AdminAuditService.AdminAuditContext auditContext
    ) {
        adminAuthorizationService.requireModeratorOrOwner(adminUser);

        ResearchFeedback feedback = findById(id);
        String fromStatus = statusOf(feedback);
        LinkedHashSet<String> changedFields = new LinkedHashSet<>();

        if (request.reviewStatus() != null) {
            String normalizedStatus = normalizeStatus(request.reviewStatus());
            feedback.setReviewStatus(normalizedStatus);
            feedback.setApproved(STATUS_APPROVED.equals(normalizedStatus));
            changedFields.add("review_status");
        }

        if (request.displayText() != null) {
            feedback.setDisplayText(normalizeOptionalPublicText(request.displayText()));
            changedFields.add("display_text");
        }

        if (request.redactedText() != null) {
            feedback.setRedactedText(normalizeOptionalPublicText(request.redactedText()));
            changedFields.add("redacted_text");
        }

        if (request.rejectionReasonCode() != null) {
            feedback.setRejectionReasonCode(normalizeRejectionReasonCode(request.rejectionReasonCode()));
            changedFields.add("rejection_reason_code");
        }

        if (changedFields.isEmpty()) {
            throw new BusinessException(ErrorCode.BAD_REQUEST);
        }

        String toStatus = statusOf(feedback);
        if (STATUS_APPROVED.equals(toStatus) && !StringUtils.hasText(publicText(feedback))) {
            throw new BusinessException(ErrorCode.BAD_REQUEST);
        }

        feedback.setReviewedAt(LocalDateTime.now());
        feedback.setReviewedByAdminId(adminUser.adminUserId());
        researchFeedbackMapper.updateById(feedback);

        adminAuditService.record(
                adminUser,
                actionFor(fromStatus, toStatus, changedFields),
                "research_feedback",
                String.valueOf(feedback.getId()),
                "success",
                auditContext,
                auditMetadata(fromStatus, toStatus, changedFields)
        );

        return toDetail(feedback);
    }

    private ResearchFeedback findById(Long id) {
        if (id == null) {
            throw new BusinessException(ErrorCode.BAD_REQUEST);
        }

        ResearchFeedback feedback = researchFeedbackMapper.selectById(id);
        if (feedback == null) {
            throw new BusinessException(ErrorCode.NOT_FOUND);
        }
        return feedback;
    }

    private AdminResearchFeedbackListItem toListItem(ResearchFeedback feedback) {
        return new AdminResearchFeedbackListItem(
                feedback.getId(),
                feedback.getRating(),
                feedback.getFeedbackType(),
                preview(feedback.getFeedbackText()),
                statusOf(feedback),
                feedback.getDisplayText(),
                feedback.getRedactedText(),
                feedback.getCreatedAt(),
                feedback.getReviewedAt()
        );
    }

    private AdminResearchFeedbackDetail toDetail(ResearchFeedback feedback) {
        return new AdminResearchFeedbackDetail(
                feedback.getId(),
                feedback.getRating(),
                feedback.getFeedbackType(),
                feedback.getFeedbackText(),
                statusOf(feedback),
                feedback.getDisplayText(),
                feedback.getRedactedText(),
                feedback.getRejectionReasonCode(),
                feedback.getCreatedAt(),
                feedback.getReviewedAt()
        );
    }

    private Map<String, Object> auditMetadata(String fromStatus, String toStatus, Set<String> changedFields) {
        Map<String, Object> metadata = new LinkedHashMap<>();
        metadata.put("from_status", fromStatus);
        metadata.put("to_status", toStatus);
        metadata.put("field_names", List.copyOf(changedFields));
        return metadata;
    }

    private String actionFor(String fromStatus, String toStatus, Set<String> changedFields) {
        if (changedFields.contains("review_status") && STATUS_APPROVED.equals(toStatus)) {
            return "research_feedback.approve";
        }
        if (changedFields.contains("review_status") && STATUS_REJECTED.equals(toStatus)) {
            return "research_feedback.reject";
        }
        if (changedFields.contains("display_text") || changedFields.contains("redacted_text")) {
            return "research_feedback.redact";
        }
        if (!fromStatus.equals(toStatus)) {
            return "research_feedback.update_status";
        }
        return "research_feedback.update";
    }

    private String normalizeStatusOrDefault(String reviewStatus) {
        if (!StringUtils.hasText(reviewStatus)) {
            return STATUS_PENDING;
        }
        return normalizeStatus(reviewStatus);
    }

    private String normalizeStatus(String reviewStatus) {
        String normalized = reviewStatus.trim().toLowerCase(Locale.ROOT);
        if (!ALLOWED_STATUSES.contains(normalized)) {
            throw new BusinessException(ErrorCode.BAD_REQUEST);
        }
        return normalized;
    }

    private int normalizeLimit(Integer limit) {
        if (limit == null) {
            return DEFAULT_LIMIT;
        }
        if (!ALLOWED_LIMITS.contains(limit)) {
            throw new BusinessException(ErrorCode.BAD_REQUEST);
        }
        return limit;
    }

    private int normalizePage(Integer page) {
        if (page == null) {
            return 1;
        }
        if (page < 1) {
            throw new BusinessException(ErrorCode.BAD_REQUEST);
        }
        return page;
    }

    private String normalizeOptionalPublicText(String value) {
        String normalized = value.strip();
        if (!StringUtils.hasText(normalized)) {
            return null;
        }
        if (normalized.codePointCount(0, normalized.length()) > ResearchFeedbackService.FEEDBACK_TEXT_MAX_LENGTH) {
            throw new BusinessException(ErrorCode.BAD_REQUEST);
        }
        return normalized;
    }

    private String normalizeRejectionReasonCode(String value) {
        String normalized = value.trim().toLowerCase(Locale.ROOT);
        if (!StringUtils.hasText(normalized)) {
            return null;
        }
        if (!REJECTION_REASON_CODE.matcher(normalized).matches()) {
            throw new BusinessException(ErrorCode.BAD_REQUEST);
        }
        return normalized;
    }

    private String publicText(ResearchFeedback feedback) {
        if (StringUtils.hasText(feedback.getRedactedText())) {
            return feedback.getRedactedText();
        }
        return feedback.getDisplayText();
    }

    private String statusOf(ResearchFeedback feedback) {
        if (StringUtils.hasText(feedback.getReviewStatus())) {
            return feedback.getReviewStatus();
        }
        return Boolean.TRUE.equals(feedback.getApproved()) ? STATUS_APPROVED : STATUS_PENDING;
    }

    private String preview(String text) {
        if (!StringUtils.hasText(text)) {
            return "";
        }
        String normalized = text.strip();
        int length = normalized.codePointCount(0, normalized.length());
        if (length <= PREVIEW_MAX_LENGTH) {
            return normalized;
        }
        return normalized.offsetByCodePoints(0, PREVIEW_MAX_LENGTH) > 0
                ? normalized.substring(0, normalized.offsetByCodePoints(0, PREVIEW_MAX_LENGTH)) + "..."
                : "";
    }
}
