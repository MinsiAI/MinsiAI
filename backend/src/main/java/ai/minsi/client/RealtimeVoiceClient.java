package ai.minsi.client;

public interface RealtimeVoiceClient {

    RealtimeVoiceSession createClientSecret(String safetyIdentifier);
}
