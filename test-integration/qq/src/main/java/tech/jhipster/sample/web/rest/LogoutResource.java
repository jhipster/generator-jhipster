package tech.jhipster.sample.web.rest;

import java.util.Map;
import org.springframework.http.ResponseEntity;
import org.springframework.http.server.reactive.ServerHttpRequest;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.oauth2.client.registration.ClientRegistration;
import org.springframework.security.oauth2.client.registration.ReactiveClientRegistrationRepository;
import org.springframework.security.oauth2.core.oidc.OidcIdToken;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.server.WebSession;
import reactor.core.publisher.Mono;

/**
 * REST controller for managing global OIDC logout.
 */
@RestController
public class LogoutResource {

    private final Mono<ClientRegistration> registration;

    public LogoutResource(ReactiveClientRegistrationRepository registrations) {
        this.registration = registrations.findByRegistrationId("oidc");
    }

    /**
     * {@code POST  /api/logout} : logout the current user.
     *
     * @param idToken the ID token.
     * @param request a {@link ServerHttpRequest} request.
     * @param session the current {@link WebSession}.
     * @return the {@link ResponseEntity} with status {@code 200 (OK)} and a body with a global logout URL.
     */
    @PostMapping("/api/logout")
    public Mono<Map<String, String>> logout(
        @AuthenticationPrincipal(expression = "idToken") OidcIdToken idToken,
        ServerHttpRequest request,
        WebSession session
    ) {
        return session.invalidate().then(this.registration.map(oidc -> prepareLogoutUri(request, oidc, idToken)));
    }

    private Map<String, String> prepareLogoutUri(ServerHttpRequest request, ClientRegistration clientRegistration, OidcIdToken idToken) {
        StringBuilder logoutUrl = new StringBuilder();
        String issuerUri = clientRegistration.getProviderDetails().getIssuerUri();
        if (issuerUri.contains("auth0.com")) {
            logoutUrl.append(issuerUri.endsWith("/") ? issuerUri + "v2/logout" : issuerUri + "/v2/logout");
        } else {
            logoutUrl.append(clientRegistration.getProviderDetails().getConfigurationMetadata().get("end_session_endpoint").toString());
        }

        String originUrl = request.getHeaders().getOrigin();
        if (issuerUri.contains("auth0.com")) {
            logoutUrl.append("?client_id=").append(clientRegistration.getClientId()).append("&returnTo=").append(originUrl);
        } else {
            logoutUrl.append("?id_token_hint=").append(idToken.getTokenValue()).append("&post_logout_redirect_uri=").append(originUrl);
        }
        return Map.of("logoutUrl", logoutUrl.toString());
    }
}
