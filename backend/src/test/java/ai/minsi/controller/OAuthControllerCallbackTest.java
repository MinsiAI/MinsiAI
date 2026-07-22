package ai.minsi.controller;

import ai.minsi.config.MinsiProperties;
import ai.minsi.security.SessionCookieService;
import ai.minsi.service.OAuthLoginService;
import ai.minsi.service.OAuthQrLoginService;
import ai.minsi.service.SessionService;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.junit.jupiter.api.Test;
import org.springframework.http.ResponseCookie;

import java.time.Duration;
import java.util.List;
import java.util.Optional;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

class OAuthControllerCallbackTest {

    @Test
    void statusConsumesCompletedQrLoginAndSetsDesktopSessionCookie() {
        MinsiProperties properties = new MinsiProperties();
        properties.getApp().setAllowedOrigins(List.of("http://localhost:3000"));
        OAuthLoginService oauthLoginService = mock(OAuthLoginService.class);
        OAuthQrLoginService oauthQrLoginService = mock(OAuthQrLoginService.class);
        SessionCookieService sessionCookieService = mock(SessionCookieService.class);
        OAuthQrLoginService.CompletedLogin completedLogin = new OAuthQrLoginService.CompletedLogin("session-token", Duration.ofDays(30), "/chat");
        when(oauthQrLoginService.consume("qq", "signed-state")).thenReturn(Optional.of(completedLogin));
        when(sessionCookieService.createCookie("session-token", Duration.ofDays(30)))
                .thenReturn(ResponseCookie.from("session_token", "session-token").path("/").build());
        OAuthController controller = new OAuthController(oauthLoginService, oauthQrLoginService, sessionCookieService, properties, new ObjectMapper());

        var response = controller.status("qq", "signed-state");

        assertThat(response.getBody()).isNotNull();
        assertThat(response.getBody().getData().status()).isEqualTo("success");
        assertThat(response.getBody().getData().redirect()).isEqualTo("/chat");
        assertThat(response.getHeaders().getFirst("Set-Cookie")).contains("session_token=session-token");
        verify(oauthLoginService).verifyState("qq", "signed-state");
    }

    @Test
    void callbackHtmlCompletesLoginAndPostsOAuthSuccessToTopWindowForNestedProviderFrames() {
        MinsiProperties properties = new MinsiProperties();
        properties.getApp().setAllowedOrigins(List.of("http://localhost:3000", "https://minsi.ai"));
        OAuthLoginService oauthLoginService = mock(OAuthLoginService.class);
        OAuthQrLoginService oauthQrLoginService = mock(OAuthQrLoginService.class);
        SessionCookieService sessionCookieService = mock(SessionCookieService.class);
        SessionService.CreatedSession session = new SessionService.CreatedSession("session-token", Duration.ofDays(30));
        when(oauthLoginService.complete("qq", "oauth-code", "signed-state"))
                .thenReturn(new OAuthLoginService.CallbackResult(session, "/chat", "http://192.168.3.70:3000"));
        when(sessionCookieService.createCookie("session-token", Duration.ofDays(30)))
                .thenReturn(ResponseCookie.from("session_token", "session-token").path("/").build());
        OAuthController controller = new OAuthController(oauthLoginService, oauthQrLoginService, sessionCookieService, properties, new ObjectMapper());

        var response = controller.qqCallback("oauth-code", "signed-state");
        String body = response.getBody();

        assertThat(body)
                .contains("type: \"minsi:oauth:success\"")
                .contains("redirect: \"/chat\"")
                .contains("ancestorOrigins.length")
                .contains("window.parent.postMessage(message, targetOrigins[i])")
                .contains("window.opener.postMessage(message, targetOrigins[i])")
                .contains("window.top.postMessage(message, targetOrigins[i])")
                .contains("http://192.168.3.70:3000/chat");
        assertThat(response.getHeaders().getFirst("Set-Cookie")).contains("session_token=session-token");
        verify(oauthQrLoginService).markCompleted("qq", "signed-state", "/chat", session);
    }
}
