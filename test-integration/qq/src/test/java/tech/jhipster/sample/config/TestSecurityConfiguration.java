package tech.jhipster.sample.config;

import static org.mockito.Mockito.mock;

import java.util.HashMap;
import java.util.Map;
import org.springframework.boot.test.context.TestConfiguration;
import org.springframework.context.annotation.Bean;
import org.springframework.security.oauth2.client.InMemoryReactiveOAuth2AuthorizedClientService;
import org.springframework.security.oauth2.client.ReactiveOAuth2AuthorizedClientService;
import org.springframework.security.oauth2.client.registration.ClientRegistration;
import org.springframework.security.oauth2.client.registration.InMemoryReactiveClientRegistrationRepository;
import org.springframework.security.oauth2.client.registration.ReactiveClientRegistrationRepository;
import org.springframework.security.oauth2.core.AuthorizationGrantType;
import org.springframework.security.oauth2.core.ClientAuthenticationMethod;
import org.springframework.security.oauth2.jwt.ReactiveJwtDecoder;

/**
 * This class allows you to run unit and integration tests without an IdP.
 */
@TestConfiguration
public class TestSecurityConfiguration {

    @Bean
    ClientRegistration clientRegistration() {
        return clientRegistrationBuilder().build();
    }

    @Bean
    ReactiveClientRegistrationRepository clientRegistrationRepository(ClientRegistration clientRegistration) {
        return new InMemoryReactiveClientRegistrationRepository(clientRegistration);
    }

    private ClientRegistration.Builder clientRegistrationBuilder() {
        Map<String, Object> metadata = new HashMap<>();
        metadata.put("end_session_endpoint", "https://jhipster.org/logout");

        return ClientRegistration
            .withRegistrationId("oidc")
            .issuerUri("{baseUrl}")
            .redirectUri("{baseUrl}/{action}/oauth2/code/{registrationId}")
            .clientAuthenticationMethod(ClientAuthenticationMethod.CLIENT_SECRET_BASIC)
            .authorizationGrantType(AuthorizationGrantType.AUTHORIZATION_CODE)
            .scope("read:user")
            .authorizationUri("https://jhipster.org/login/oauth/authorize")
            .tokenUri("https://jhipster.org/login/oauth/access_token")
            .jwkSetUri("https://jhipster.org/oauth/jwk")
            .userInfoUri("https://api.jhipster.org/user")
            .providerConfigurationMetadata(metadata)
            .userNameAttributeName("id")
            .clientName("Client Name")
            .clientId("client-id")
            .clientSecret("client-secret");
    }

    @Bean
    ReactiveJwtDecoder jwtDecoder() {
        return mock(ReactiveJwtDecoder.class);
    }

    @Bean
    ReactiveOAuth2AuthorizedClientService authorizedClientService(ReactiveClientRegistrationRepository clientRegistrationRepository) {
        return new InMemoryReactiveOAuth2AuthorizedClientService(clientRegistrationRepository);
    }
}
