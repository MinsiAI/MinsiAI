package ai.minsi.client;

import ai.minsi.dto.chat.ChatTurn;

import java.util.List;

public record AiPrompt(String text, List<ChatTurn> recentTurns, boolean voiceMode) {
    public AiPrompt(String text) {
        this(text, List.of(), false);
    }

    public AiPrompt(String text, List<ChatTurn> recentTurns) {
        this(text, recentTurns, false);
    }

    public AiPrompt {
        recentTurns = recentTurns == null ? List.of() : List.copyOf(recentTurns);
    }
}
