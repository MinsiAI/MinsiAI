package ai.minsi.client;

import ai.minsi.dto.chat.ChatTurn;
import ai.minsi.dto.chat.SafetyLevel;
import org.junit.jupiter.api.Test;

import java.util.List;

import static org.assertj.core.api.Assertions.assertThat;

class SafetyClassifierTest {

    @Test
    void keepsColloquialThirdPersonAndAcademicLanguageAtL0() {
        for (String message : List.of(
                "这作业多得我要死了",
                "累死了",
                "笑死我了",
                "我的朋友说她想死",
                "小说里的主角想死",
                "论文在讨论青少年自杀"
        )) {
            SafetyClassifier.Assessment assessment = SafetyClassifier.assess(message, List.of());

            assertThat(assessment.currentLevel()).as(message).isEqualTo(SafetyClassifier.SignalLevel.L0);
            assertThat(assessment.safetyLevel()).as(message).isEqualTo(SafetyLevel.NORMAL);
        }
    }

    @Test
    void treatsAmbiguousLifeWearinessAsL1OnTheFirstOccurrence() {
        SafetyClassifier.Assessment assessment = SafetyClassifier.assess("活着好没意思", List.of());

        assertThat(assessment.currentLevel()).isEqualTo(SafetyClassifier.SignalLevel.L1);
        assertThat(assessment.effectiveLevel()).isEqualTo(SafetyClassifier.SignalLevel.L1);
        assertThat(assessment.safetyLevel()).isEqualTo(SafetyLevel.ELEVATED);
        assertThat(assessment.requiresFixedResponse()).isTrue();
    }

    @Test
    void treatsAnExplicitFirstPersonDeathSignalAsL2OnTheFirstOccurrence() {
        for (String message : List.of("我真的好想死", "我不想活了", "想消失", "累死了，但我是真的想死")) {
            SafetyClassifier.Assessment assessment = SafetyClassifier.assess(message, List.of());

            assertThat(assessment.currentLevel()).as(message).isEqualTo(SafetyClassifier.SignalLevel.L2);
            assertThat(assessment.effectiveLevel()).as(message).isEqualTo(SafetyClassifier.SignalLevel.L2);
            assertThat(assessment.safetyLevel()).as(message).isEqualTo(SafetyLevel.CRISIS);
            assertThat(assessment.priorCrisis()).as(message).isFalse();
        }
    }

    @Test
    void treatsPlanMeansTimeOrActionAsL3OnTheFirstOccurrence() {
        for (String message : List.of(
                "我今晚准备跳楼",
                "今晚我想死",
                "我已经把药吃下去了",
                "我已经伤害了自己",
                "我刚吞了药",
                "我在流血",
                "我伤害了自己"
        )) {
            SafetyClassifier.Assessment assessment = SafetyClassifier.assess(message, List.of());

            assertThat(assessment.currentLevel()).as(message).isEqualTo(SafetyClassifier.SignalLevel.L3);
            assertThat(assessment.safetyLevel()).as(message).isEqualTo(SafetyLevel.CRISIS);
        }
    }

    @Test
    void priorL1OnlyLowersTheThresholdForLaterAmbiguousWorsening() {
        SafetyClassifier.Assessment assessment = SafetyClassifier.assess(
                "我真的撑不住了",
                List.of(
                        new ChatTurn("user", "活着好没意思"),
                        new ChatTurn("assistant", "听起来你这会儿真的挺累的。")
                )
        );

        assertThat(assessment.currentLevel()).isEqualTo(SafetyClassifier.SignalLevel.L0);
        assertThat(assessment.priorAttention()).isTrue();
        assertThat(assessment.effectiveLevel()).isEqualTo(SafetyClassifier.SignalLevel.L2);
        assertThat(assessment.safetyLevel()).isEqualTo(SafetyLevel.CRISIS);
    }

    @Test
    void priorCrisisKeepsTheSessionSensitiveWhenTheUserSaysItWasAJoke() {
        SafetyClassifier.Assessment assessment = SafetyClassifier.assess(
                "没事，我开玩笑的",
                List.of(
                        new ChatTurn("user", "我真的好想死"),
                        new ChatTurn("assistant", "我在，我听见你了。别一个人等我回复。")
                )
        );

        assertThat(assessment.currentLevel()).isEqualTo(SafetyClassifier.SignalLevel.L0);
        assertThat(assessment.priorCrisis()).isTrue();
        assertThat(assessment.riskMinimization()).isTrue();
        assertThat(assessment.effectiveLevel()).isEqualTo(SafetyClassifier.SignalLevel.L2);
        assertThat(assessment.safetyLevel()).isEqualTo(SafetyLevel.CRISIS);
    }

    @Test
    void serverSafetyReplyCarriesHighSensitivityWithoutPersistingSessionContent() {
        SafetyClassifier.Assessment assessment = SafetyClassifier.assess(
                "今天先聊点别的",
                List.of(new ChatTurn("assistant", "我还在，我们继续把安全放在前面。"))
        );

        assertThat(assessment.currentLevel()).isEqualTo(SafetyClassifier.SignalLevel.L0);
        assertThat(assessment.priorCrisis()).isTrue();
        assertThat(assessment.effectiveLevel()).isEqualTo(SafetyClassifier.SignalLevel.L2);
    }
}
