package tech.jhipster.sample.web.rest;

import static org.springframework.security.test.web.reactive.server.SecurityMockServerConfigurers.*;
import static tech.jhipster.sample.test.util.OAuth2TestUtil.ID_TOKEN;
import static tech.jhipster.sample.test.util.OAuth2TestUtil.authenticationToken;
import static tech.jhipster.sample.test.util.OAuth2TestUtil.registerAuthenticationToken;

import java.util.Collections;
import java.util.HashMap;
import java.util.Map;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.context.ApplicationContext;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.security.oauth2.client.ReactiveOAuth2AuthorizedClientService;
import org.springframework.security.oauth2.client.registration.ClientRegistration;
import org.springframework.security.oauth2.client.registration.ReactiveClientRegistrationRepository;
import org.springframework.test.web.reactive.server.WebTestClient;
import tech.jhipster.sample.IntegrationTest;
import tech.jhipster.sample.security.AuthoritiesConstants;

/**
 * Integration tests for the {@link LogoutResource} REST controller.
 */
@IntegrationTest
class LogoutResourceIT {

    @Autowired
    private ReactiveClientRegistrationRepository registrations;

    @Autowired
    private ApplicationContext context;

    @Autowired
    private ReactiveOAuth2AuthorizedClientService authorizedClientService;

    @Autowired
    private ClientRegistration clientRegistration;

    private WebTestClient webTestClient;

    private Map<String, Object> claims;

    @BeforeEach
    public void before() {
        claims = new HashMap<>();
        claims.put("groups", Collections.singletonList(AuthoritiesConstants.USER));
        claims.put("sub", 123);

        this.webTestClient = WebTestClient.bindToApplicationContext(this.context).apply(springSecurity()).configureClient().build();
    }

    @Test
    void getLogoutInformation() {
        final String ORIGIN_URL = "http://localhost:8080";
        String logoutUrl =
            this.registrations.findByRegistrationId("oidc")
                .map(oidc -> oidc.getProviderDetails().getConfigurationMetadata().get("end_session_endpoint").toString())
                .block();
        logoutUrl = logoutUrl + "?id_token_hint=" + ID_TOKEN + "&post_logout_redirect_uri=" + ORIGIN_URL;
        this.webTestClient.mutateWith(csrf())
            .mutateWith(
                mockAuthentication(registerAuthenticationToken(authorizedClientService, clientRegistration, authenticationToken(claims)))
            )
            .post()
            .uri("http://localhost:8080/api/logout")
            .header(HttpHeaders.ORIGIN, ORIGIN_URL)
            .exchange()
            .expectStatus()
            .isOk()
            .expectHeader()
            .contentType(MediaType.APPLICATION_JSON_VALUE)
            .expectBody()
            .jsonPath("$.logoutUrl")
            .isEqualTo(logoutUrl);
    }
}
