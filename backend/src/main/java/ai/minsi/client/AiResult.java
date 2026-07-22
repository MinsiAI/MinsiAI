package ai.minsi.client;

import ai.minsi.dto.chat.SafetyLevel;

import java.util.List;

public record AiResult(
        String text,
        SafetyLevel safetyLevel,
        List<String> suggestedActions
) {
    public AiResult {
        suggestedActions = suggestedActions == null ? List.of() : List.copyOf(suggestedActions);
    }
}
