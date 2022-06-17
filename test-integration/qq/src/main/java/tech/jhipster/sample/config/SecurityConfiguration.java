package tech.jhipster.sample.config;

import static org.springframework.security.web.server.util.matcher.ServerWebExchangeMatchers.pathMatchers;

import java.util.Arrays;
import java.util.HashSet;
import java.util.Map;
import java.util.Set;
import java.util.concurrent.ConcurrentHashMap;
import java.util.function.Consumer;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Import;
import org.springframework.core.ParameterizedTypeReference;
import org.springframework.core.convert.converter.Converter;
import org.springframework.http.HttpMethod;
import org.springframework.security.authentication.AbstractAuthenticationToken;
import org.springframework.security.config.annotation.method.configuration.EnableReactiveMethodSecurity;
import org.springframework.security.config.annotation.web.reactive.EnableWebFluxSecurity;
import org.springframework.security.config.web.server.SecurityWebFiltersOrder;
import org.springframework.security.config.web.server.ServerHttpSecurity;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.oauth2.client.oidc.userinfo.OidcReactiveOAuth2UserService;
import org.springframework.security.oauth2.client.oidc.userinfo.OidcUserRequest;
import org.springframework.security.oauth2.client.registration.ClientRegistration;
import org.springframework.security.oauth2.client.registration.ReactiveClientRegistrationRepository;
import org.springframework.security.oauth2.client.userinfo.ReactiveOAuth2UserService;
import org.springframework.security.oauth2.client.web.server.DefaultServerOAuth2AuthorizationRequestResolver;
import org.springframework.security.oauth2.client.web.server.ServerOAuth2AuthorizationRequestResolver;
import org.springframework.security.oauth2.core.DelegatingOAuth2TokenValidator;
import org.springframework.security.oauth2.core.OAuth2TokenValidator;
import org.springframework.security.oauth2.core.endpoint.OAuth2AuthorizationRequest;
import org.springframework.security.oauth2.core.oidc.user.DefaultOidcUser;
import org.springframework.security.oauth2.core.oidc.user.OidcUser;
import org.springframework.security.oauth2.core.oidc.user.OidcUserAuthority;
import org.springframework.security.oauth2.jwt.*;
import org.springframework.security.oauth2.server.resource.authentication.JwtAuthenticationConverter;
import org.springframework.security.oauth2.server.resource.authentication.ReactiveJwtAuthenticationConverterAdapter;
import org.springframework.security.web.server.SecurityWebFilterChain;
import org.springframework.security.web.server.csrf.CookieServerCsrfTokenRepository;
import org.springframework.security.web.server.header.ReferrerPolicyServerHttpHeadersWriter;
import org.springframework.security.web.server.header.XFrameOptionsServerHttpHeadersWriter.Mode;
import org.springframework.security.web.server.util.matcher.NegatedServerWebExchangeMatcher;
import org.springframework.security.web.server.util.matcher.OrServerWebExchangeMatcher;
import org.springframework.web.cors.reactive.CorsWebFilter;
import org.springframework.web.reactive.function.client.WebClient;
import org.zalando.problem.spring.webflux.advice.security.SecurityProblemSupport;
import reactor.core.publisher.Mono;
import tech.jhipster.config.JHipsterProperties;
import tech.jhipster.sample.security.AuthoritiesConstants;
import tech.jhipster.sample.security.SecurityUtils;
import tech.jhipster.sample.security.oauth2.AudienceValidator;
import tech.jhipster.sample.security.oauth2.JwtGrantedAuthorityConverter;
import tech.jhipster.sample.web.filter.SpaWebFilter;
import tech.jhipster.web.filter.reactive.CookieCsrfFilter;

@EnableWebFluxSecurity
@EnableReactiveMethodSecurity
@Import(SecurityProblemSupport.class)
public class SecurityConfiguration {

    private final JHipsterProperties jHipsterProperties;

    private final ReactiveUserDetailsService userDetailsService;

    @Value("${spring.security.oauth2.client.provider.oidc.issuer-uri}")
    private String issuerUri;

    private final ReactiveClientRegistrationRepository clientRegistrationRepository;

    // todo: optimize for scale https://github.com/jhipster/generator-jhipster/issues/18868
    private final Map<String, Mono<Jwt>> users = new ConcurrentHashMap<>();

    private final SecurityProblemSupport problemSupport;
    private final CorsWebFilter corsWebFilter;

    public SecurityConfiguration(
        ReactiveClientRegistrationRepository clientRegistrationRepository,
        JHipsterProperties jHipsterProperties,
        SecurityProblemSupport problemSupport,
        CorsWebFilter corsWebFilter
    ) {
        this.clientRegistrationRepository = clientRegistrationRepository;
        this.jHipsterProperties = jHipsterProperties;
        this.problemSupport = problemSupport;
        this.corsWebFilter = corsWebFilter;
    }

    @Bean
    public SecurityWebFilterChain springSecurityFilterChain(ServerHttpSecurity http) {
        // @formatter:off
        http
            .securityMatcher(new NegatedServerWebExchangeMatcher(new OrServerWebExchangeMatcher(
                pathMatchers("/app/**", "/_app/**", "/i18n/**", "/img/**", "/content/**", "/swagger-ui/**", "/v3/api-docs/**", "/test/**"),
                pathMatchers(HttpMethod.OPTIONS, "/**")
            )))
            .csrf()
                .csrfTokenRepository(CookieServerCsrfTokenRepository.withHttpOnlyFalse())
        .and()
            // See https://github.com/spring-projects/spring-security/issues/5766
            .addFilterAt(new CookieCsrfFilter(), SecurityWebFiltersOrder.REACTOR_CONTEXT)
            .addFilterBefore(corsWebFilter, SecurityWebFiltersOrder.REACTOR_CONTEXT)
            .addFilterAt(new SpaWebFilter(), SecurityWebFiltersOrder.AUTHENTICATION)
            .exceptionHandling()
                .accessDeniedHandler(problemSupport)
                .authenticationEntryPoint(problemSupport)
        .and()
            .headers()
            .contentSecurityPolicy(jHipsterProperties.getSecurity().getContentSecurityPolicy())
            .and()
                .referrerPolicy(ReferrerPolicyServerHttpHeadersWriter.ReferrerPolicy.STRICT_ORIGIN_WHEN_CROSS_ORIGIN)
            .and()
                .permissionsPolicy().policy("camera=(), fullscreen=(self), geolocation=(), gyroscope=(), magnetometer=(), microphone=(), midi=(), payment=(), sync-xhr=()")
            .and()
                .frameOptions().mode(Mode.DENY)
        .and()
            .authorizeExchange()
            .pathMatchers("/").permitAll()
            .pathMatchers("/*.*").permitAll()
            .pathMatchers("/api/authenticate").permitAll()
            .pathMatchers("/api/register").permitAll()
            .pathMatchers("/api/activate").permitAll()
            .pathMatchers("/api/account/reset-password/init").permitAll()
            .pathMatchers("/api/account/reset-password/finish").permitAll()
            .pathMatchers("/api/auth-info").permitAll()
            .pathMatchers("/api/admin/**").hasAuthority(AuthoritiesConstants.ADMIN)
            .pathMatchers("/api/**").authenticated()
            .pathMatchers("/services/*/v3/api-docs").hasAuthority(AuthoritiesConstants.ADMIN)
            .pathMatchers("/services/**").authenticated()
            .pathMatchers("/management/health").permitAll()
            .pathMatchers("/management/health/**").permitAll()
            .pathMatchers("/management/info").permitAll()
            .pathMatchers("/management/prometheus").permitAll()
            .pathMatchers("/management/**").hasAuthority(AuthoritiesConstants.ADMIN);

        http.oauth2Login(oauth2 -> oauth2.authorizationRequestResolver(authorizationRequestResolver(this.clientRegistrationRepository)))
            
            .oauth2ResourceServer()
                .jwt()
                .jwtAuthenticationConverter(jwtAuthenticationConverter());
        http.oauth2Client();
        // @formatter:on
        return http.build();
    }

    private ServerOAuth2AuthorizationRequestResolver authorizationRequestResolver(
        ReactiveClientRegistrationRepository clientRegistrationRepository
    ) {
        DefaultServerOAuth2AuthorizationRequestResolver authorizationRequestResolver = new DefaultServerOAuth2AuthorizationRequestResolver(
            clientRegistrationRepository
        );
        if (this.issuerUri.contains("auth0.com")) {
            authorizationRequestResolver.setAuthorizationRequestCustomizer(authorizationRequestCustomizer());
        }
        return authorizationRequestResolver;
    }

    private Consumer<OAuth2AuthorizationRequest.Builder> authorizationRequestCustomizer() {
        return customizer ->
            customizer.authorizationRequestUri(uriBuilder ->
                uriBuilder.queryParam("audience", jHipsterProperties.getSecurity().getOauth2().getAudience()).build()
            );
    }

    Converter<Jwt, Mono<AbstractAuthenticationToken>> jwtAuthenticationConverter() {
        JwtAuthenticationConverter jwtAuthenticationConverter = new JwtAuthenticationConverter();
        jwtAuthenticationConverter.setJwtGrantedAuthoritiesConverter(new JwtGrantedAuthorityConverter());
        return new ReactiveJwtAuthenticationConverterAdapter(jwtAuthenticationConverter);
    }

    /**
     * Map authorities from "groups" or "roles" claim in ID Token.
     *
     * @return a {@link ReactiveOAuth2UserService} that has the groups from the IdP.
     */
    @Bean
    public ReactiveOAuth2UserService<OidcUserRequest, OidcUser> oidcUserService() {
        final OidcReactiveOAuth2UserService delegate = new OidcReactiveOAuth2UserService();

        return userRequest -> {
            // Delegate to the default implementation for loading a user
            return delegate
                .loadUser(userRequest)
                .map(user -> {
                    Set<GrantedAuthority> mappedAuthorities = new HashSet<>();

                    user
                        .getAuthorities()
                        .forEach(authority -> {
                            if (authority instanceof OidcUserAuthority) {
                                OidcUserAuthority oidcUserAuthority = (OidcUserAuthority) authority;
                                mappedAuthorities.addAll(
                                    SecurityUtils.extractAuthorityFromClaims(oidcUserAuthority.getUserInfo().getClaims())
                                );
                            }
                        });

                    return new DefaultOidcUser(mappedAuthorities, user.getIdToken(), user.getUserInfo());
                });
        };
    }

    @Bean
    ReactiveJwtDecoder jwtDecoder(ReactiveClientRegistrationRepository registrations) {
        Mono<ClientRegistration> clientRegistration = registrations.findByRegistrationId("oidc");

        return clientRegistration
            .map(oidc ->
                createJwtDecoder(
                    oidc.getProviderDetails().getIssuerUri(),
                    oidc.getProviderDetails().getJwkSetUri(),
                    oidc.getProviderDetails().getUserInfoEndpoint().getUri()
                )
            )
            .block();
    }

    private ReactiveJwtDecoder createJwtDecoder(String issuerUri, String jwkSetUri, String userInfoUri) {
        NimbusReactiveJwtDecoder jwtDecoder = new NimbusReactiveJwtDecoder(jwkSetUri);
        OAuth2TokenValidator<Jwt> audienceValidator = new AudienceValidator(jHipsterProperties.getSecurity().getOauth2().getAudience());
        OAuth2TokenValidator<Jwt> withIssuer = JwtValidators.createDefaultWithIssuer(issuerUri);
        OAuth2TokenValidator<Jwt> withAudience = new DelegatingOAuth2TokenValidator<>(withIssuer, audienceValidator);

        jwtDecoder.setJwtValidator(withAudience);

        return new ReactiveJwtDecoder() {
            @Override
            public Mono<Jwt> decode(String token) throws JwtException {
                return jwtDecoder.decode(token).flatMap(jwt -> enrich(token, jwt));
            }

            private Mono<Jwt> enrich(String token, Jwt jwt) {
                // Only look up user information if identity claims are missing
                if (jwt.hasClaim("given_name") && jwt.hasClaim("family_name")) {
                    return Mono.just(jwt);
                }
                // Retrieve user info from OAuth provider if not already loaded
                return users.computeIfAbsent(
                    jwt.getSubject(),
                    s -> {
                        WebClient webClient = WebClient.create();

                        return webClient
                            .get()
                            .uri(userInfoUri)
                            .headers(headers -> headers.setBearerAuth(token))
                            .retrieve()
                            .bodyToMono(new ParameterizedTypeReference<Map<String, Object>>() {})
                            .map(userInfo ->
                                Jwt
                                    .withTokenValue(jwt.getTokenValue())
                                    .subject(jwt.getSubject())
                                    .audience(jwt.getAudience())
                                    .headers(headers -> headers.putAll(jwt.getHeaders()))
                                    .claims(claims -> {
                                        String username = userInfo.get("preferred_username").toString();
                                        // special handling for Auth0
                                        if (userInfo.get("sub").toString().contains("|") && username.contains("@")) {
                                            userInfo.put("email", username);
                                        }
                                        // Allow full name in a name claim - happens with Auth0
                                        if (userInfo.get("name") != null) {
                                            String[] name = userInfo.get("name").toString().split("\\s+");
                                            if (name.length > 0) {
                                                userInfo.put("given_name", name[0]);
                                                userInfo.put("family_name", String.join(" ", Arrays.copyOfRange(name, 1, name.length)));
                                            }
                                        }
                                        claims.putAll(userInfo);
                                    })
                                    .claims(claims -> claims.putAll(jwt.getClaims()))
                                    .build()
                            );
                    }
                );
            }
        };
    }
}
