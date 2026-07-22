package ai.minsi.dto.admin;

import jakarta.validation.constraints.Size;

public record AdminResearchFeedbackUpdateRequest(
        @Size(max = 32)
        String reviewStatus,

        @Size(max = 1000)
        String displayText,

        @Size(max = 1000)
        String redactedText,

        @Size(max = 64)
        String rejectionReasonCode
) {
}
