package ai.minsi.dto.chat;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Pattern;

import java.util.Locale;

public record ChatTurn(
        @NotBlank
        @Pattern(regexp = "user|assistant")
        String role,

        @NotBlank
        String content
) {
    public ChatTurn {
        role = role == null ? "" : role.trim().toLowerCase(Locale.ROOT);
        content = content == null ? "" : content.trim();
    }
}
