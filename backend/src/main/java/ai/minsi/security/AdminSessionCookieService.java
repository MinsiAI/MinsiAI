package ai.minsi.security;

import ai.minsi.config.MinsiProperties;
import org.springframework.http.ResponseCookie;
import org.springframework.stereotype.Component;
import org.springframework.util.StringUtils;

import java.time.Duration;

@Component
public class AdminSessionCookieService {

    public static final String COOKIE_NAME = "admin_session_token";

    private final MinsiProperties properties;

    public AdminSessionCookieService(MinsiProperties properties) {
        this.properties = properties;
    }

    public ResponseCookie createCookie(String sessionToken, Duration maxAge) {
        return baseCookie(sessionToken)
                .maxAge(maxAge)
                .build();
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
