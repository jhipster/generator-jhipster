package <%=packageName%>.web.rest;

import com.codahale.metrics.annotation.Timed;

import <%=packageName%>.security.jwt.JWTConfigurer;
import <%=packageName%>.security.jwt.TokenProvider;

import org.springframework.http.ResponseEntity;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestMethod;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import javax.servlet.http.HttpServletResponse;
import javax.inject.Inject;

@RestController
@RequestMapping("/api")
public class UserJWTController {

    @Inject
    private TokenProvider tokenProvider;

    @Inject
    private UserDetailsService userDetailsService;

    @Inject
    private AuthenticationManager authenticationManager;

    @RequestMapping(value = "/authenticate",
            method = RequestMethod.POST)
    @Timed
    public ResponseEntity<?> authorize(@RequestParam String username, @RequestParam String password, HttpServletResponse response) {

        UsernamePasswordAuthenticationToken authenticationToken =
            new UsernamePasswordAuthenticationToken(username, password);

        Authentication authentication = this.authenticationManager.authenticate(authenticationToken);
        SecurityContextHolder.getContext().setAuthentication(authentication);
        String jwt = tokenProvider.createTokenForUser(username);
        response.addHeader(JWTConfigurer.JWT_HEADER_NAME, jwt);
        return ResponseEntity.ok().build();
    }
}
