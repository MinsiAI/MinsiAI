package ai.minsi.service;

import ai.minsi.entity.User;
import ai.minsi.mapper.UserMapper;
import com.baomidou.mybatisplus.core.conditions.query.LambdaQueryWrapper;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.Optional;

@Service
public class UserService {

    private static final String AUTH_PROVIDER_EMAIL = "email";
    private static final String STATUS_ACTIVE = "active";

    private final UserMapper userMapper;

    public UserService(UserMapper userMapper) {
        this.userMapper = userMapper;
    }

    @Transactional
    public User findOrCreateEmailUser(String normalizedEmail) {
        Optional<User> existingUser = findByEmail(normalizedEmail);
        LocalDateTime now = LocalDateTime.now();

        if (existingUser.isPresent()) {
            User user = existingUser.get();
            user.setLastLoginAt(now);
            user.setUpdatedAt(now);
            userMapper.updateById(user);
            return user;
        }

        User user = new User();
        user.setEmail(normalizedEmail);
        user.setAuthProvider(AUTH_PROVIDER_EMAIL);
        user.setProviderSubjectHash(null);
        user.setStatus(STATUS_ACTIVE);
        user.setCreatedAt(now);
        user.setLastLoginAt(now);
        user.setUpdatedAt(now);
        userMapper.insert(user);
        return user;
    }

    @Transactional
    public User findOrCreateOAuthUser(String provider, String providerSubjectHash) {
        Optional<User> existingUser = findByProviderSubjectHash(provider, providerSubjectHash);
        LocalDateTime now = LocalDateTime.now();

        if (existingUser.isPresent()) {
            User user = existingUser.get();
            user.setLastLoginAt(now);
            user.setUpdatedAt(now);
            userMapper.updateById(user);
            return user;
        }

        User user = new User();
        user.setEmail(null);
        user.setAuthProvider(provider);
        user.setProviderSubjectHash(providerSubjectHash);
        user.setStatus(STATUS_ACTIVE);
        user.setCreatedAt(now);
        user.setLastLoginAt(now);
        user.setUpdatedAt(now);
        userMapper.insert(user);
        return user;
    }

    public Optional<User> findActiveById(Long userId) {
        if (userId == null) {
            return Optional.empty();
        }

        User user = userMapper.selectById(userId);
        if (user == null || !STATUS_ACTIVE.equals(user.getStatus())) {
            return Optional.empty();
        }
        return Optional.of(user);
    }

    private Optional<User> findByEmail(String normalizedEmail) {
        LambdaQueryWrapper<User> query = new LambdaQueryWrapper<User>()
                .eq(User::getEmail, normalizedEmail)
                .last("LIMIT 1");
        return Optional.ofNullable(userMapper.selectOne(query));
    }

    private Optional<User> findByProviderSubjectHash(String provider, String providerSubjectHash) {
        LambdaQueryWrapper<User> query = new LambdaQueryWrapper<User>()
                .eq(User::getAuthProvider, provider)
                .eq(User::getProviderSubjectHash, providerSubjectHash)
                .last("LIMIT 1");
        return Optional.ofNullable(userMapper.selectOne(query));
    }
}
