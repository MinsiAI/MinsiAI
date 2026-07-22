package ai.minsi.common;

import com.fasterxml.jackson.annotation.JsonInclude;

@JsonInclude(JsonInclude.Include.NON_NULL)
public class ApiResponse<T> {

    private final boolean ok;
    private final T data;
    private final ErrorBody error;

    private ApiResponse(boolean ok, T data, ErrorBody error) {
        this.ok = ok;
        this.data = data;
        this.error = error;
    }

    public static ApiResponse<Void> success() {
        return new ApiResponse<>(true, null, null);
    }

    public static <T> ApiResponse<T> success(T data) {
        return new ApiResponse<>(true, data, null);
    }

    public static ApiResponse<Void> failure(ErrorCode errorCode) {
        return failure(errorCode, errorCode.getMessage());
    }

    public static ApiResponse<Void> failure(ErrorCode errorCode, String safeMessage) {
        return new ApiResponse<>(false, null, new ErrorBody(errorCode.getCode(), safeMessage));
    }

    public boolean isOk() {
        return ok;
    }

    public T getData() {
        return data;
    }

    public ErrorBody getError() {
        return error;
    }

    public record ErrorBody(String code, String message) {
    }
}
