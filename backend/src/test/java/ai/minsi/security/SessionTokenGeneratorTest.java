package ai.minsi.security;

import ai.minsi.util.SessionTokenGenerator;
import org.junit.jupiter.api.Test;

import static org.assertj.core.api.Assertions.assertThat;

class SessionTokenGeneratorTest {

    @Test
    void generatesBase64UrlTokenWithoutPaddingFromAtLeastThirtyTwoBytes() {
        SessionTokenGenerator generator = new SessionTokenGenerator();

        String token = generator.generate();

        assertThat(token).hasSizeGreaterThanOrEqualTo(43);
        assertThat(token).doesNotContain("=");
        assertThat(token).matches("[A-Za-z0-9_-]+");
    }

    @Test
    void generatedTokensAreDifferent() {
        SessionTokenGenerator generator = new SessionTokenGenerator();

        assertThat(generator.generate()).isNotEqualTo(generator.generate());
    }
}
