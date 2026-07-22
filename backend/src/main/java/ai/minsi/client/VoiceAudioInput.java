package ai.minsi.client;

import java.util.Arrays;

public record VoiceAudioInput(
        byte[] audioBytes,
        String audioSample,
        String mimeType,
        String filename
) {
    public VoiceAudioInput {
        audioBytes = audioBytes == null ? new byte[0] : Arrays.copyOf(audioBytes, audioBytes.length);
        audioSample = audioSample == null ? "" : audioSample.trim();
        mimeType = mimeType == null ? "" : mimeType.trim();
        filename = filename == null ? "" : filename.trim();
    }

    public static VoiceAudioInput fromSample(String audioSample, String mimeType) {
        return new VoiceAudioInput(new byte[0], audioSample, mimeType, "");
    }

    public static VoiceAudioInput fromBytes(byte[] audioBytes, String mimeType, String filename) {
        return new VoiceAudioInput(audioBytes, "", mimeType, filename);
    }

    public boolean hasAudioBytes() {
        return audioBytes.length > 0;
    }

    public boolean hasAudioSample() {
        return !audioSample.isBlank();
    }

    @Override
    public byte[] audioBytes() {
        return Arrays.copyOf(audioBytes, audioBytes.length);
    }
}
