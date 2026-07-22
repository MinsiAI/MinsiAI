package ai.minsi.dto.research;

public record ResearchFeedbackSubmitResponse(
        boolean accepted,
        boolean publiclyVisible
) {
}
