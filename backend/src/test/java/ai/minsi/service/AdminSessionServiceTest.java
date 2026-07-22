package ai.minsi.service;

import ai.minsi.entity.AdminUser;
import ai.minsi.mapper.AdminUserMapper;
import ai.minsi.util.HashUtils;
import ai.minsi.util.SessionTokenGenerator;
import org.junit.jupiter.api.Test;
import org.mockito.ArgumentCaptor;
import org.springframework.data.redis.core.HashOperations;
import org.springframework.data.redis.core.StringRedisTemplate;

import java.time.Duration;
import java.util.Map;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

class AdminSessionServiceTest {

    private static final String RAW_ADMIN_SESSION_TOKEN = "raw-admin-session-token";
    private static final String HASH_SALT = "test-salt";

    @Test
    @SuppressWarnings({"rawtypes", "unchecked"})
    void createSessionStoresOnlyHashedAdminSessionTokenInAdminRedisNamespace() {
        StringRedisTemplate redisTemplate = mock(StringRedisTemplate.class);
        HashOperations<String, Object, Object> hashOperations = mock(HashOperations.class);
        when(redisTemplate.opsForHash()).thenReturn(hashOperations);
        HashUtils hashUtils = new HashUtils(HASH_SALT);
        AdminSessionService service = new AdminSessionService(
                redisTemplate,
                hashUtils,
                fixedTokenGenerator(),
                new AdminUserService(mock(AdminUserMapper.class))
        );

        AdminSessionService.CreatedAdminSession session = service.createSession(adminUser());

        String expectedHash = hashUtils.sha256WithConfiguredSalt(RAW_ADMIN_SESSION_TOKEN);
        ArgumentCaptor<Map> fieldsCaptor = ArgumentCaptor.forClass(Map.class);
        verify(hashOperations).putAll(eq("admin:session:" + expectedHash), fieldsCaptor.capture());
        verify(redisTemplate).expire("admin:session:" + expectedHash, Duration.ofHours(12));
        assertThat(fieldsCaptor.getValue())
                .containsEntry("admin_user_id", "11")
                .containsEntry("role", "owner")
                .containsKey("expires_at")
                .doesNotContainValue(RAW_ADMIN_SESSION_TOKEN);
        assertThat(session.token()).isEqualTo(RAW_ADMIN_SESSION_TOKEN);
    }

    private SessionTokenGenerator fixedTokenGenerator() {
        return new SessionTokenGenerator() {
            @Override
            public String generate() {
                return RAW_ADMIN_SESSION_TOKEN;
            }
        };
    }

    private AdminUser adminUser() {
        AdminUser adminUser = new AdminUser();
        adminUser.setId(11L);
        adminUser.setEmail("owner@example.com");
        adminUser.setRole("owner");
        adminUser.setStatus("active");
        return adminUser;
    }
}
