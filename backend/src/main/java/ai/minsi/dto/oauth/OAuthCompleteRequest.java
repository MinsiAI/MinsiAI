package ai.minsi.dto.oauth;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Pattern;

public record OAuthCompleteRequest(
        @NotBlank
        @Pattern(regexp = "wechat|qq")
        String provider,
        @NotBlank
        String code,
        @NotBlank
        String state
) {
}
