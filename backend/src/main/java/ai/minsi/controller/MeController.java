package ai.minsi.controller;

import ai.minsi.common.ApiResponse;
import ai.minsi.dto.user.MeResponse;
import ai.minsi.security.AuthenticatedUser;
import ai.minsi.util.EmailMasker;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api")
public class MeController {

    @GetMapping("/me")
    public ApiResponse<MeResponse> me(@AuthenticationPrincipal AuthenticatedUser currentUser) {
        return ApiResponse.success(new MeResponse(
                true,
                EmailMasker.mask(currentUser.email()),
                currentUser.authProvider(),
                currentUser.providerLabel()
        ));
    }
}
