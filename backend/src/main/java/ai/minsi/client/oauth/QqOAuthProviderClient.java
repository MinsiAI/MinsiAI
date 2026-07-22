package ai.minsi.client.oauth;

import ai.minsi.common.BusinessException;
import ai.minsi.common.ErrorCode;
import ai.minsi.config.MinsiProperties;
import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.springframework.stereotype.Component;
import org.springframework.util.StringUtils;
import org.springframework.web.util.UriComponentsBuilder;

import java.net.URLDecoder;
import java.nio.charset.StandardCharsets;
import java.util.Arrays;
import java.util.Map;
import java.util.stream.Collectors;

@Component
public class QqOAuthProviderClient extends AbstractOAuthProviderClient {

    private final MinsiProperties properties;
    private final ObjectMapper objectMapper;

    public QqOAuthProviderClient(MinsiProperties properties, ObjectMapper objectMapper) {
        super(objectMapper);
        this.properties = properties;
        this.objectMapper = objectMapper;
    }

    @Override
    public OAuthProvider provider() {
        return OAuthProvider.QQ;
    }

    @Override
    public String buildAuthorizeUrl(String state, boolean mobileClient) {
        MinsiProperties.Provider provider = properties.getOauth().getQq();
        return UriComponentsBuilder.fromUriString("https://graph.qq.com/oauth2.0/authorize")
                .queryParam("response_type", "code")
                .queryParam("client_id", provider.requireAppId())
                .queryParam("redirect_uri", callbackUri())
                .queryParam("state", state)
                .queryParam("scope", "get_user_info")
                .queryParam("display", mobileClient ? "mobile" : "pc")
                .build()
                .encode()
                .toUriString();
    }

    @Override
    public OAuthSubject exchangeCode(String code) {
        String accessToken = fetchAccessToken(code);
        String openId = fetchOpenId(accessToken);
        if (!StringUtils.hasText(openId)) {
            throw new BusinessException(ErrorCode.BAD_REQUEST);
        }
        return new OAuthSubject(provider(), "openid:" + openId);
    }

    private String fetchAccessToken(String code) {
        MinsiProperties.Provider provider = properties.getOauth().getQq();
        String url = UriComponentsBuilder.fromUriString("https://graph.qq.com/oauth2.0/token")
                .queryParam("grant_type", "authorization_code")
                .queryParam("client_id", provider.requireAppId())
                .queryParam("client_secret", provider.requireAppSecret())
                .queryParam("code", code)
                .queryParam("redirect_uri", callbackUri())
                .queryParam("fmt", "json")
                .build()
                .encode()
                .toUriString();

        String body = getText(url);
        Map<String, String> payload = requireSuccess(parseJsonOrForm(body));
        String accessToken = payload.get("access_token");
        if (!StringUtils.hasText(accessToken)) {
            throw new BusinessException(ErrorCode.BAD_REQUEST);
        }
        return accessToken;
    }

    private String fetchOpenId(String accessToken) {
        String url = UriComponentsBuilder.fromUriString("https://graph.qq.com/oauth2.0/me")
                .queryParam("access_token", accessToken)
                .queryParam("fmt", "json")
                .build()
                .encode()
                .toUriString();

        Map<String, String> payload = requireSuccess(parseJsonOrForm(getText(url)));
        return payload.get("openid");
    }

    private Map<String, String> parseJsonOrForm(String body) {
        String text = body == null ? "" : body.trim();
        if (text.startsWith("callback(") && text.endsWith(");")) {
            text = text.substring("callback(".length(), text.length() - 2).trim();
        }

        if (text.startsWith("{")) {
            try {
                return objectMapper.readValue(text, new TypeReference<>() {
                });
            } catch (JsonProcessingException exception) {
                throw new BusinessException(ErrorCode.INTERNAL_ERROR);
            }
        }

        return Arrays.stream(text.split("&"))
                .map(part -> part.split("=", 2))
                .filter(parts -> parts.length == 2)
                .collect(Collectors.toMap(
                        parts -> URLDecoder.decode(parts[0], StandardCharsets.UTF_8),
                        parts -> URLDecoder.decode(parts[1], StandardCharsets.UTF_8),
                        (first, second) -> first
                ));
    }

    private Map<String, String> requireSuccess(Map<String, String> payload) {
        if (payload.containsKey("error")) {
            throw new BusinessException(ErrorCode.BAD_REQUEST);
        }
        return payload;
    }

    private String callbackUri() {
        return properties.getOauth().requireCallbackBaseUrl() + "/api/auth/oauth/callback/qq";
    }
}
