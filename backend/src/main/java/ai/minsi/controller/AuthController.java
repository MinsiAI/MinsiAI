package ai.minsi.controller;

import ai.minsi.common.ApiResponse;
import ai.minsi.dto.auth.AuthStatusResponse;
import ai.minsi.dto.auth.EmailStartRequest;
import ai.minsi.dto.auth.EmailVerifyRequest;
import ai.minsi.security.SessionCookieService;
import ai.minsi.service.AuthService;
import ai.minsi.service.SessionService;
import ai.minsi.util.IpUtils;
import jakarta.servlet.http.Cookie;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.validation.Valid;
import org.springframework.http.HttpHeaders;
import org.springframework.http.ResponseCookie;
import org.springframework.http.ResponseEntity;
import org.springframework.util.StringUtils;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/auth")
public class AuthController {

    private final AuthService authService;
    private final SessionService sessionService;
    private final SessionCookieService sessionCookieService;

    public AuthController(
            AuthService authService,
            SessionService sessionService,
            SessionCookieService sessionCookieService
    ) {
        this.authService = authService;
        this.sessionService = sessionService;
        this.sessionCookieService = sessionCookieService;
    }

    @PostMapping("/email/start")
    public ApiResponse<Void> startEmailLogin(
            @Valid @RequestBody EmailStartRequest request,
            HttpServletRequest servletRequest
    ) {
        authService.startEmailLogin(request.email(), IpUtils.resolveClientIp(servletRequest));
        return ApiResponse.success();
    }

    @PostMapping("/email/verify")
    public ResponseEntity<ApiResponse<AuthStatusResponse>> verifyEmailLogin(
            @Valid @RequestBody EmailVerifyRequest request,
            HttpServletRequest servletRequest
    ) {
        SessionService.CreatedSession session = authService.verifyEmailLogin(
                request.email(),
                request.code(),
                IpUtils.resolveClientIp(servletRequest)
        );
        ResponseCookie cookie = sessionCookieService.createCookie(session.token(), session.maxAge());
        return ResponseEntity.ok()
                .header(HttpHeaders.SET_COOKIE, cookie.toString())
                .body(ApiResponse.success(new AuthStatusResponse(true)));
    }

    @PostMapping("/logout")
    public ResponseEntity<ApiResponse<Void>> logout(HttpServletRequest request) {
        String sessionToken = extractSessionToken(request);
        if (StringUtils.hasText(sessionToken)) {
            sessionService.revoke(sessionToken);
        }

        ResponseCookie cookie = sessionCookieService.clearCookie();
        return ResponseEntity.ok()
                .header(HttpHeaders.SET_COOKIE, cookie.toString())
                .body(ApiResponse.success());
    }

    private String extractSessionToken(HttpServletRequest request) {
        Cookie[] cookies = request.getCookies();
        if (cookies == null) {
            return null;
        }

        for (Cookie cookie : cookies) {
            if (SessionCookieService.COOKIE_NAME.equals(cookie.getName())) {
                return cookie.getValue();
            }
        }

        return null;
    }
}
