package ai.minsi.client.oauth;

import ai.minsi.config.MinsiProperties;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.junit.jupiter.api.Test;
import org.springframework.web.util.UriComponents;
import org.springframework.web.util.UriComponentsBuilder;

import static org.assertj.core.api.Assertions.assertThat;

class QqOAuthProviderClientTest {

    @Test
    void buildsPcAuthorizeUrlWithoutClientSecret() {
        MinsiProperties properties = new MinsiProperties();
        properties.getOauth().setCallbackBaseUrl("https://api.minsi.ai/");
        properties.getOauth().getQq().setClientId("qq-client-id");
        properties.getOauth().getQq().setClientSecret("qq-client-secret");
        QqOAuthProviderClient client = new QqOAuthProviderClient(properties, new ObjectMapper());

        String authorizeUrl = client.buildAuthorizeUrl("signed-state", false);

        UriComponents uri = UriComponentsBuilder.fromUriString(authorizeUrl).build();
        assertThat(uri.getScheme()).isEqualTo("https");
        assertThat(uri.getHost()).isEqualTo("graph.qq.com");
        assertThat(uri.getPath()).isEqualTo("/oauth2.0/authorize");
        assertThat(uri.getQueryParams().getFirst("response_type")).isEqualTo("code");
        assertThat(uri.getQueryParams().getFirst("client_id")).isEqualTo("qq-client-id");
        assertThat(uri.getQueryParams().getFirst("redirect_uri")).isEqualTo("https://api.minsi.ai/api/auth/oauth/callback/qq");
        assertThat(uri.getQueryParams().getFirst("scope")).isEqualTo("get_user_info");
        assertThat(uri.getQueryParams().getFirst("display")).isEqualTo("pc");
        assertThat(uri.getQueryParams().getFirst("state")).isEqualTo("signed-state");
        assertThat(authorizeUrl).doesNotContain("qq-client-secret");
    }

    @Test
    void buildsMobileAuthorizeUrlForMobileClient() {
        MinsiProperties properties = new MinsiProperties();
        properties.getOauth().setCallbackBaseUrl("https://api.minsi.ai/");
        properties.getOauth().getQq().setClientId("qq-client-id");
        properties.getOauth().getQq().setClientSecret("qq-client-secret");
        QqOAuthProviderClient client = new QqOAuthProviderClient(properties, new ObjectMapper());

        String authorizeUrl = client.buildAuthorizeUrl("signed-state", true);

        UriComponents uri = UriComponentsBuilder.fromUriString(authorizeUrl).build();
        assertThat(uri.getQueryParams().getFirst("display")).isEqualTo("mobile");
    }
}
