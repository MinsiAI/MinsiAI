package ai.minsi.security;

public record AuthenticatedUser(
        Long userId,
        String email,
        String authProvider,
        String providerLabel
) {
}
