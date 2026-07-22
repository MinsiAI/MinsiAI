package ai.minsi.client;

import java.util.Arrays;

public record VoiceSpeechResult(
        String contentType,
        byte[] audioBytes
) {
    public VoiceSpeechResult {
        contentType = contentType == null ? "" : contentType.trim();
        audioBytes = audioBytes == null ? new byte[0] : Arrays.copyOf(audioBytes, audioBytes.length);
    }

    public static VoiceSpeechResult empty() {
        return new VoiceSpeechResult("", new byte[0]);
    }

    public boolean hasAudio() {
        return audioBytes.length > 0;
    }

    @Override
    public byte[] audioBytes() {
        return Arrays.copyOf(audioBytes, audioBytes.length);
    }
}
