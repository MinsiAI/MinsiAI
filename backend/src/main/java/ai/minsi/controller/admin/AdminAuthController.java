package ai.minsi.controller.admin;

import ai.minsi.common.ApiResponse;
import ai.minsi.dto.admin.AdminEmailStartRequest;
import ai.minsi.dto.admin.AdminEmailVerifyRequest;
import ai.minsi.dto.admin.AdminMeResponse;
import ai.minsi.security.AdminAuthenticatedUser;
import ai.minsi.security.AdminSessionCookieService;
import ai.minsi.service.AdminAuditService;
import ai.minsi.service.AdminAuthService;
import ai.minsi.service.AdminSessionService;
import ai.minsi.util.IpUtils;
import jakarta.servlet.http.Cookie;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.validation.Valid;
import org.springframework.http.HttpHeaders;
import org.springframework.http.ResponseCookie;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.util.StringUtils;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/admin/auth")
public class AdminAuthController {

    private final AdminAuthService adminAuthService;
    private final AdminAuditService adminAuditService;
    private final AdminSessionCookieService adminSessionCookieService;

    public AdminAuthController(
            AdminAuthService adminAuthService,
            AdminAuditService adminAuditService,
            AdminSessionCookieService adminSessionCookieService
    ) {
        this.adminAuthService = adminAuthService;
        this.adminAuditService = adminAuditService;
        this.adminSessionCookieService = adminSessionCookieService;
    }

    @PostMapping("/email/start")
    public ApiResponse<Void> startEmailLogin(
            @Valid @RequestBody AdminEmailStartRequest request,
            HttpServletRequest servletRequest
    ) {
        adminAuthService.startEmailLogin(request.email(), IpUtils.resolveClientIp(servletRequest));
        return ApiResponse.success();
    }

    @PostMapping("/email/verify")
    public ResponseEntity<ApiResponse<AdminMeResponse>> verifyEmailLogin(
            @Valid @RequestBody AdminEmailVerifyRequest request,
            HttpServletRequest servletRequest
    ) {
        AdminAuthService.AdminLoginResult loginResult = adminAuthService.verifyEmailLogin(
                request.email(),
                request.code(),
                IpUtils.resolveClientIp(servletRequest),
                adminAuditService.contextFrom(servletRequest)
        );
        AdminSessionService.CreatedAdminSession session = loginResult.session();
        ResponseCookie cookie = adminSessionCookieService.createCookie(session.token(), session.maxAge());
        return ResponseEntity.ok()
                .header(HttpHeaders.SET_COOKIE, cookie.toString())
                .body(ApiResponse.success(toMeResponse(loginResult.adminUser())));
    }

    @PostMapping("/logout")
    public ResponseEntity<ApiResponse<Void>> logout(
            @AuthenticationPrincipal AdminAuthenticatedUser currentAdmin,
            HttpServletRequest request
    ) {
        String sessionToken = extractSessionToken(request);
        if (StringUtils.hasText(sessionToken)) {
            adminAuthService.logout(sessionToken, currentAdmin, adminAuditService.contextFrom(request));
        }

        ResponseCookie cookie = adminSessionCookieService.clearCookie();
        return ResponseEntity.ok()
                .header(HttpHeaders.SET_COOKIE, cookie.toString())
                .body(ApiResponse.success());
    }

    private AdminMeResponse toMeResponse(AdminAuthenticatedUser adminUser) {
        return new AdminMeResponse(true, adminUser.emailMasked(), adminUser.role());
    }

    private String extractSessionToken(HttpServletRequest request) {
        Cookie[] cookies = request.getCookies();
        if (cookies == null) {
            return null;
        }

        for (Cookie cookie : cookies) {
            if (AdminSessionCookieService.COOKIE_NAME.equals(cookie.getName())) {
                return cookie.getValue();
            }
        }

        return null;
    }
}
