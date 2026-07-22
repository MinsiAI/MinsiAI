package ai.minsi.dto.research;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

import java.util.List;

public record ResearchFeedbackSubmitRequest(
        @NotBlank
        @Size(max = 64)
        String rating,

        @Size(max = 7)
        List<@NotBlank @Size(max = 16) String> feedbackTypes,

        String feedbackText
) {
}
