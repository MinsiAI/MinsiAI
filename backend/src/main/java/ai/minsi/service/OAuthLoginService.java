package ai.minsi.service;

import ai.minsi.client.oauth.OAuthProvider;
import ai.minsi.client.oauth.OAuthProviderClient;
import ai.minsi.client.oauth.OAuthSubject;
import ai.minsi.common.BusinessException;
import ai.minsi.common.ErrorCode;
import ai.minsi.dto.oauth.OAuthStartResponse;
import ai.minsi.entity.User;
import ai.minsi.util.HashUtils;
import org.springframework.stereotype.Service;
import org.springframework.util.StringUtils;

import java.util.List;
import java.util.Map;
import java.util.function.Function;
import java.util.stream.Collectors;

@Service
public class OAuthLoginService {

    private static final int EXPIRES_IN_SECONDS = 600;

    private final Map<OAuthProvider, OAuthProviderClient> clients;
    private final HashUtils hashUtils;
    private final OAuthStateService oauthStateService;
    private final UserService userService;
    private final SessionService sessionService;

    public OAuthLoginService(
            List<OAuthProviderClient> clients,
            HashUtils hashUtils,
            OAuthStateService oauthStateService,
            UserService userService,
            SessionService sessionService
    ) {
        this.clients = clients.stream().collect(Collectors.toUnmodifiableMap(OAuthProviderClient::provider, Function.identity()));
        this.hashUtils = hashUtils;
        this.oauthStateService = oauthStateService;
        this.userService = userService;
        this.sessionService = sessionService;
    }

    public OAuthStartResponse start(String providerValue, String redirect, String origin, boolean mobileClient) {
        OAuthProvider provider = OAuthProvider.from(providerValue);
        OAuthProviderClient client = clients.get(provider);
        if (client == null) {
            throw new BusinessException(ErrorCode.BAD_REQUEST);
        }

        String state = oauthStateService.create(provider.value(), redirect, origin);
        return new OAuthStartResponse(client.buildAuthorizeUrl(state, mobileClient), EXPIRES_IN_SECONDS, state, null);
    }

    public OAuthStateService.StatePayload verifyState(String providerValue, String state) {
        OAuthProvider provider = OAuthProvider.from(providerValue);
        return oauthStateService.verify(provider.value(), state);
    }

    public CallbackResult complete(String providerValue, String code, String state) {
        OAuthProvider provider = OAuthProvider.from(providerValue);
        if (!StringUtils.hasText(code) || !StringUtils.hasText(state)) {
            throw new BusinessException(ErrorCode.BAD_REQUEST);
        }

        OAuthStateService.StatePayload statePayload = oauthStateService.verify(provider.value(), state);

        OAuthSubject subject = clients.get(provider).exchangeCode(code);
        String providerSubjectHash = hashUtils.sha256WithConfiguredSalt(provider.value() + ":" + subject.subject());
        User user = userService.findOrCreateOAuthUser(provider.value(), providerSubjectHash);
        SessionService.CreatedSession session = sessionService.createSession(user.getId());
        return new CallbackResult(session, statePayload.redirect(), statePayload.origin());
    }

    public record CallbackResult(SessionService.CreatedSession session, String redirect, String origin) {
    }
}
