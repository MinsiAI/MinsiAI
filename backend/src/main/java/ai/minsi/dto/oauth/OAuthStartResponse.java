package ai.minsi.dto.oauth;

public record OAuthStartResponse(
        String authorizeUrl,
        int expiresInSeconds,
        String state,
        String qrUrl
) {
}
