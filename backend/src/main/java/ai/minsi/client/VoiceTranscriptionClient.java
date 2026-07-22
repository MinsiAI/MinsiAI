package ai.minsi.client;

public interface VoiceTranscriptionClient {

    VoiceTranscriptionResult transcribe(VoiceAudioInput input);
}
