package ai.minsi.security;

import ai.minsi.config.MinsiProperties;
import org.springframework.http.ResponseCookie;
import org.springframework.stereotype.Component;
import org.springframework.util.StringUtils;

import java.time.Duration;

@Component
public class SessionCookieService {

    public static final String COOKIE_NAME = "session_token";

    private final MinsiProperties properties;

    public SessionCookieService(MinsiProperties properties) {
        this.properties = properties;
    }

    public ResponseCookie createCookie(String sessionToken, Duration maxAge) {
        ResponseCookie.ResponseCookieBuilder builder = baseCookie(sessionToken)
                .maxAge(maxAge);
        return builder.build();
    }

    public ResponseCookie clearCookie() {
        return baseCookie("")
                .maxAge(Duration.ZERO)
                .build();
    }

    private ResponseCookie.ResponseCookieBuilder baseCookie(String value) {
        ResponseCookie.ResponseCookieBuilder builder = ResponseCookie.from(COOKIE_NAME, value)
                .httpOnly(true)
                .secure(properties.getApp().isCookieSecure())
                .sameSite("Lax")
                .path("/");

        String cookieDomain = properties.getApp().getCookieDomain();
        if (StringUtils.hasText(cookieDomain)) {
            builder.domain(cookieDomain.trim());
        }

        return builder;
    }
}
