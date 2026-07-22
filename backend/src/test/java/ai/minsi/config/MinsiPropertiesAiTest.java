package ai.minsi.config;

import org.junit.jupiter.api.Test;

import static org.assertj.core.api.Assertions.assertThat;

class MinsiPropertiesAiTest {

    @Test
    void usesNoReasoningForLowLatencyTextChat() {
        MinsiProperties.Ai ai = new MinsiProperties.Ai();

        assertThat(ai.getModel()).isEqualTo("gpt-5.6-terra");
        assertThat(ai.normalizedReasoningEffort()).isEqualTo("none");

        ai.setReasoningEffort("HIGH");
        assertThat(ai.normalizedReasoningEffort()).isEqualTo("high");

        ai.setReasoningEffort("unsupported");
        assertThat(ai.normalizedReasoningEffort()).isEqualTo("none");
    }
}
