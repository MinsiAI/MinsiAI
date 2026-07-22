package ai.minsi.client;

import ai.minsi.dto.chat.SafetyLevel;

public class MockAiClient implements AiClient {

    @Override
    public AiResult chat(AiPrompt prompt) {
        String text = AiClientSupport.normalizeText(prompt);
        SafetyLevel safetyLevel = SafetyClassifier.classify(text);

        return switch (safetyLevel) {
            case CRISIS -> new AiResult(
                    "我听到你现在可能正处在危险或很难独自承受的时刻。请先离开可能伤害自己的物品或环境，马上联系身边可信任的大人；如果有即时危险，请联系当地急救或报警。Minsi 不是医生或心理治疗师。",
                    safetyLevel,
                    AiClientSupport.suggestedActions(safetyLevel)
            );
            case ELEVATED -> new AiResult(
                    "我听到了，这听起来并不轻松。我们先不用一次讲完整，可以从此刻最重、最明显的那一点慢慢说起。",
                    safetyLevel,
                    AiClientSupport.suggestedActions(safetyLevel)
            );
            case NORMAL -> new AiResult(
                    "我在。你可以从刚才那句话里最靠近你的部分继续说，哪怕只是一个词也可以。",
                    safetyLevel,
                    AiClientSupport.suggestedActions(safetyLevel)
            );
        };
    }
}
