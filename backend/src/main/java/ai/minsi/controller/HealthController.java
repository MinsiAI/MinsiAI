package ai.minsi.controller;

import ai.minsi.common.ApiResponse;
import ai.minsi.dto.HealthResponse;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.time.Instant;

@RestController
@RequestMapping("/api")
public class HealthController {

    @GetMapping("/health")
    public ApiResponse<HealthResponse> health() {
        return ApiResponse.success(new HealthResponse("ok", "minsi-backend", Instant.now()));
    }
}
