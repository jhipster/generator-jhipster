package <%=packageName%>.config;
<% if (databaseType == 'mongodb') { %>
import <%=packageName%>.config.oauth2.MongoDBTokenStore;
import <%=packageName%>.repository.OAuth2AccessTokenRepository;
import <%=packageName%>.repository.OAuth2RefreshTokenRepository;<% } %>
import <%=packageName%>.security.AjaxLogoutSuccessHandler;
import <%=packageName%>.security.AuthoritiesConstants;
import <%=packageName%>.security.Http401UnauthorizedEntryPoint;
import org.springframework.beans.factory.annotation.Qualifier;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.http.HttpMethod;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.oauth2.config.annotation.configurers.ClientDetailsServiceConfigurer;
import org.springframework.security.oauth2.config.annotation.web.configuration.AuthorizationServerConfigurerAdapter;
import org.springframework.security.oauth2.config.annotation.web.configuration.EnableAuthorizationServer;
import org.springframework.security.oauth2.config.annotation.web.configuration.EnableResourceServer;
import org.springframework.security.oauth2.config.annotation.web.configuration.ResourceServerConfigurerAdapter;
import org.springframework.security.oauth2.config.annotation.web.configurers.AuthorizationServerEndpointsConfigurer;
import org.springframework.security.oauth2.config.annotation.web.configurers.AuthorizationServerSecurityConfigurer;

import org.springframework.security.oauth2.provider.token.TokenStore;<% if (databaseType == 'sql') { %>
import org.springframework.security.oauth2.config.annotation.web.configurers.ResourceServerSecurityConfigurer;
import org.springframework.security.oauth2.provider.approval.ApprovalStore;
import org.springframework.security.oauth2.provider.approval.JdbcApprovalStore;
import org.springframework.security.oauth2.provider.code.AuthorizationCodeServices;
import org.springframework.security.oauth2.provider.code.JdbcAuthorizationCodeServices;
import org.springframework.security.oauth2.provider.token.store.JdbcTokenStore;<% } %>

import javax.inject.Inject;<% if (databaseType == 'sql') { %>
import javax.sql.DataSource;<% } %>

@Configuration
public class OAuth2ServerConfiguration {<% if (databaseType == 'sql') { %>

    @Inject
    private DataSource dataSource;

    @Bean
    public TokenStore tokenStore() {
        return new JdbcTokenStore(dataSource);
    }<% } %><% if (databaseType == 'mongodb') { %>

    @Inject
    private OAuth2AccessTokenRepository oAuth2AccessTokenRepository;

    @Inject
    private OAuth2RefreshTokenRepository oAuth2RefreshTokenRepository;

    @Bean
    public TokenStore tokenStore() {
        return new MongoDBTokenStore(oAuth2AccessTokenRepository, oAuth2RefreshTokenRepository);
    }<% } %>

    @Configuration
    @EnableResourceServer
    protected static class ResourceServerConfiguration extends ResourceServerConfigurerAdapter {<% if (databaseType == 'sql') { %>

        @Inject
        private TokenStore tokenStore;<% } %>

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
                .logoutUrl("/api/logout")
                .logoutSuccessHandler(ajaxLogoutSuccessHandler)
            .and()
                .csrf()
                .disable()
                .headers()
                .frameOptions().disable()
            .and()<% if (!websocket) { %>
                .sessionManagement()
                .sessionCreationPolicy(SessionCreationPolicy.STATELESS)
            .and()<% } %>
                .authorizeRequests()
                .antMatchers(HttpMethod.OPTIONS, "/**").permitAll()
                .antMatchers("/api/authenticate").permitAll()
                .antMatchers("/api/register").permitAll()
                .antMatchers("/api/profile-info").permitAll()
                .antMatchers("/api/**").authenticated()<% if (websocket == 'spring-websocket') { %>
                .antMatchers("/websocket/tracker").hasAuthority(AuthoritiesConstants.ADMIN)
                .antMatchers("/websocket/**").permitAll()<% } %>
                .antMatchers("/management/**").hasAuthority(AuthoritiesConstants.ADMIN)
                .antMatchers("/v2/api-docs/**").permitAll()
                .antMatchers("/swagger-resources/configuration/ui").permitAll()
                .antMatchers("/swagger-ui/index.html").hasAuthority(AuthoritiesConstants.ADMIN);
        }
<% if (databaseType == 'sql') { %>
        @Override
        public void configure(ResourceServerSecurityConfigurer resources) throws Exception {
            resources.resourceId("res_<%= baseName %>").tokenStore(tokenStore);
        }<% } %>
    }

    @Configuration
    @EnableAuthorizationServer
    protected static class AuthorizationServerConfiguration extends AuthorizationServerConfigurerAdapter {<% if (databaseType == 'sql') { %>

        @Inject
        private DataSource dataSource;<% } %>
<% if (databaseType != 'sql') { %>
        @Inject
        private JHipsterProperties jHipsterProperties;
<% } %>
        @Inject
        private TokenStore tokenStore;
<% if (databaseType == 'sql') { %>
        @Bean
        protected AuthorizationCodeServices authorizationCodeServices() {
            return new JdbcAuthorizationCodeServices(dataSource);
        }

        @Bean
        public ApprovalStore approvalStore() {
            return new JdbcApprovalStore(dataSource);
        }
<% } %>
        @Inject
        @Qualifier("authenticationManagerBean")
        private AuthenticationManager authenticationManager;

        @Override
        public void configure(AuthorizationServerEndpointsConfigurer endpoints)
                throws Exception {
            endpoints<% if (databaseType == 'sql') { %>
                .authorizationCodeServices(authorizationCodeServices())
                .approvalStore(approvalStore())<% } %>
                .tokenStore(tokenStore)
                .authenticationManager(authenticationManager);
        }

        @Override
        public void configure(AuthorizationServerSecurityConfigurer oauthServer) throws Exception {
            oauthServer.allowFormAuthenticationForClients();
        }

        @Override
        public void configure(ClientDetailsServiceConfigurer clients) throws Exception {<% if (databaseType == 'sql') { %>
            clients.jdbc(dataSource);<% } else { %>
            clients
                .inMemory()
                .withClient(jHipsterProperties.getSecurity().getAuthentication().getOauth().getClientid())
                .scopes("read", "write")
                .authorities(AuthoritiesConstants.ADMIN, AuthoritiesConstants.USER)
                .authorizedGrantTypes("password", "refresh_token", "authorization_code", "implicit")
                .secret(jHipsterProperties.getSecurity().getAuthentication().getOauth().getSecret())
                .accessTokenValiditySeconds(jHipsterProperties.getSecurity().getAuthentication().getOauth().getTokenValidityInSeconds());<% } %>
        }
    }
}
