package ai.minsi.dto.admin;

import java.time.LocalDateTime;

public record AdminResearchFeedbackDetail(
        Long id,
        String rating,
        String feedbackType,
        String feedbackText,
        String reviewStatus,
        String displayText,
        String redactedText,
        String rejectionReasonCode,
        LocalDateTime createdAt,
        LocalDateTime reviewedAt
) {
}
