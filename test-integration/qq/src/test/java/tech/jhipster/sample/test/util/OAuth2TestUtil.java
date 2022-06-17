package tech.jhipster.sample.test.util;

import java.time.Instant;
import java.time.temporal.ChronoUnit;
import java.util.Collection;
import java.util.Collections;
import java.util.HashMap;
import java.util.Map;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.oauth2.client.OAuth2AuthorizedClient;
import org.springframework.security.oauth2.client.ReactiveOAuth2AuthorizedClientService;
import org.springframework.security.oauth2.client.authentication.OAuth2AuthenticationToken;
import org.springframework.security.oauth2.client.registration.ClientRegistration;
import org.springframework.security.oauth2.core.OAuth2AccessToken;
import org.springframework.security.oauth2.core.OAuth2AccessToken.TokenType;
import org.springframework.security.oauth2.core.oidc.OidcIdToken;
import org.springframework.security.oauth2.core.oidc.OidcUserInfo;
import org.springframework.security.oauth2.core.oidc.user.DefaultOidcUser;
import tech.jhipster.sample.security.AuthoritiesConstants;
import tech.jhipster.sample.security.SecurityUtils;

public class OAuth2TestUtil {

    public static final String TEST_USER_LOGIN = "test";

    public static final String ID_TOKEN =
        "eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9" +
        ".eyJzdWIiOiIxMjM0NTY3ODkwIiwibmFtZSI6IkpvaG4gRG9lIiwiYWRtaW4iOnRydWUsIm" +
        "p0aSI6ImQzNWRmMTRkLTA5ZjYtNDhmZi04YTkzLTdjNmYwMzM5MzE1OSIsImlhdCI6MTU0M" +
        "Tk3MTU4MywiZXhwIjoxNTQxOTc1MTgzfQ.QaQOarmV8xEUYV7yvWzX3cUE_4W1luMcWCwpr" +
        "oqqUrg";

    public static OAuth2AuthenticationToken testAuthenticationToken() {
        Map<String, Object> claims = new HashMap<>();
        claims.put("sub", TEST_USER_LOGIN);
        claims.put("preferred_username", TEST_USER_LOGIN);
        claims.put("email", "john.doe@jhipster.com");
        claims.put("roles", Collections.singletonList(AuthoritiesConstants.ADMIN));

        return authenticationToken(claims);
    }

    public static OAuth2AuthenticationToken authenticationToken(Map<String, Object> claims) {
        Instant issuedAt = Instant.now();
        Instant expiresAt = Instant.now().plus(1, ChronoUnit.DAYS);
        if (!claims.containsKey("sub")) {
            claims.put("sub", "jane");
        }
        if (!claims.containsKey("preferred_username")) {
            claims.put("preferred_username", "jane");
        }
        if (!claims.containsKey("email")) {
            claims.put("email", "jane.doe@jhipster.com");
        }
        if (claims.containsKey("auth_time")) {
            issuedAt = (Instant) claims.get("auth_time");
        } else {
            claims.put("auth_time", issuedAt);
        }
        if (claims.containsKey("exp")) {
            expiresAt = (Instant) claims.get("exp");
        } else {
            claims.put("exp", expiresAt);
        }
        Collection<GrantedAuthority> authorities = SecurityUtils.extractAuthorityFromClaims(claims);
        OidcIdToken token = new OidcIdToken(ID_TOKEN, issuedAt, expiresAt, claims);
        OidcUserInfo userInfo = new OidcUserInfo(claims);
        DefaultOidcUser user = new DefaultOidcUser(authorities, token, userInfo, "preferred_username");
        return new OAuth2AuthenticationToken(user, user.getAuthorities(), "oidc");
    }

    public static OAuth2AuthenticationToken registerAuthenticationToken(
        ReactiveOAuth2AuthorizedClientService authorizedClientService,
        ClientRegistration clientRegistration,
        OAuth2AuthenticationToken authentication
    ) {
        Map<String, Object> userDetails = authentication.getPrincipal().getAttributes();

        OAuth2AccessToken token = new OAuth2AccessToken(
            TokenType.BEARER,
            "Token",
            (Instant) userDetails.get("auth_time"),
            (Instant) userDetails.get("exp")
        );

        authorizedClientService
            .saveAuthorizedClient(new OAuth2AuthorizedClient(clientRegistration, authentication.getName(), token), authentication)
            .block();

        return authentication;
    }
}
