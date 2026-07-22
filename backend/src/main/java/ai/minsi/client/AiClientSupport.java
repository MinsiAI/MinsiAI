package ai.minsi.client;

import ai.minsi.dto.chat.ChatTurn;
import ai.minsi.dto.chat.SafetyLevel;

import java.util.ArrayList;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Locale;
import java.util.Map;

final class AiClientSupport {

    private AiClientSupport() {
    }

    static String systemPrompt() {
        return systemPrompt(null);
    }

    static String systemPrompt(AiPrompt prompt) {
        String promptText;
        if (prompt != null && prompt.voiceMode()) {
            promptText = MinsiChatPrompt.SYSTEM_PROMPT + "\n" + MinsiChatPrompt.VOICE_CHAT_PROMPT;
        } else {
            promptText = MinsiChatPrompt.SYSTEM_PROMPT + "\n" + MinsiChatPrompt.TEXT_CHAT_PROMPT;
        }

        if (lastAssistantTurnEndsWithQuestion(prompt)) {
            return promptText + "\n" + MinsiChatPrompt.QUESTION_COOLDOWN_PROMPT;
        }
        return promptText;
    }

    static int maxOutputTokens(AiPrompt prompt, int configuredMaxTokens) {
        int normalizedMaxTokens = Math.max(1, configuredMaxTokens);
        if (prompt != null && prompt.voiceMode()) {
            return Math.min(normalizedMaxTokens, ai.minsi.config.ChatConstants.VOICE_CHAT_MAX_OUTPUT_TOKENS);
        }
        return Math.min(normalizedMaxTokens, ai.minsi.config.ChatConstants.CHAT_MAX_OUTPUT_TOKENS);
    }

    static String normalizeText(AiPrompt prompt) {
        return prompt.text() == null ? "" : prompt.text().trim();
    }

    static List<Map<String, String>> chatMessages(AiPrompt prompt) {
        return buildMessages(prompt, false);
    }

    static List<Map<String, String>> claudeMessages(AiPrompt prompt) {
        return buildMessages(prompt, true);
    }

    static List<String> suggestedActions(SafetyLevel safetyLevel) {
        return switch (safetyLevel) {
            case CRISIS -> List.of("联系身边可信任的大人", "查看紧急帮助资源", "如果有即时危险，联系当地急救或报警");
            case ELEVATED -> List.of("先描述最明显的感受", "把现在最困扰的一件事说出来");
            case NORMAL -> List.of("继续说一点", "先用一个词描述现在的感觉");
        };
    }

    private static List<Map<String, String>> buildMessages(AiPrompt prompt, boolean requireUserFirst) {
        List<Map<String, String>> messages = new ArrayList<>();
        for (ChatTurn turn : prompt.recentTurns()) {
            String role = normalizeRole(turn.role());
            String content = turn.content() == null ? "" : turn.content().trim();
            if (role != null && !content.isBlank()) {
                appendOrMerge(messages, role, content);
            }
        }

        appendOrMerge(messages, "user", normalizeText(prompt));

        while (requireUserFirst && !messages.isEmpty() && !"user".equals(messages.getFirst().get("role"))) {
            messages.removeFirst();
        }

        return List.copyOf(messages);
    }

    private static String normalizeRole(String role) {
        if (role == null) {
            return null;
        }
        String normalized = role.trim().toLowerCase(Locale.ROOT);
        if ("user".equals(normalized) || "assistant".equals(normalized)) {
            return normalized;
        }
        return null;
    }

    private static boolean lastAssistantTurnEndsWithQuestion(AiPrompt prompt) {
        if (prompt == null || prompt.recentTurns().isEmpty()) {
            return false;
        }

        for (int index = prompt.recentTurns().size() - 1; index >= 0; index--) {
            ChatTurn turn = prompt.recentTurns().get(index);
            if (turn == null || !"assistant".equals(normalizeRole(turn.role()))) {
                continue;
            }

            String content = turn.content() == null ? "" : turn.content().stripTrailing();
            while (!content.isEmpty() && isClosingPunctuation(content.charAt(content.length() - 1))) {
                content = content.substring(0, content.length() - 1).stripTrailing();
            }
            return content.endsWith("?") || content.endsWith("？");
        }
        return false;
    }

    private static boolean isClosingPunctuation(char value) {
        return value == '"'
                || value == '\''
                || value == '”'
                || value == '’'
                || value == ')'
                || value == '）'
                || value == ']'
                || value == '】';
    }

    private static void appendOrMerge(List<Map<String, String>> messages, String role, String content) {
        if (content.isBlank()) {
            return;
        }

        if (!messages.isEmpty() && role.equals(messages.getLast().get("role"))) {
            Map<String, String> previous = messages.getLast();
            messages.removeLast();
            messages.add(message(role, previous.get("content") + "\n" + content));
            return;
        }

        messages.add(message(role, content));
    }

    private static Map<String, String> message(String role, String content) {
        Map<String, String> message = new LinkedHashMap<>();
        message.put("role", role);
        message.put("content", content);
        return message;
    }
}
