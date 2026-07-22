package ai.minsi.dto.user;

public record MeResponse(
        boolean authenticated,
        String emailMasked,
        String authProvider,
        String providerLabel
) {
}
