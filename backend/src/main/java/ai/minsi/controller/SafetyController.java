package ai.minsi.controller;

import ai.minsi.common.ApiResponse;
import ai.minsi.dto.safety.SafetyResourceResponse;
import ai.minsi.service.SafetyResourceService;
import jakarta.validation.constraints.Pattern;
import org.springframework.validation.annotation.Validated;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@Validated
@RestController
@RequestMapping("/api/safety")
public class SafetyController {

    private final SafetyResourceService safetyResourceService;

    public SafetyController(SafetyResourceService safetyResourceService) {
        this.safetyResourceService = safetyResourceService;
    }

    @GetMapping("/resources")
    public ApiResponse<List<SafetyResourceResponse>> resources(
            @RequestParam(defaultValue = "zh") @Pattern(regexp = "zh|en") String lang
    ) {
        return ApiResponse.success(safetyResourceService.list(lang));
    }
}
