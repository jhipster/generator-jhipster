package <%=packageName%>.config;

import <%=packageName%>.security.jwt.TokenHandler;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

import javax.inject.Inject;

/**
* Configures JWT security.
*/
@Configuration
public class JWTConfiguration {
   
    @Inject
    private UserDetailsService userDetailsService;


    @Bean
    public TokenHandler tokenHandler(JHipsterProperties jHipsterProperties) {
        String secret = jHipsterProperties.getSecurity().getAuthentication().getXauth().getSecret();
        return new TokenProvider(secret, userDetailsService);
    }

    @Bean
    public TokenAuthenticationService tokenAuthenticationService(JHipsterProperties jHipsterProperties) {
        return new TokenAuthenticationService(tokenHandler());
    }
}
