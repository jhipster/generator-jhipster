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

import javax.inject.Inject;
import java.util.HashMap;
import java.util.Map;
import java.util.concurrent.ConcurrentHashMap;

@RestController
@RequestMapping("/api")
public class UserJWTTokenController {

    @Inject
    private  TokenAuthenticationService tokenAuthenticationService;
    
    @Inject
    private  UserDetailsService userDetailsService;

    @RequestMapping(value = "/authenticate",
            method = RequestMethod.POST)
    @Timed
    public void authorize(@RequestParam String username, @RequestParam String password) {

        UsernamePasswordAuthenticationToken token = new UsernamePasswordAuthenticationToken(username, password);
        Authentication authentication = this.authenticationManager.authenticate(token);
        tokenAuthenticationService.addAuthentication(response, userAuthentication);
        SecurityContextHolder.getContext().setAuthentication(authentication);
    }
}
