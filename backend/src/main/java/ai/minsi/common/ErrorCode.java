package ai.minsi.common;

public enum ErrorCode {
    BAD_REQUEST("BAD_REQUEST", "请求参数无效。", 400),
    UNAUTHORIZED("UNAUTHORIZED", "请先登录。", 401),
    FORBIDDEN("FORBIDDEN", "没有访问权限。", 403),
    NOT_FOUND("NOT_FOUND", "资源不存在。", 404),
    RATE_LIMITED("RATE_LIMITED", "请求太频繁，请稍后再试。", 429),
    VOICE_NOT_CLEAR("VOICE_NOT_CLEAR", "这一句没有听清，可以再说一遍。", 400),
    VOICE_UNAVAILABLE("VOICE_UNAVAILABLE", "语音服务暂时不可用，请稍后再试。", 503),
    VALIDATION_FAILED("VALIDATION_FAILED", "请求参数无效。", 400),
    INTERNAL_ERROR("INTERNAL_ERROR", "服务暂时不可用，请稍后再试。", 500);

    private final String code;
    private final String message;
    private final int httpStatus;

    ErrorCode(String code, String message, int httpStatus) {
        this.code = code;
        this.message = message;
        this.httpStatus = httpStatus;
    }

    public String getCode() {
        return code;
    }

    public String getMessage() {
        return message;
    }

    public int getHttpStatus() {
        return httpStatus;
    }
}
