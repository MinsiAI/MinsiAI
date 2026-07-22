package ai.minsi.util;

import org.junit.jupiter.api.Test;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;

class HashUtilsTest {

    @Test
    void hashesAreDeterministicHexValues() {
        String first = HashUtils.sha256WithSalt("value", "test-salt");
        String second = HashUtils.sha256WithSalt("value", "test-salt");

        assertThat(first).isEqualTo(second);
        assertThat(first).hasSize(64);
    }

    @Test
    void saltIsRequired() {
        assertThatThrownBy(() -> HashUtils.sha256WithSalt("value", ""))
                .isInstanceOf(IllegalStateException.class);
    }
}
