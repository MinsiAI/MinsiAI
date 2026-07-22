package ai.minsi.service;

import ai.minsi.entity.AdminUser;
import ai.minsi.mapper.AdminUserMapper;
import com.baomidou.mybatisplus.core.conditions.query.LambdaQueryWrapper;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.Locale;
import java.util.Optional;
import java.util.Set;

@Service
public class AdminUserService {

    public static final String ROLE_OWNER = "owner";
    public static final String ROLE_MODERATOR = "moderator";

    private static final String STATUS_ACTIVE = "active";
    private static final Set<String> ALLOWED_ROLES = Set.of(ROLE_OWNER, ROLE_MODERATOR);

    private final AdminUserMapper adminUserMapper;

    public AdminUserService(AdminUserMapper adminUserMapper) {
        this.adminUserMapper = adminUserMapper;
    }

    public Optional<AdminUser> findActiveByEmail(String normalizedEmail) {
        LambdaQueryWrapper<AdminUser> query = new LambdaQueryWrapper<AdminUser>()
                .eq(AdminUser::getEmail, normalizedEmail)
                .eq(AdminUser::getStatus, STATUS_ACTIVE)
                .last("LIMIT 1");
        return Optional.ofNullable(adminUserMapper.selectOne(query))
                .filter(this::hasAllowedRole);
    }

    public Optional<AdminUser> findActiveById(Long adminUserId) {
        if (adminUserId == null) {
            return Optional.empty();
        }

        AdminUser adminUser = adminUserMapper.selectById(adminUserId);
        if (adminUser == null || !STATUS_ACTIVE.equals(adminUser.getStatus()) || !hasAllowedRole(adminUser)) {
            return Optional.empty();
        }
        return Optional.of(adminUser);
    }

    @Transactional
    public void touchLastLogin(AdminUser adminUser) {
        LocalDateTime now = LocalDateTime.now();
        adminUser.setLastLoginAt(now);
        adminUser.setUpdatedAt(now);
        adminUserMapper.updateById(adminUser);
    }

    public boolean hasAllowedRole(AdminUser adminUser) {
        return adminUser != null && ALLOWED_ROLES.contains(normalizeRole(adminUser.getRole()));
    }

    public String normalizeRole(String role) {
        return role == null ? "" : role.trim().toLowerCase(Locale.ROOT);
    }
}
