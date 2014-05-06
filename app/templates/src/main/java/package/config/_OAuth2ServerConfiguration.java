package <%=packageName%>.config;

import <%=packageName%>.security.AjaxLogoutSuccessHandler;
import <%=packageName%>.security.AuthoritiesConstants;
import <%=packageName%>.security.Http401UnauthorizedEntryPoint;
import org.springframework.boot.bind.RelaxedPropertyResolver;
import org.springframework.context.EnvironmentAware;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.core.env.Environment;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.oauth2.config.annotation.configurers.ClientDetailsServiceConfigurer;
import org.springframework.security.oauth2.config.annotation.web.configuration.AuthorizationServerConfigurerAdapter;
import org.springframework.security.oauth2.config.annotation.web.configuration.EnableAuthorizationServer;
import org.springframework.security.oauth2.config.annotation.web.configuration.EnableResourceServer;
import org.springframework.security.oauth2.config.annotation.web.configuration.ResourceServerConfigurerAdapter;
import org.springframework.security.oauth2.config.annotation.web.configurers.AuthorizationServerEndpointsConfigurer;
import org.springframework.security.oauth2.provider.token.TokenStore;
import org.springframework.security.oauth2.provider.token.store.JdbcTokenStore;
import org.springframework.security.web.util.matcher.AntPathRequestMatcher;

import javax.inject.Inject;
import javax.sql.DataSource;

@Configuration
public class OAuth2ServerConfiguration {

    @Configuration
    @EnableResourceServer
    protected static class ResourceServerConfiguration extends ResourceServerConfigurerAdapter {

        @Inject
        private Http401UnauthorizedEntryPoint authenticationEntryPoint;

        @Inject
        private AjaxLogoutSuccessHandler ajaxLogoutSuccessHandler;

        @Override
        public void configure(HttpSecurity http) throws Exception {
            http
                    .exceptionHandling()
                    .authenticationEntryPoint(authenticationEntryPoint)
                    .and()
                    .logout()
                    .logoutUrl("/app/logout")
                    .logoutSuccessHandler(ajaxLogoutSuccessHandler)
                    .and()
                    .csrf()
                    .requireCsrfProtectionMatcher(new AntPathRequestMatcher("/oauth/authorize"))
                    .disable()
                    .headers()
                    .frameOptions().disable()
                    .sessionManagement()
                    .sessionCreationPolicy(SessionCreationPolicy.STATELESS)
                    .and()
                    .authorizeRequests()
                    .antMatchers("/views/**").permitAll()
                    .antMatchers("/app/rest/authenticate").permitAll()
                    .antMatchers("/app/rest/logs/**").hasAnyAuthority(AuthoritiesConstants.ADMIN)
                    .antMatchers("/app/**").authenticated()
                    .antMatchers("/websocket/tracker").hasAuthority(AuthoritiesConstants.ADMIN)
                    .antMatchers("/websocket/**").permitAll()
                    .antMatchers("/metrics*").hasAuthority(AuthoritiesConstants.ADMIN)
                    .antMatchers("/metrics/**").hasAuthority(AuthoritiesConstants.ADMIN)
                    .antMatchers("/health*").hasAuthority(AuthoritiesConstants.ADMIN)
                    .antMatchers("/health/**").hasAuthority(AuthoritiesConstants.ADMIN)
                    .antMatchers("/trace*").hasAuthority(AuthoritiesConstants.ADMIN)
                    .antMatchers("/trace/**").hasAuthority(AuthoritiesConstants.ADMIN)
                    .antMatchers("/dump*").hasAuthority(AuthoritiesConstants.ADMIN)
                    .antMatchers("/dump/**").hasAuthority(AuthoritiesConstants.ADMIN)
                    .antMatchers("/shutdown*").hasAuthority(AuthoritiesConstants.ADMIN)
                    .antMatchers("/shutdown/**").hasAuthority(AuthoritiesConstants.ADMIN)
                    .antMatchers("/beans*").hasAuthority(AuthoritiesConstants.ADMIN)
                    .antMatchers("/beans/**").hasAuthority(AuthoritiesConstants.ADMIN)
                    .antMatchers("/info*").hasAuthority(AuthoritiesConstants.ADMIN)
                    .antMatchers("/info/**").hasAuthority(AuthoritiesConstants.ADMIN)
                    .antMatchers("/autoconfig*").hasAuthority(AuthoritiesConstants.ADMIN)
                    .antMatchers("/autoconfig/**").hasAuthority(AuthoritiesConstants.ADMIN)
                    .antMatchers("/env*").hasAuthority(AuthoritiesConstants.ADMIN)
                    .antMatchers("/env/**").hasAuthority(AuthoritiesConstants.ADMIN)
                    .antMatchers("/trace*").hasAuthority(AuthoritiesConstants.ADMIN)
                    .antMatchers("/trace/**").hasAuthority(AuthoritiesConstants.ADMIN)
                    .antMatchers("/api-docs/**").hasAuthority(AuthoritiesConstants.ADMIN)
                    .antMatchers("/protected/**").authenticated();

        }

    }

    @Configuration
    @EnableAuthorizationServer
    protected static class AuthorizationServerConfiguration extends AuthorizationServerConfigurerAdapter implements EnvironmentAware {

        public static final String ENV_OAUTH = "authentication.oauth.";
        public static final String PROP_CLIENTID = "clientid";
        public static final String PROP_SECRET = "secret";

        private RelaxedPropertyResolver propertyResolver;

        @Inject
        private DataSource dataSource;

        @Bean
        public TokenStore tokenStore() {
            return new JdbcTokenStore(dataSource);
        }

        @Inject
        private AuthenticationManager authenticationManager;

        @Override
        public void configure(AuthorizationServerEndpointsConfigurer endpoints)
                throws Exception {
            endpoints
                    .tokenStore(tokenStore())
                    .authenticationManager(authenticationManager);
        }

        @Override
        public void configure(ClientDetailsServiceConfigurer clients) throws Exception {
            clients
                    .inMemory()
                    .withClient(propertyResolver.getProperty(PROP_CLIENTID))
                    .scopes("read", "write")
                    .authorities(AuthoritiesConstants.ADMIN, AuthoritiesConstants.USER)
                    .authorizedGrantTypes("password")
                    .secret(propertyResolver.getProperty(PROP_SECRET));
        }

        @Override
        public void setEnvironment(Environment environment) {
            this.propertyResolver = new RelaxedPropertyResolver(environment, ENV_OAUTH);
        }
    }
}
