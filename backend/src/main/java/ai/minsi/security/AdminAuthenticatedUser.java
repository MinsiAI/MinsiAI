package ai.minsi.security;

public record AdminAuthenticatedUser(
        Long adminUserId,
        String adminUserHash,
        String emailMasked,
        String role
) {
}
