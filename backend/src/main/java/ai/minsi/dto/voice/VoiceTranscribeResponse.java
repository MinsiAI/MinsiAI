package ai.minsi.dto.voice;

public record VoiceTranscribeResponse(String text) {
    public VoiceTranscribeResponse {
        text = text == null ? "" : text.trim();
    }
}
