package ai.minsi.client.oauth;

import ai.minsi.common.BusinessException;
import ai.minsi.common.ErrorCode;
import ai.minsi.config.MinsiProperties;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.springframework.stereotype.Component;
import org.springframework.util.StringUtils;
import org.springframework.web.util.UriComponentsBuilder;

import java.util.Map;

@Component
public class WechatOAuthProviderClient extends AbstractOAuthProviderClient {

    private final MinsiProperties properties;

    public WechatOAuthProviderClient(MinsiProperties properties, ObjectMapper objectMapper) {
        super(objectMapper);
        this.properties = properties;
    }

    @Override
    public OAuthProvider provider() {
        return OAuthProvider.WECHAT;
    }

    @Override
    public String buildAuthorizeUrl(String state, boolean mobileClient) {
        MinsiProperties.Provider provider = properties.getOauth().getWechat();
        String redirectUri = callbackUri();
        return UriComponentsBuilder.fromUriString("https://open.weixin.qq.com/connect/qrconnect")
                .queryParam("appid", provider.requireAppId())
                .queryParam("redirect_uri", redirectUri)
                .queryParam("response_type", "code")
                .queryParam("scope", "snsapi_login")
                .queryParam("state", state)
                .fragment("wechat_redirect")
                .build()
                .encode()
                .toUriString();
    }

    @Override
    public OAuthSubject exchangeCode(String code) {
        MinsiProperties.Provider provider = properties.getOauth().getWechat();
        Map<String, Object> tokenPayload = fetchAccessToken(provider, code);
        String accessToken = value(tokenPayload, "access_token");
        String openId = value(tokenPayload, "openid");
        if (!StringUtils.hasText(accessToken) || !StringUtils.hasText(openId)) {
            throw new BusinessException(ErrorCode.BAD_REQUEST);
        }

        Map<String, Object> userInfoPayload = fetchUserInfo(accessToken, openId);
        String unionId = firstText(value(userInfoPayload, "unionid"), value(tokenPayload, "unionid"));
        String subject = StringUtils.hasText(unionId) ? "unionid:" + unionId : "openid:" + openId;

        return new OAuthSubject(provider(), subject);
    }

    private Map<String, Object> fetchAccessToken(MinsiProperties.Provider provider, String code) {
        String url = UriComponentsBuilder.fromUriString("https://api.weixin.qq.com/sns/oauth2/access_token")
                .queryParam("appid", provider.requireAppId())
                .queryParam("secret", provider.requireAppSecret())
                .queryParam("code", code)
                .queryParam("grant_type", "authorization_code")
                .build()
                .encode()
                .toUriString();
        return requireSuccess(getJson(url));
    }

    private Map<String, Object> fetchUserInfo(String accessToken, String openId) {
        String url = UriComponentsBuilder.fromUriString("https://api.weixin.qq.com/sns/userinfo")
                .queryParam("access_token", accessToken)
                .queryParam("openid", openId)
                .queryParam("lang", "zh_CN")
                .build()
                .encode()
                .toUriString();
        return requireSuccess(getJson(url));
    }

    private Map<String, Object> requireSuccess(Map<String, Object> payload) {
        if (payload.containsKey("errcode")) {
            throw new BusinessException(ErrorCode.BAD_REQUEST);
        }
        return payload;
    }

    private String callbackUri() {
        return properties.getOauth().requireCallbackBaseUrl() + "/api/auth/oauth/callback/wechat";
    }

    private String value(Map<String, Object> payload, String key) {
        Object value = payload.get(key);
        return value == null ? "" : String.valueOf(value);
    }

    private String firstText(String first, String second) {
        if (StringUtils.hasText(first)) {
            return first;
        }
        return StringUtils.hasText(second) ? second : "";
    }
}
