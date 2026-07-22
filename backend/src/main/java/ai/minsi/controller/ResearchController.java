package ai.minsi.controller;

import ai.minsi.common.ApiResponse;
import ai.minsi.dto.research.ApprovedResearchFeedbackResponse;
import ai.minsi.dto.research.ResearchFeedbackMetricsResponse;
import ai.minsi.dto.research.ResearchFeedbackSubmitRequest;
import ai.minsi.dto.research.ResearchFeedbackSubmitResponse;
import ai.minsi.security.AuthenticatedUser;
import ai.minsi.service.ResearchFeedbackService;
import ai.minsi.util.IpUtils;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.validation.Valid;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/api/research/feedback")
public class ResearchController {

    private final ResearchFeedbackService researchFeedbackService;

    public ResearchController(ResearchFeedbackService researchFeedbackService) {
        this.researchFeedbackService = researchFeedbackService;
    }

    @PostMapping
    public ApiResponse<ResearchFeedbackSubmitResponse> submit(
            @Valid @RequestBody ResearchFeedbackSubmitRequest request,
            @AuthenticationPrincipal AuthenticatedUser currentUser,
            HttpServletRequest servletRequest
    ) {
        return ApiResponse.success(researchFeedbackService.submit(
                currentUser,
                IpUtils.resolveClientIp(servletRequest),
                request
        ));
    }

    @GetMapping
    public ApiResponse<List<ApprovedResearchFeedbackResponse>> listApproved() {
        return ApiResponse.success(researchFeedbackService.listApproved());
    }

    @GetMapping("/metrics")
    public ApiResponse<ResearchFeedbackMetricsResponse> metrics() {
        return ApiResponse.success(researchFeedbackService.metrics());
    }
}
