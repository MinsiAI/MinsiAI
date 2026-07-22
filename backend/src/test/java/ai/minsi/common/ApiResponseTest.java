package ai.minsi.common;

import org.junit.jupiter.api.Test;

import static org.assertj.core.api.Assertions.assertThat;

class ApiResponseTest {

    @Test
    void successContainsDataWithoutError() {
        ApiResponse<String> response = ApiResponse.success("ok");

        assertThat(response.isOk()).isTrue();
        assertThat(response.getData()).isEqualTo("ok");
        assertThat(response.getError()).isNull();
    }

    @Test
    void failureContainsSanitizedErrorShape() {
        ApiResponse<Void> response = ApiResponse.failure(ErrorCode.RATE_LIMITED);

        assertThat(response.isOk()).isFalse();
        assertThat(response.getData()).isNull();
        assertThat(response.getError().code()).isEqualTo("RATE_LIMITED");
        assertThat(response.getError().message()).isEqualTo(ErrorCode.RATE_LIMITED.getMessage());
    }
}
