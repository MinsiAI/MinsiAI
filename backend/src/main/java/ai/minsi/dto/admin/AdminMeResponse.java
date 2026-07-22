package ai.minsi.dto.admin;

public record AdminMeResponse(
        boolean authenticated,
        String emailMasked,
        String role
) {
}
