package <%=packageName%>.security.jwt;

import org.springframework.security.config.annotation.SecurityConfigurerAdapter;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.web.DefaultSecurityFilterChain;
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;

public class JWTTokenConfigurer extends SecurityConfigurerAdapter<DefaultSecurityFilterChain, HttpSecurity> {

    private TokenAuthenticationService tokenAuthenticationService;

    private UserDetailsService detailsService;

    public JWTTokenConfigurer(UserDetailsService detailsService, TokenAuthenticationService tokenAuthenticationService) {
        this.detailsService = detailsService;
        this.tokenAuthenticationService = tokenAuthenticationService;
    }

    @Override
    public void configure(HttpSecurity http) throws Exception {
        StatelessAuthenticationFilter customFilter = new StatelessAuthenticationFilter(detailsService, tokenProvider);
        http.addFilterBefore(customFilter, UsernamePasswordAuthenticationFilter.class);
    }
}
