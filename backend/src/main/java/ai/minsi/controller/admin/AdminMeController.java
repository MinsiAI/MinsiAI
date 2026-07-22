package ai.minsi.controller.admin;

import ai.minsi.common.ApiResponse;
import ai.minsi.dto.admin.AdminMeResponse;
import ai.minsi.security.AdminAuthenticatedUser;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/admin")
public class AdminMeController {

    @GetMapping("/me")
    public ApiResponse<AdminMeResponse> me(@AuthenticationPrincipal AdminAuthenticatedUser currentAdmin) {
        return ApiResponse.success(new AdminMeResponse(
                true,
                currentAdmin.emailMasked(),
                currentAdmin.role()
        ));
    }
}
