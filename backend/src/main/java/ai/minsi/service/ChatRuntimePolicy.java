package ai.minsi.service;

import ai.minsi.client.AiResult;
import ai.minsi.client.SafetyClassifier;
import ai.minsi.config.ChatConstants;
import ai.minsi.dto.chat.ChatTurn;
import ai.minsi.dto.chat.SafetyLevel;

import java.util.ArrayList;
import java.util.Collections;
import java.util.List;
import java.util.Objects;

final class ChatRuntimePolicy {

    private static final String TEXT_ATTENTION_REPLY = "听起来你这会儿真的挺累的，像是什么都提不起劲。这样的感觉是今天突然变重了，还是已经有一阵了？";
    private static final String VOICE_ATTENTION_REPLY = "听起来你这会儿真的挺累的，像是什么都提不起劲。这种感觉是今天特别重，还是已经有一阵了？";
    private static final String TEXT_CRISIS_REPLY = "我在，我听见你了。你会说想死或想消失，说明现在真的很难撑。你此刻有没有正在伤害自己，或马上会伤害自己的危险？如果有，请立刻去有人的地方，让可信任的大人、监护人或老师陪着你，必要时联系当地急救或报警。可以直接说：我现在有伤害自己的念头，需要有人陪着我。你也可以继续跟我说，但别一个人等我回复。";
    private static final String VOICE_CRISIS_REPLY = "我在，我听见你了，这一刻可能真的很难撑。你现在有正在伤害自己，或马上伤害自己的危险吗？如果有，马上去有人的地方，让可信任的大人或老师陪着你，必要时联系当地急救或报警。你也可以继续跟我说，但别一个人等我回复。";
    private static final String TEXT_EMERGENCY_REPLY = "我听见了，这很紧急。现在立刻把刀、药或其他危险物放远，离开危险位置，去有人的地方；马上联系身边可信任的大人，并联系当地急救或报警。如果已经受伤或服下了东西，直接告诉他们发生了什么。不要独处，也不要只等我回复。";
    private static final String VOICE_EMERGENCY_REPLY = "我听见了，这很紧急。现在立刻放下危险物，离开危险位置，去有人的地方；马上找可信任的大人陪着你，并联系当地急救或报警。不要独处，也不要只等我回复。";
    private static final String TEXT_CRISIS_REASSURANCE_REPLY = "好，我听见你说刚才是在开玩笑。我不会逼你解释，但也不会把那句话当作没发生；我还是想轻轻确认一下，你现在是安全的，身边没有会伤害自己的东西，对吗？你可以继续聊，我也在；如果那种念头再靠近，马上告诉可信任的大人或联系当地急救、报警。";
    private static final String VOICE_CRISIS_REASSURANCE_REPLY = "好，我听见你说刚才是在开玩笑。我不会逼你解释，但也不会把那句话当作没发生。我只想轻轻确认一下，你现在是安全的，对吗？如果那种念头再靠近，马上告诉可信任的大人或联系当地急救、报警。";
    private static final String TEXT_CRISIS_FOLLOW_UP_REPLY = "我还在，你可以接着说，不用一下讲清楚。我们也继续把安全放在前面：尽量待在有人陪的地方，危险一靠近就马上联系可信任的大人或当地急救、报警，别一个人等我回复。";
    private static final String VOICE_CRISIS_FOLLOW_UP_REPLY = "我还在，你可以接着说。我们也继续把安全放在前面，尽量待在有人陪的地方；危险一靠近就马上联系可信任的大人或当地急救、报警。";
    private static final List<String> CRISIS_ACTIONS = List.of(
            "联系身边可信任的大人",
            "查看紧急帮助资源",
            "如果有即时危险，联系当地急救或报警"
    );

    private ChatRuntimePolicy() {
    }

    static AiResult safetyResult(SafetyClassifier.Assessment assessment, boolean voiceMode) {
        if (assessment == null || !assessment.requiresFixedResponse()) {
            throw new IllegalArgumentException("A fixed safety response requires an L1, L2, or L3 assessment");
        }

        if (assessment.effectiveLevel() == SafetyClassifier.SignalLevel.L1) {
            return new AiResult(
                    voiceMode ? VOICE_ATTENTION_REPLY : TEXT_ATTENTION_REPLY,
                    SafetyLevel.ELEVATED,
                    List.of()
            );
        }
        if (assessment.effectiveLevel() == SafetyClassifier.SignalLevel.L3) {
            return emergencyResult(voiceMode);
        }
        if (assessment.currentLevel() == SafetyClassifier.SignalLevel.L2) {
            return crisisResult(voiceMode);
        }
        if (assessment.priorCrisis() && assessment.riskMinimization()) {
            return crisisReassuranceResult(voiceMode);
        }
        if (assessment.priorCrisis()) {
            return crisisFollowUpResult(voiceMode);
        }
        return crisisResult(voiceMode);
    }

    static AiResult crisisResult(boolean voiceMode) {
        return new AiResult(
                voiceMode ? VOICE_CRISIS_REPLY : TEXT_CRISIS_REPLY,
                SafetyLevel.CRISIS,
                CRISIS_ACTIONS
        );
    }

    static AiResult emergencyResult(boolean voiceMode) {
        return new AiResult(
                voiceMode ? VOICE_EMERGENCY_REPLY : TEXT_EMERGENCY_REPLY,
                SafetyLevel.CRISIS,
                CRISIS_ACTIONS
        );
    }

    static AiResult crisisReassuranceResult(boolean voiceMode) {
        return new AiResult(
                voiceMode ? VOICE_CRISIS_REASSURANCE_REPLY : TEXT_CRISIS_REASSURANCE_REPLY,
                SafetyLevel.CRISIS,
                CRISIS_ACTIONS
        );
    }

    static AiResult crisisFollowUpResult(boolean voiceMode) {
        return new AiResult(
                voiceMode ? VOICE_CRISIS_FOLLOW_UP_REPLY : TEXT_CRISIS_FOLLOW_UP_REPLY,
                SafetyLevel.CRISIS,
                CRISIS_ACTIONS
        );
    }

    static String limitReply(String reply, boolean voiceMode) {
        String normalized = reply == null ? "" : reply.trim();
        int maxLength = voiceMode
                ? ChatConstants.VOICE_CHAT_REPLY_MAX_LENGTH
                : ChatConstants.TEXT_CHAT_REPLY_MAX_LENGTH;
        if (ChatConstants.getCharLength(normalized) <= maxLength) {
            return normalized;
        }

        String bounded = firstCodePoints(normalized, maxLength);
        int sentenceEnd = lastSentenceEnd(bounded);
        if (sentenceEnd >= Math.max(1, maxLength / 3)) {
            return bounded.substring(0, sentenceEnd + 1).trim();
        }

        return firstCodePoints(normalized, maxLength - 1).stripTrailing() + "…";
    }

    static List<ChatTurn> boundedRecentTurns(List<ChatTurn> recentTurns, boolean voiceMode) {
        if (recentTurns == null || recentTurns.isEmpty()) {
            return List.of();
        }

        int maxContextLength = voiceMode
                ? ChatConstants.VOICE_CHAT_CONTEXT_MAX_LENGTH
                : ChatConstants.TEXT_CHAT_CONTEXT_MAX_LENGTH;
        int fromIndex = Math.max(0, recentTurns.size() - ChatConstants.CHAT_CONTEXT_MAX_TURNS);
        List<ChatTurn> bounded = new ArrayList<>();
        int usedLength = 0;

        for (int index = recentTurns.size() - 1; index >= fromIndex; index--) {
            ChatTurn turn = recentTurns.get(index);
            if (Objects.isNull(turn) || turn.content().isBlank()) {
                continue;
            }

            int turnLength = ChatConstants.getCharLength(turn.content());
            if (turnLength > ChatConstants.CHAT_INPUT_MAX_LENGTH) {
                continue;
            }
            if (usedLength + turnLength > maxContextLength) {
                break;
            }

            bounded.add(new ChatTurn(turn.role(), turn.content()));
            usedLength += turnLength;
        }

        Collections.reverse(bounded);
        return List.copyOf(bounded);
    }

    private static String firstCodePoints(String value, int maxLength) {
        if (maxLength <= 0 || value.isEmpty()) {
            return "";
        }
        int endIndex = value.offsetByCodePoints(0, Math.min(maxLength, value.codePointCount(0, value.length())));
        return value.substring(0, endIndex);
    }

    private static int lastSentenceEnd(String value) {
        int last = -1;
        for (char marker : new char[]{'。', '！', '？', '!', '?'}) {
            last = Math.max(last, value.lastIndexOf(marker));
        }
        return last;
    }
}
