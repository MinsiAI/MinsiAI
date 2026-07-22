package ai.minsi.dto.research;

public record ApprovedResearchFeedbackResponse(
        String feedbackText,
        String feedbackType,
        String rating,
        String displayRegion
) {
}
