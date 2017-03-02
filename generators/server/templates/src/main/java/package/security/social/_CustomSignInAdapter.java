package <%=packageName%>.security.social;
<%_ if (authenticationType == 'jwt') { _%>

import <%=packageName%>.security.jwt.TokenProvider;
<%_ } _%>

import io.github.jhipster.config.JHipsterProperties;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.social.connect.Connection;
import org.springframework.social.connect.web.SignInAdapter;
import org.springframework.web.context.request.NativeWebRequest;
<%_ if (authenticationType == 'jwt') { _%>
import org.springframework.security.core.AuthenticationException;
import org.springframework.web.context.request.ServletWebRequest;
import javax.servlet.http.Cookie;
<%_ } _%>

public class CustomSignInAdapter implements SignInAdapter {

    @SuppressWarnings("unused")
    private final Logger log = LoggerFactory.getLogger(CustomSignInAdapter.class);

    private final UserDetailsService userDetailsService;

    private final JHipsterProperties jHipsterProperties;
    <%_ if (authenticationType == 'jwt') { _%>

    private final TokenProvider tokenProvider;

    <%_ } _%>

    public CustomSignInAdapter(UserDetailsService userDetailsService, JHipsterProperties jHipsterProperties<% if (authenticationType == 'jwt') { %>,
            TokenProvider tokenProvider<% } %>) {
        this.userDetailsService = userDetailsService;
        this.jHipsterProperties = jHipsterProperties;
        <%_ if (authenticationType == 'jwt') { _%>
        this.tokenProvider = tokenProvider;
        <%_ } _%>
    }
    <%_ if (authenticationType == 'jwt') { _%>

    @Override
    public String signIn(String userId, Connection<?> connection, NativeWebRequest request){
        try {
            UserDetails user = userDetailsService.loadUserByUsername(userId);
            UsernamePasswordAuthenticationToken authenticationToken = new UsernamePasswordAuthenticationToken(
                user,
                null,
                user.getAuthorities());

            SecurityContextHolder.getContext().setAuthentication(authenticationToken);
            String jwt = tokenProvider.createToken(authenticationToken, false);
            ServletWebRequest servletWebRequest = (ServletWebRequest) request;
            servletWebRequest.getResponse().addCookie(getSocialAuthenticationCookie(jwt));
        } catch (AuthenticationException ae) {
            log.error("Social authentication error");
            log.trace("Authentication exception trace: {}", ae);
        }
        return jHipsterProperties.getSocial().getRedirectAfterSignIn();
    }

    private Cookie getSocialAuthenticationCookie(String token) {
        Cookie socialAuthCookie = new Cookie("social-authentication", token);
        socialAuthCookie.setPath("/");
        socialAuthCookie.setMaxAge(10);
        return socialAuthCookie;
    }
    <%_ } else { _%>
    @Override
    public String signIn(String userId, Connection<?> connection, NativeWebRequest request) {
        UserDetails user = userDetailsService.loadUserByUsername(userId);
        Authentication newAuth = new UsernamePasswordAuthenticationToken(
            user,
            null,
            user.getAuthorities());
        SecurityContextHolder.getContext().setAuthentication(newAuth);
        return jHipsterProperties.getSocial().getRedirectAfterSignIn();
    }
    <%_ } _%>
}
