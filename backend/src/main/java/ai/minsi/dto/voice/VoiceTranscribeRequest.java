package ai.minsi.dto.voice;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

public record VoiceTranscribeRequest(
        @NotBlank
        String voiceToken,

        @NotBlank
        @Size(max = 32768)
        String audioSample,

        @Size(max = 128)
        String mimeType
) {
    public VoiceTranscribeRequest {
        voiceToken = voiceToken == null ? "" : voiceToken.trim();
        audioSample = audioSample == null ? "" : audioSample.trim();
        mimeType = mimeType == null ? "" : mimeType.trim();
    }
}
