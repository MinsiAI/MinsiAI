package ai.minsi.dto.oauth;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Pattern;

public record OAuthStartRequest(
        @NotBlank
        @Pattern(regexp = "wechat|qq")
        String provider,
        String redirect,
        @Pattern(regexp = "desktop|mobile")
        String client,
        String origin
) {
    public boolean mobileClient() {
        return "mobile".equals(client);
    }
}
