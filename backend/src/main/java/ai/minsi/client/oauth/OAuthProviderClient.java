package ai.minsi.client.oauth;

public interface OAuthProviderClient {

    OAuthProvider provider();

    String buildAuthorizeUrl(String state, boolean mobileClient);

    OAuthSubject exchangeCode(String code);
}
