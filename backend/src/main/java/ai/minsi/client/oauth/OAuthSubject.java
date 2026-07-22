package ai.minsi.client.oauth;

public record OAuthSubject(
        OAuthProvider provider,
        String subject
) {
}
