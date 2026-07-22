package ai.minsi.client;

public final class MockVoiceSpeechClient implements VoiceSpeechClient {

    @Override
    public VoiceSpeechResult synthesize(String text) {
        return VoiceSpeechResult.empty();
    }
}
