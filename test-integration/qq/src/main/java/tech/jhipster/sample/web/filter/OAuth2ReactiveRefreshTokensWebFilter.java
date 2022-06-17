package tech.jhipster.sample.web.filter;

import org.springframework.security.oauth2.client.OAuth2AuthorizeRequest;
import org.springframework.security.oauth2.client.OAuth2AuthorizedClient;
import org.springframework.security.oauth2.client.ReactiveOAuth2AuthorizedClientManager;
import org.springframework.security.oauth2.client.authentication.OAuth2AuthenticationToken;
import org.springframework.stereotype.Component;
import org.springframework.web.server.ServerWebExchange;
import org.springframework.web.server.WebFilter;
import org.springframework.web.server.WebFilterChain;
import reactor.core.publisher.Mono;

/**
 * Refresh oauth2 tokens based on TokenRelayGatewayFilterFactory.
 */
@Component
public class OAuth2ReactiveRefreshTokensWebFilter implements WebFilter {

    private final ReactiveOAuth2AuthorizedClientManager clientManager;

    public OAuth2ReactiveRefreshTokensWebFilter(ReactiveOAuth2AuthorizedClientManager clientManager) {
        this.clientManager = clientManager;
    }

    public Mono<Void> filter(ServerWebExchange exchange, WebFilterChain chain) {
        return exchange
            .getPrincipal()
            .filter(principal -> principal instanceof OAuth2AuthenticationToken)
            .cast(OAuth2AuthenticationToken.class)
            .flatMap(authentication -> authorizedClient(exchange, authentication))
            .thenReturn(exchange)
            .flatMap(chain::filter);
    }

    private Mono<OAuth2AuthorizedClient> authorizedClient(ServerWebExchange exchange, OAuth2AuthenticationToken oauth2Authentication) {
        String clientRegistrationId = oauth2Authentication.getAuthorizedClientRegistrationId();
        OAuth2AuthorizeRequest request = OAuth2AuthorizeRequest
            .withClientRegistrationId(clientRegistrationId)
            .principal(oauth2Authentication)
            .attribute(ServerWebExchange.class.getName(), exchange)
            .build();
        if (clientManager == null) {
            return Mono.error(
                new IllegalStateException(
                    "No ReactiveOAuth2AuthorizedClientManager bean was found. Did you include the " +
                    "org.springframework.boot:spring-boot-starter-oauth2-client dependency?"
                )
            );
        }
        return clientManager.authorize(request);
    }
}
