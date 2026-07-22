package ai.minsi.logging;

import org.junit.jupiter.api.Test;

import java.util.Map;

import static org.assertj.core.api.Assertions.assertThat;

class LogSanitizerTest {

    @Test
    void keepsOnlyAllowedOperationalFields() {
        Map<String, Object> sanitized = LogSanitizer.sanitizeFields(Map.of(
                "endpoint", "/api/health",
                "method", "GET",
                "status_code", 200,
                "token", "secret",
                "raw_email", "person@example.com"
        ));

        assertThat(sanitized)
                .containsEntry("endpoint", "/api/health")
                .containsEntry("method", "GET")
                .containsEntry("status_code", 200)
                .doesNotContainKeys("token", "raw_email");
    }

    @Test
    void redactsDeniedEventNames() {
        assertThat(LogSanitizer.sanitizeEvent("session_token_created")).isEqualTo("redacted_event");
    }
}
