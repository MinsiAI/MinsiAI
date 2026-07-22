package ai.minsi.dto.chat;

import ai.minsi.config.ChatConstants;
import jakarta.validation.Valid;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

import java.util.ArrayList;
import java.util.Collections;
import java.util.List;

public record ChatRequest(
        @NotBlank
        String message,

        @Size(max = ChatConstants.CHAT_CONTEXT_MAX_TURNS)
        List<@Valid ChatTurn> recentTurns,

        boolean includeAudio
) {
    public ChatRequest {
        message = message == null ? "" : message.trim();
        recentTurns = recentTurns == null ? List.of() : Collections.unmodifiableList(new ArrayList<>(recentTurns));
    }
}
