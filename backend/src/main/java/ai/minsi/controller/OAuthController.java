package ai.minsi.controller;

import ai.minsi.common.ApiResponse;
import ai.minsi.common.BusinessException;
import ai.minsi.common.ErrorCode;
import ai.minsi.config.MinsiProperties;
import ai.minsi.dto.oauth.OAuthCompleteRequest;
import ai.minsi.dto.oauth.OAuthCompleteResponse;
import ai.minsi.dto.oauth.OAuthStartRequest;
import ai.minsi.dto.oauth.OAuthStartResponse;
import ai.minsi.dto.oauth.OAuthStatusResponse;
import ai.minsi.security.SessionCookieService;
import ai.minsi.service.OAuthLoginService;
import ai.minsi.service.OAuthQrLoginService;
import ai.minsi.service.SessionService;
import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.ObjectMapper;
import jakarta.validation.Valid;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseCookie;
import org.springframework.http.ResponseEntity;
import org.springframework.util.StringUtils;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.net.URI;
import java.util.List;

@RestController
@RequestMapping("/api/auth/oauth")
public class OAuthController {

    private final OAuthLoginService oauthLoginService;
    private final OAuthQrLoginService oauthQrLoginService;
    private final SessionCookieService sessionCookieService;
    private final MinsiProperties properties;
    private final ObjectMapper objectMapper;

    public OAuthController(
            OAuthLoginService oauthLoginService,
            OAuthQrLoginService oauthQrLoginService,
            SessionCookieService sessionCookieService,
            MinsiProperties properties,
            ObjectMapper objectMapper
    ) {
        this.oauthLoginService = oauthLoginService;
        this.oauthQrLoginService = oauthQrLoginService;
        this.sessionCookieService = sessionCookieService;
        this.properties = properties;
        this.objectMapper = objectMapper;
    }

    @PostMapping("/start")
    public ApiResponse<OAuthStartResponse> start(@Valid @RequestBody OAuthStartRequest request) {
        OAuthStartResponse start = oauthLoginService.start(request.provider(), request.redirect(), request.origin(), request.mobileClient());
        String launchToken = oauthQrLoginService.registerLaunch(request.provider(), start.authorizeUrl());
        return ApiResponse.success(new OAuthStartResponse(
                start.authorizeUrl(),
                start.expiresInSeconds(),
                start.state(),
                buildLaunchUrl(request.provider(), launchToken)
        ));
    }

    @GetMapping("/launch/{provider}/{token}")
    public ResponseEntity<Void> launch(@PathVariable String provider, @PathVariable String token) {
        String authorizeUrl = oauthQrLoginService.resolveLaunch(provider, token)
                .orElseThrow(() -> new BusinessException(ErrorCode.BAD_REQUEST));
        return ResponseEntity.status(HttpStatus.FOUND)
                .location(URI.create(authorizeUrl))
                .build();
    }

    @PostMapping("/complete")
    public ResponseEntity<ApiResponse<OAuthCompleteResponse>> complete(@Valid @RequestBody OAuthCompleteRequest request) {
        OAuthLoginService.CallbackResult result = oauthLoginService.complete(request.provider(), request.code(), request.state());
        SessionService.CreatedSession session = result.session();
        oauthQrLoginService.markCompleted(request.provider(), request.state(), result.redirect(), session);
        ResponseCookie cookie = sessionCookieService.createCookie(session.token(), session.maxAge());
        return ResponseEntity.ok()
                .header(HttpHeaders.SET_COOKIE, cookie.toString())
                .body(ApiResponse.success(new OAuthCompleteResponse(result.redirect())));
    }

    @GetMapping("/status")
    public ResponseEntity<ApiResponse<OAuthStatusResponse>> status(
            @RequestParam String provider,
            @RequestParam String state
    ) {
        oauthLoginService.verifyState(provider, state);
        return oauthQrLoginService.consume(provider, state)
                .map(completedLogin -> {
                    ResponseCookie cookie = sessionCookieService.createCookie(completedLogin.sessionToken(), completedLogin.maxAge());
                    return ResponseEntity.ok()
                            .header(HttpHeaders.SET_COOKIE, cookie.toString())
                            .body(ApiResponse.success(OAuthStatusResponse.success(completedLogin.redirect())));
                })
                .orElseGet(() -> ResponseEntity.ok(ApiResponse.success(OAuthStatusResponse.pending())));
    }

    @GetMapping(value = "/callback/wechat", produces = MediaType.TEXT_HTML_VALUE)
    public ResponseEntity<String> wechatCallback(@RequestParam(required = false) String code, @RequestParam(required = false) String state) {
        return callbackResponse("wechat", code, state);
    }

    @GetMapping(value = "/callback/qq", produces = MediaType.TEXT_HTML_VALUE)
    public ResponseEntity<String> qqCallback(@RequestParam(required = false) String code, @RequestParam(required = false) String state) {
        return callbackResponse("qq", code, state);
    }

    private ResponseEntity<String> callbackResponse(String provider, String code, String state) {
        if (!StringUtils.hasText(code) || !StringUtils.hasText(state)) {
            throw new BusinessException(ErrorCode.BAD_REQUEST);
        }

        OAuthLoginService.CallbackResult result = oauthLoginService.complete(provider, code, state);
        SessionService.CreatedSession session = result.session();
        oauthQrLoginService.markCompleted(provider, state, result.redirect(), session);
        ResponseCookie cookie = sessionCookieService.createCookie(session.token(), session.maxAge());

        return ResponseEntity.ok()
                .header(HttpHeaders.SET_COOKIE, cookie.toString())
                .contentType(MediaType.TEXT_HTML)
                .body(callbackHtml(provider, result.redirect(), result.origin()));
    }

    private String callbackHtml(String provider, String redirect, String origin) {
        List<String> allowedOrigins = properties.getApp().requireAllowedOrigins();
        String providerJson = toJson(provider);
        String redirectJson = toJson(redirect);
        String originsJson = toJson(allowedOrigins);
        String fallbackUrlJson = toJson(buildFallbackUrl(origin, redirect, allowedOrigins));

        return """
                <!doctype html>
                <html lang="zh-CN">
                <head><meta charset="utf-8"><title>Minsi 正在登录</title></head>
                <body>
                  <p>登录确认中，正在进入 Minsi。</p>
                  <script>
                    (function () {
                      var message = { type: "minsi:oauth:success", provider: %s, redirect: %s };
                      var origins = %s;
                      var targetOrigins = origins.slice();
                      function localDevOrigin(origin) {
                        return /^http:\\/\\/(localhost|127\\.0\\.0\\.1)(:\\d+)?$/.test(origin)
                          || /^http:\\/\\/192\\.168\\.\\d+\\.\\d+(:\\d+)?$/.test(origin);
                      }
                      function addTargetOrigin(origin) {
                        if (origin && localDevOrigin(origin) && targetOrigins.indexOf(origin) === -1) {
                          targetOrigins.push(origin);
                        }
                      }
                      try {
                        var ancestorOrigins = window.location.ancestorOrigins;
                        if (ancestorOrigins && ancestorOrigins.length > 0) {
                          for (var ancestorIndex = 0; ancestorIndex < ancestorOrigins.length; ancestorIndex += 1) {
                            addTargetOrigin(ancestorOrigins[ancestorIndex]);
                          }
                        } else if (document.referrer) {
                          addTargetOrigin(new URL(document.referrer).origin);
                        }
                      } catch (error) {}
                      var hasOpener = false;
                      try {
                        hasOpener = Boolean(window.opener && !window.opener.closed);
                      } catch (error) {}
                      var postCount = 0;
                      function notifyParent() {
                        postCount += 1;
                        for (var i = 0; i < targetOrigins.length; i += 1) {
                          try { window.parent.postMessage(message, targetOrigins[i]); } catch (error) {}
                          try {
                            if (hasOpener) {
                              window.opener.postMessage(message, targetOrigins[i]);
                            }
                          } catch (error) {}
                          try {
                            if (window.top && window.top !== window.parent) {
                              window.top.postMessage(message, targetOrigins[i]);
                            }
                          } catch (error) {}
                        }
                        if (postCount < 20 && (window.top !== window.self || hasOpener)) {
                          window.setTimeout(notifyParent, 250);
                        }
                      }
                      notifyParent();
                      if (window.top === window.self) {
                        if (hasOpener) {
                          window.setTimeout(function () {
                            try { window.close(); } catch (error) {}
                          }, 1200);
                        } else {
                          window.location.replace(%s);
                        }
                      }
                    }());
                  </script>
                </body>
                </html>
                """.formatted(providerJson, redirectJson, originsJson, fallbackUrlJson);
    }

    private String buildFallbackUrl(String origin, String redirect, List<String> allowedOrigins) {
        String fallbackOrigin = StringUtils.hasText(origin) ? origin : allowedOrigins.getFirst();
        String safeRedirect = StringUtils.hasText(redirect)
                && redirect.startsWith("/")
                && !redirect.startsWith("//")
                && !redirect.startsWith("/\\")
                ? redirect
                : "/chat";
        return fallbackOrigin.replaceAll("/+$", "") + safeRedirect;
    }

    private String toJson(Object value) {
        try {
            return objectMapper.writeValueAsString(value);
        } catch (JsonProcessingException exception) {
            throw new BusinessException(ErrorCode.INTERNAL_ERROR);
        }
    }

    private String buildLaunchUrl(String provider, String launchToken) {
        String baseUrl = properties.getOauth().requireCallbackBaseUrl().replaceAll("/+$", "");
        return baseUrl + "/api/auth/oauth/launch/" + provider + "/" + launchToken;
    }
}
