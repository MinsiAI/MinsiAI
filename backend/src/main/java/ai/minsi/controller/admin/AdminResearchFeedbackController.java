package ai.minsi.controller.admin;

import ai.minsi.common.ApiResponse;
import ai.minsi.dto.admin.AdminResearchFeedbackDetail;
import ai.minsi.dto.admin.AdminResearchFeedbackPageResponse;
import ai.minsi.dto.admin.AdminResearchFeedbackUpdateRequest;
import ai.minsi.security.AdminAuthenticatedUser;
import ai.minsi.service.AdminAuditService;
import ai.minsi.service.AdminResearchFeedbackService;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.validation.Valid;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/admin/research-feedback")
public class AdminResearchFeedbackController {

    private final AdminResearchFeedbackService adminResearchFeedbackService;
    private final AdminAuditService adminAuditService;

    public AdminResearchFeedbackController(
            AdminResearchFeedbackService adminResearchFeedbackService,
            AdminAuditService adminAuditService
    ) {
        this.adminResearchFeedbackService = adminResearchFeedbackService;
        this.adminAuditService = adminAuditService;
    }

    @GetMapping
    public ApiResponse<AdminResearchFeedbackPageResponse> list(
            @AuthenticationPrincipal AdminAuthenticatedUser currentAdmin,
            @RequestParam(name = "status", required = false) String status,
            @RequestParam(name = "page", required = false) Integer page,
            @RequestParam(name = "limit", required = false) Integer limit
    ) {
        return ApiResponse.success(adminResearchFeedbackService.list(currentAdmin, status, page, limit));
    }

    @GetMapping("/{id}")
    public ApiResponse<AdminResearchFeedbackDetail> get(
            @AuthenticationPrincipal AdminAuthenticatedUser currentAdmin,
            @PathVariable Long id
    ) {
        return ApiResponse.success(adminResearchFeedbackService.get(currentAdmin, id));
    }

    @PatchMapping("/{id}")
    public ApiResponse<AdminResearchFeedbackDetail> update(
            @AuthenticationPrincipal AdminAuthenticatedUser currentAdmin,
            @PathVariable Long id,
            @Valid @RequestBody AdminResearchFeedbackUpdateRequest request,
            HttpServletRequest servletRequest
    ) {
        return ApiResponse.success(adminResearchFeedbackService.update(
                currentAdmin,
                id,
                request,
                adminAuditService.contextFrom(servletRequest)
        ));
    }
}
