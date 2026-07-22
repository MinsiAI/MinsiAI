package ai.minsi.dto.voice;

public record VoiceSessionResponse(
        String voiceToken,
        long expiresInSeconds,
        String realtimeClientSecret,
        long realtimeClientSecretExpiresAt,
        String realtimeModel
) {
}
