package ai.minsi.client;

public record VoiceTranscriptionResult(String text) {
    public VoiceTranscriptionResult {
        text = text == null ? "" : text.trim();
    }
}
