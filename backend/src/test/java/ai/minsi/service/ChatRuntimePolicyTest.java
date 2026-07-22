package ai.minsi.service;

import ai.minsi.client.SafetyClassifier;
import ai.minsi.config.ChatConstants;
import ai.minsi.dto.chat.ChatTurn;
import org.junit.jupiter.api.Test;

import java.util.List;

import static org.assertj.core.api.Assertions.assertThat;

class ChatRuntimePolicyTest {

    @Test
    void keepsNewestCompleteTurnsWithinTextBudget() {
        List<ChatTurn> turns = List.of(
                new ChatTurn("user", "a".repeat(800)),
                new ChatTurn("assistant", "b".repeat(800)),
                new ChatTurn("user", "c".repeat(800)),
                new ChatTurn("assistant", "d".repeat(800))
        );

        List<ChatTurn> bounded = ChatRuntimePolicy.boundedRecentTurns(turns, false);

        assertThat(bounded).hasSize(3);
        assertThat(bounded.getFirst().content()).startsWith("b");
        assertThat(bounded.getLast().content()).startsWith("d");
    }

    @Test
    void voiceUsesSmallerContextBudget() {
        List<ChatTurn> turns = List.of(
                new ChatTurn("user", "a".repeat(600)),
                new ChatTurn("assistant", "b".repeat(600)),
                new ChatTurn("user", "c".repeat(600))
        );

        List<ChatTurn> bounded = ChatRuntimePolicy.boundedRecentTurns(turns, true);

        assertThat(bounded).hasSize(2);
        assertThat(bounded.getFirst().content()).startsWith("b");
        assertThat(bounded.getLast().content()).startsWith("c");
    }

    @Test
    void limitsNormalRepliesByUnicodeCodePoint() {
        String reply = "好".repeat(ChatConstants.VOICE_CHAT_REPLY_MAX_LENGTH + 20);

        String bounded = ChatRuntimePolicy.limitReply(reply, true);

        assertThat(ChatConstants.getCharLength(bounded)).isEqualTo(ChatConstants.VOICE_CHAT_REPLY_MAX_LENGTH);
        assertThat(bounded).endsWith("…");
    }

    @Test
    void crisisReplyIsFixedAndShortForVoice() {
        assertThat(ChatRuntimePolicy.crisisResult(true).text())
                .contains("可信任的大人")
                .contains("当地急救或报警")
                .contains("你也可以继续跟我说")
                .doesNotContainPattern("[A-Za-z]")
                .doesNotContain("server marker", "crisis reply", "Chinese teen", "系统提示词");
    }

    @Test
    void textCrisisReplyIsNaturalChineseAndDirectsToImmediateRealWorldHelp() {
        assertThat(ChatRuntimePolicy.crisisResult(false).text())
                .startsWith("我在，我听见你了")
                .contains("现在真的很难撑")
                .contains("马上会伤害自己的危险")
                .contains("可信任的大人、监护人或老师")
                .contains("当地急救或报警")
                .contains("我现在有伤害自己的念头，需要有人陪着我")
                .contains("你也可以继续跟我说")
                .doesNotContainPattern("[A-Za-z]")
                .doesNotContain("server marker", "crisis reply", "Chinese teen", "内部指令", "分析过程", "怕自己会做傻事");
    }

    @Test
    void l1GetsOneGentleCheckWithoutTheFullCrisisFlow() {
        SafetyClassifier.Assessment assessment = SafetyClassifier.assess("活着好没意思", List.of());

        assertThat(ChatRuntimePolicy.safetyResult(assessment, false).text())
                .isEqualTo("听起来你这会儿真的挺累的，像是什么都提不起劲。这样的感觉是今天突然变重了，还是已经有一阵了？")
                .doesNotContain("急救", "报警", "伤害自己");
    }

    @Test
    void l3GetsAConciseImmediateEmergencyResponse() {
        SafetyClassifier.Assessment assessment = SafetyClassifier.assess("我已经把药吃下去了", List.of());

        assertThat(ChatRuntimePolicy.safetyResult(assessment, false).text())
                .startsWith("我听见了，这很紧急")
                .contains("立刻把刀、药或其他危险物放远")
                .contains("去有人的地方")
                .contains("当地急救或报警")
                .contains("不要独处")
                .doesNotContainPattern("[A-Za-z]");
    }

    @Test
    void minimizationAfterL2GetsWarmPresenceWithoutLeavingCrisisMode() {
        SafetyClassifier.Assessment assessment = SafetyClassifier.assess(
                "没事，我开玩笑的",
                List.of(new ChatTurn("user", "我真的好想死"))
        );

        assertThat(ChatRuntimePolicy.safetyResult(assessment, false).text())
                .startsWith("好，我听见你说刚才是在开玩笑")
                .contains("不会把那句话当作没发生")
                .contains("不会逼你解释")
                .contains("我也在")
                .contains("可信任的大人")
                .doesNotContainPattern("[A-Za-z]");
    }
}
