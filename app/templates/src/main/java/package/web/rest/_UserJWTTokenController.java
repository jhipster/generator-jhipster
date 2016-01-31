package <%=packageName%>.web.rest;

import com.codahale.metrics.annotation.Timed;
import <%=packageName%>.security.jwt.TokenAuthenticationService;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestMethod;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;


import javax.servlet.http.HttpServletResponse;
import javax.inject.Inject;
import java.util.HashMap;
import java.util.Map;
import java.util.concurrent.ConcurrentHashMap;

@RestController
@RequestMapping("/api")
public class UserJWTTokenController {

    @Inject
    private final TokenAuthenticationService tokenAuthenticationService;
    
    @Inject
    private final UserDetailsService userDetailsService;

    @Inject
    private AuthenticationManager authenticationManager;

    @RequestMapping(value = "/authenticate",
            method = RequestMethod.POST)
    @Timed
    public String authorize(@RequestParam String username, @RequestParam String password, HttpServletResponse response) {

        UsernamePasswordAuthenticationToken token = new UsernamePasswordAuthenticationToken(username, password);
        Authentication authentication = this.authenticationManager.authenticate(token);
        SecurityContextHolder.getContext().setAuthentication(authentication);
        tokenAuthenticationService.addAuthentication(response, userAuthentication);
        SecurityContextHolder.getContext().setAuthentication(authentication);
    }
}
