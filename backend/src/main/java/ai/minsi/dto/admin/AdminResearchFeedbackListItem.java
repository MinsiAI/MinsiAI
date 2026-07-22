package ai.minsi.dto.admin;

import java.time.LocalDateTime;

public record AdminResearchFeedbackListItem(
        Long id,
        String rating,
        String feedbackType,
        String feedbackPreview,
        String reviewStatus,
        String displayText,
        String redactedText,
        LocalDateTime createdAt,
        LocalDateTime reviewedAt
) {
}
