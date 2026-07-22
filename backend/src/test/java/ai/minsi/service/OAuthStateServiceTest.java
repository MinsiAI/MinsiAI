package ai.minsi.service;

import ai.minsi.common.BusinessException;
import ai.minsi.config.MinsiProperties;
import ai.minsi.util.SessionTokenGenerator;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.junit.jupiter.api.Test;

import java.time.Clock;
import java.time.Instant;
import java.time.ZoneOffset;
import java.util.List;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;

class OAuthStateServiceTest {

    private final OAuthStateService service = createService();

    @Test
    void createsAndVerifiesSafeRedirect() {
        String state = service.create("wechat", "/chat?from=login");

        OAuthStateService.StatePayload payload = service.verify("wechat", state);

        assertThat(payload.provider()).isEqualTo("wechat");
        assertThat(payload.redirect()).isEqualTo("/chat?from=login");
        assertThat(payload.origin()).isNull();
        assertThat(payload.nonce()).isNotBlank();
    }

    @Test
    void keepsAllowedOriginForMobileCallbackRedirect() {
        String state = service.create("qq", "/chat", "http://192.168.3.70:3000");

        OAuthStateService.StatePayload payload = service.verify("qq", state);

        assertThat(payload.origin()).isEqualTo("http://192.168.3.70:3000");
    }

    @Test
    void dropsUnapprovedOrigin() {
        String state = service.create("qq", "/chat", "https://evil.example");

        OAuthStateService.StatePayload payload = service.verify("qq", state);

        assertThat(payload.origin()).isNull();
    }

    @Test
    void normalizesExternalRedirect() {
        String state = service.create("wechat", "https://example.com/phishing");

        OAuthStateService.StatePayload payload = service.verify("wechat", state);

        assertThat(payload.redirect()).isEqualTo("/chat");
    }

    @Test
    void rejectsTamperedState() {
        String state = service.create("wechat", "/chat");

        assertThatThrownBy(() -> service.verify("wechat", state + "x"))
                .isInstanceOf(BusinessException.class);
    }

    private OAuthStateService createService() {
        MinsiProperties properties = new MinsiProperties();
        properties.getSecurity().setHashSalt("unit-test-hash-salt-with-enough-entropy");
        properties.getApp().setAllowedOrigins(List.of(
                "http://localhost:3000",
                "http://192.168.3.70:3000",
                "https://minsi.ai"
        ));
        return new OAuthStateService(
                properties,
                new ObjectMapper(),
                new SessionTokenGenerator(),
                Clock.fixed(Instant.parse("2026-06-22T00:00:00Z"), ZoneOffset.UTC)
        );
    }
}
