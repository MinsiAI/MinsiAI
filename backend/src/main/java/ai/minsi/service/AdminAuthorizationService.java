package ai.minsi.service;

import ai.minsi.common.BusinessException;
import ai.minsi.common.ErrorCode;
import ai.minsi.security.AdminAuthenticatedUser;
import org.springframework.stereotype.Service;

import java.util.Set;

@Service
public class AdminAuthorizationService {

    private static final Set<String> FEEDBACK_ROLES = Set.of(
            AdminUserService.ROLE_OWNER,
            AdminUserService.ROLE_MODERATOR
    );

    public void requireModeratorOrOwner(AdminAuthenticatedUser adminUser) {
        if (adminUser == null) {
            throw new BusinessException(ErrorCode.UNAUTHORIZED);
        }

        if (!FEEDBACK_ROLES.contains(adminUser.role())) {
            throw new BusinessException(ErrorCode.FORBIDDEN);
        }
    }
}
