package ai.minsi.controller;

import ai.minsi.common.ApiResponse;
import ai.minsi.config.MinsiProperties;
import ai.minsi.dto.auth.AuthStatusResponse;
import ai.minsi.dto.auth.EmailVerifyRequest;
import ai.minsi.security.SessionCookieService;
import ai.minsi.service.AuthService;
import ai.minsi.service.SessionService;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.junit.jupiter.api.Test;
import org.springframework.http.ResponseEntity;
import org.springframework.mock.web.MockHttpServletRequest;

import java.time.Duration;

import static org.assertj.core.api.Assertions.assertThat;

class AuthControllerTest {

    @Test
    void verifyResponseDoesNotExposeTokenSessionIdOrRawUserId() throws Exception {
        AuthService authService = new FakeAuthService();
        MinsiProperties properties = new MinsiProperties();
        SessionCookieService cookieService = new SessionCookieService(properties);
        AuthController controller = new AuthController(authService, null, cookieService);
        MockHttpServletRequest servletRequest = new MockHttpServletRequest();
        servletRequest.setRemoteAddr("127.0.0.1");

        // Bean validation is covered by Spring; this test only checks response shape.
        ResponseEntity<ApiResponse<AuthStatusResponse>> response = controller.verifyEmailLogin(
                new EmailVerifyRequest("child@example.com", null),
                servletRequest
        );

        String body = new ObjectMapper().writeValueAsString(response.getBody());
        assertThat(body).doesNotContain("server-only-token", "token", "sessionId", "userId");
        assertThat(response.getHeaders().getFirst("Set-Cookie"))
                .contains("session_token=server-only-token")
                .contains("HttpOnly")
                .contains("SameSite=Lax");
    }

    private static final class FakeAuthService extends AuthService {
        private FakeAuthService() {
            super(null, null, null, null, null, null, null);
        }

        @Override
        public SessionService.CreatedSession verifyEmailLogin(String email, String code, String clientIp) {
            return new SessionService.CreatedSession("server-only-token", Duration.ofDays(30));
        }
    }
}
