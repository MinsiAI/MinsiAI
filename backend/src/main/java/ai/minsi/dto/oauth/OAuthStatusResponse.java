package ai.minsi.dto.oauth;

public record OAuthStatusResponse(
        String status,
        String redirect
) {
    public static OAuthStatusResponse pending() {
        return new OAuthStatusResponse("pending", null);
    }

    public static OAuthStatusResponse success(String redirect) {
        return new OAuthStatusResponse("success", redirect);
    }
}
