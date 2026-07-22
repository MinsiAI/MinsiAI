package ai.minsi.client;

public record RealtimeVoiceSession(
        String clientSecret,
        long clientSecretExpiresAt,
        String model
) {
    public static RealtimeVoiceSession empty() {
        return new RealtimeVoiceSession("", 0, "");
    }
}
