package ai.minsi.client;

public final class MockVoiceTranscriptionClient implements VoiceTranscriptionClient {

    private static final String MOCK_TEXT = "我想和你聊聊现在的感受。";

    @Override
    public VoiceTranscriptionResult transcribe(VoiceAudioInput input) {
        if (input == null || (!input.hasAudioSample() && !input.hasAudioBytes())) {
            throw new IllegalArgumentException("audio input is required.");
        }

        return new VoiceTranscriptionResult(MOCK_TEXT);
    }
}
