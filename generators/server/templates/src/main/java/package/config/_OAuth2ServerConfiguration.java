<%#
 Copyright 2013-2017 the original author or authors.

 This file is part of the JHipster project, see https://jhipster.github.io/
 for more information.

 Licensed under the Apache License, Version 2.0 (the "License");
 you may not use this file except in compliance with the License.
 You may obtain a copy of the License at

      http://www.apache.org/licenses/LICENSE-2.0

 Unless required by applicable law or agreed to in writing, software
 distributed under the License is distributed on an "AS IS" BASIS,
 WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 See the License for the specific language governing permissions and
 limitations under the License.
-%>
package <%=packageName%>.config;

<%_ if (databaseType == 'mongodb') { _%>
import <%=packageName%>.config.oauth2.MongoDBApprovalStore;
import <%=packageName%>.config.oauth2.MongoDBAuthorizationCodeServices;
import <%=packageName%>.config.oauth2.MongoDBClientDetailsService;
import <%=packageName%>.config.oauth2.MongoDBTokenStore;
import <%=packageName%>.repository.*;
<%_ } _%>
import <%=packageName%>.security.AuthoritiesConstants;

import io.github.jhipster.security.Http401UnauthorizedEntryPoint;
import io.github.jhipster.security.AjaxLogoutSuccessHandler;

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
import org.springframework.security.oauth2.config.annotation.web.configurers.ResourceServerSecurityConfigurer;
import org.springframework.security.oauth2.provider.approval.ApprovalStore;<% if (databaseType == 'sql') { %>
import org.springframework.security.oauth2.provider.approval.JdbcApprovalStore;<% } %>
import org.springframework.security.oauth2.provider.code.AuthorizationCodeServices;<% if (databaseType == 'sql') { %>
import org.springframework.security.oauth2.provider.code.JdbcAuthorizationCodeServices;<% } %>
import org.springframework.security.oauth2.provider.token.TokenStore;<% if (databaseType == 'sql') { %>
import org.springframework.security.oauth2.provider.token.store.JdbcTokenStore;<% } %>
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;
import org.springframework.web.filter.CorsFilter;
<%_ if (databaseType == 'sql') { _%>

import javax.sql.DataSource;
<%_ } _%>

@Configuration
public class OAuth2ServerConfiguration {<% if (databaseType == 'sql') { %>

    private final DataSource dataSource;

    public OAuth2ServerConfiguration(DataSource dataSource) {
        this.dataSource = dataSource;
    }

    @Bean
    public JdbcTokenStore tokenStore() {
        return new JdbcTokenStore(dataSource);
    }<% } %><% if (databaseType == 'mongodb') { %>

    @Bean
    public TokenStore tokenStore(OAuth2AccessTokenRepository oAuth2AccessTokenRepository, OAuth2RefreshTokenRepository oAuth2RefreshTokenRepository) {
        return new MongoDBTokenStore(oAuth2AccessTokenRepository, oAuth2RefreshTokenRepository);
    }<% } %>

    @Configuration
    @EnableResourceServer
    protected static class ResourceServerConfiguration extends ResourceServerConfigurerAdapter {

        private final TokenStore tokenStore;

        private final Http401UnauthorizedEntryPoint http401UnauthorizedEntryPoint;

        private final AjaxLogoutSuccessHandler ajaxLogoutSuccessHandler;

        private final CorsFilter corsFilter;

        public ResourceServerConfiguration(TokenStore tokenStore, Http401UnauthorizedEntryPoint http401UnauthorizedEntryPoint,
            AjaxLogoutSuccessHandler ajaxLogoutSuccessHandler, CorsFilter corsFilter) {

            this.tokenStore = tokenStore;
            this.http401UnauthorizedEntryPoint = http401UnauthorizedEntryPoint;
            this.ajaxLogoutSuccessHandler = ajaxLogoutSuccessHandler;
            this.corsFilter = corsFilter;
        }

        @Override
        public void configure(HttpSecurity http) throws Exception {
            http
                .exceptionHandling()
                .authenticationEntryPoint(http401UnauthorizedEntryPoint)
            .and()
                .logout()
                .logoutUrl("/api/logout")
                .logoutSuccessHandler(ajaxLogoutSuccessHandler)
            .and()
                .csrf()
                .disable()
                .addFilterBefore(corsFilter, UsernamePasswordAuthenticationFilter.class)
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

        @Override
        public void configure(ResourceServerSecurityConfigurer resources) throws Exception {
            resources.resourceId("res_<%= baseName %>").tokenStore(tokenStore);
        }
    }

    @Configuration
    @EnableAuthorizationServer
    protected static class AuthorizationServerConfiguration extends AuthorizationServerConfigurerAdapter {

        private final AuthenticationManager authenticationManager;

        private final TokenStore tokenStore;
<%_ if (databaseType == 'sql') { _%>

        private final DataSource dataSource;

        public AuthorizationServerConfiguration(@Qualifier("authenticationManagerBean") AuthenticationManager authenticationManager,
                TokenStore tokenStore, DataSource dataSource) {

            this.authenticationManager = authenticationManager;
            this.tokenStore = tokenStore;
            this.dataSource = dataSource;
        }

        @Bean
        protected AuthorizationCodeServices authorizationCodeServices() {
            return new JdbcAuthorizationCodeServices(dataSource);
        }

        @Bean
        public ApprovalStore approvalStore() {
            return new JdbcApprovalStore(dataSource);
        }
<%_ } else { _%>

        private final OAuth2ApprovalRepository oAuth2ApprovalRepository;

        private final OAuth2CodeRepository oAuth2CodeRepository;

        private final OAuth2ClientDetailsRepository oAuth2ClientDetailsRepository;

        public AuthorizationServerConfiguration(@Qualifier("authenticationManagerBean") AuthenticationManager authenticationManager,
                TokenStore tokenStore, OAuth2ApprovalRepository oAuth2ApprovalRepository, OAuth2CodeRepository oAuth2CodeRepository,
                OAuth2ClientDetailsRepository oAuth2ClientDetailsRepository) {

            this.authenticationManager = authenticationManager;
            this.tokenStore = tokenStore;
            this.oAuth2ApprovalRepository = oAuth2ApprovalRepository;
            this.oAuth2CodeRepository = oAuth2CodeRepository;
            this.oAuth2ClientDetailsRepository = oAuth2ClientDetailsRepository;
        }

        @Bean
        public ApprovalStore approvalStore() {
            return new MongoDBApprovalStore(oAuth2ApprovalRepository);
        }

        @Bean
        protected AuthorizationCodeServices authorizationCodeServices() {
            return new MongoDBAuthorizationCodeServices(oAuth2CodeRepository);
        }
<%_ } _%>

        @Override
        public void configure(AuthorizationServerEndpointsConfigurer endpoints)
                throws Exception {
            endpoints
                .authorizationCodeServices(authorizationCodeServices())
                .approvalStore(approvalStore())
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
            clients.withClientDetails(new MongoDBClientDetailsService(oAuth2ClientDetailsRepository));<% } %>
        }
    }
}
