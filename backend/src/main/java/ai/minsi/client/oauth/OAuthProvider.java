package ai.minsi.client.oauth;

import ai.minsi.common.BusinessException;
import ai.minsi.common.ErrorCode;

import java.util.Locale;

public enum OAuthProvider {
    WECHAT("wechat"),
    QQ("qq");

    private final String value;

    OAuthProvider(String value) {
        this.value = value;
    }

    public String value() {
        return value;
    }

    public static OAuthProvider from(String value) {
        if (value == null) {
            throw new BusinessException(ErrorCode.BAD_REQUEST);
        }

        return switch (value.toLowerCase(Locale.ROOT)) {
            case "wechat" -> WECHAT;
            case "qq" -> QQ;
            default -> throw new BusinessException(ErrorCode.BAD_REQUEST);
        };
    }
}
