package ai.minsi.dto.chat;

import java.util.List;

public record ChatResponse(
        String reply,
        SafetyLevel safetyLevel,
        List<String> suggestedActions,
        String replyAudioContentType,
        String replyAudioBase64
) {
    public ChatResponse {
        suggestedActions = suggestedActions == null ? List.of() : List.copyOf(suggestedActions);
        replyAudioContentType = replyAudioContentType == null ? "" : replyAudioContentType.trim();
        replyAudioBase64 = replyAudioBase64 == null ? "" : replyAudioBase64.trim();
    }
}
