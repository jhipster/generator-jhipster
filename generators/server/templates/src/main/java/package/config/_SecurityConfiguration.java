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

<%_ if (authenticationType == 'session' || authenticationType == 'jwt') { _%>
import <%=packageName%>.security.*;
<%_ } _%>
<%_ if (authenticationType == 'jwt') { _%>
import <%=packageName%>.security.jwt.*;
<%_ } _%>

<%_ if (authenticationType == 'session') { _%>
import io.github.jhipster.config.JHipsterProperties;
<%_ } _%>
import io.github.jhipster.security.*;

import org.springframework.beans.factory.BeanInitializationException;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.http.HttpMethod;<% if (authenticationType == 'oauth2') { %>
import org.springframework.security.authentication.AuthenticationManager;<% } %>
import org.springframework.security.config.annotation.authentication.builders.AuthenticationManagerBuilder;
import org.springframework.security.config.annotation.method.configuration.EnableGlobalMethodSecurity;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.builders.WebSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.config.annotation.web.configuration.WebSecurityConfigurerAdapter;<% if (authenticationType == 'jwt' || authenticationType == 'oauth2') { %>
import org.springframework.security.config.http.SessionCreationPolicy;<% } %><% if (clusteredHttpSession == 'hazelcast') { %>
import org.springframework.security.core.session.SessionRegistry;<% } %>
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.data.repository.query.SecurityEvaluationContextExtension;
<%_ if (authenticationType == 'session') { _%>
import org.springframework.security.web.authentication.RememberMeServices;
import org.springframework.security.web.csrf.CookieCsrfTokenRepository;
<%_ } _%>
<%_ if (authenticationType !== 'oauth2') { _%>
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;
import org.springframework.web.filter.CorsFilter;
<%_ } _%>

import javax.annotation.PostConstruct;

@Configuration
@EnableWebSecurity
@EnableGlobalMethodSecurity(prePostEnabled = true, securedEnabled = true)
public class SecurityConfiguration extends WebSecurityConfigurerAdapter {

    private final AuthenticationManagerBuilder authenticationManagerBuilder;

    private final UserDetailsService userDetailsService;
    <%_ if (authenticationType == 'session') { _%>

    private final JHipsterProperties jHipsterProperties;

    private final RememberMeServices rememberMeServices;
    <%_ } _%>
    <%_ if (authenticationType == 'jwt') { _%>

    private final TokenProvider tokenProvider;
    <%_ } _%>
    <%_ if (clusteredHttpSession == 'hazelcast') { _%>

    private final SessionRegistry sessionRegistry;
    <%_ } _%>
    <%_ if (authenticationType !== 'oauth2') { _%>

    private final CorsFilter corsFilter;
    <%_ } _%>

    public SecurityConfiguration(AuthenticationManagerBuilder authenticationManagerBuilder, UserDetailsService userDetailsService<% if (authenticationType === 'session') { %>,
        JHipsterProperties jHipsterProperties, RememberMeServices rememberMeServices<% } if (authenticationType === 'jwt') { %>,
            TokenProvider tokenProvider<% } %><% if (clusteredHttpSession === 'hazelcast') { %>, SessionRegistry sessionRegistry<% } if (authenticationType !== 'oauth2') { %>,
        CorsFilter corsFilter<% } %>) {

        this.authenticationManagerBuilder = authenticationManagerBuilder;
        this.userDetailsService = userDetailsService;
        <%_ if (authenticationType == 'session') { _%>
        this.jHipsterProperties = jHipsterProperties;
        this.rememberMeServices = rememberMeServices;
        <%_ } _%>
        <%_ if (authenticationType == 'jwt') { _%>
        this.tokenProvider = tokenProvider;
        <%_ } _%>
        <%_ if (clusteredHttpSession == 'hazelcast') { _%>
        this.sessionRegistry = sessionRegistry;
        <%_ } _%>
        <%_ if (authenticationType !== 'oauth2') { _%>
        this.corsFilter = corsFilter;
        <%_ } _%>
    }

    @PostConstruct
    public void init() {
        try {
            authenticationManagerBuilder
                .userDetailsService(userDetailsService)
                    .passwordEncoder(passwordEncoder());
        } catch (Exception e) {
            throw new BeanInitializationException("Security configuration failed", e);
        }
    }
    <%_ if (authenticationType == 'session') { _%>

    @Bean
    public AjaxAuthenticationSuccessHandler ajaxAuthenticationSuccessHandler() {
        return new AjaxAuthenticationSuccessHandler();
    }

    @Bean
    public AjaxAuthenticationFailureHandler ajaxAuthenticationFailureHandler() {
        return new AjaxAuthenticationFailureHandler();
    }
    <%_ } _%>
    <%_ if (authenticationType == 'session' || authenticationType == 'oauth2') { _%>

    @Bean
    public AjaxLogoutSuccessHandler ajaxLogoutSuccessHandler() {
        return new AjaxLogoutSuccessHandler();
    }
    <%_ } _%>

    @Bean
    public Http401UnauthorizedEntryPoint http401UnauthorizedEntryPoint() {
        return new Http401UnauthorizedEntryPoint();
    }

    @Bean
    public PasswordEncoder passwordEncoder() {
        return new BCryptPasswordEncoder();
    }

    @Override
    public void configure(WebSecurity web) throws Exception {
        web.ignoring()
            .antMatchers(HttpMethod.OPTIONS, "/**")
            .antMatchers("/app/**/*.{js,html}")
            .antMatchers("/bower_components/**")
            .antMatchers("/i18n/**")
            .antMatchers("/content/**")
            .antMatchers("/swagger-ui/index.html")<% if (authenticationType == 'oauth2') { %>
            .antMatchers("/api/register")
            .antMatchers("/api/activate")
            .antMatchers("/api/account/reset_password/init")
            .antMatchers("/api/account/reset_password/finish")<% } %>
            .antMatchers("/test/**")<% if (devDatabaseType != 'h2Disk' && devDatabaseType != 'h2Memory') { %>;<% } else { %>
            .antMatchers("/h2-console/**");<% } %>
    }<% if (authenticationType == 'session' || authenticationType == 'jwt') { %>

    @Override
    protected void configure(HttpSecurity http) throws Exception {
        http<% if (clusteredHttpSession == 'hazelcast') { %>
            .sessionManagement()
            .maximumSessions(32) // maximum number of concurrent sessions for one user
            .sessionRegistry(sessionRegistry)
            .and().and()<% } %>
            <%_ if (authenticationType == 'session') { _%>
            .csrf()
            .csrfTokenRepository(CookieCsrfTokenRepository.withHttpOnlyFalse())
        .and()
            <%_ } _%>
            <%_ if (authenticationType !== 'oauth2') { _%>
            .addFilterBefore(corsFilter, UsernamePasswordAuthenticationFilter.class)
            <%_ } _%>
            .exceptionHandling()
            .authenticationEntryPoint(http401UnauthorizedEntryPoint())<% if (authenticationType == 'session') { %>
        .and()
            .rememberMe()
            .rememberMeServices(rememberMeServices)
            .rememberMeParameter("remember-me")
            .key(jHipsterProperties.getSecurity().getRememberMe().getKey())
        .and()
            .formLogin()
            .loginProcessingUrl("/api/authentication")
            .successHandler(ajaxAuthenticationSuccessHandler())
            .failureHandler(ajaxAuthenticationFailureHandler())
            .usernameParameter("j_username")
            .passwordParameter("j_password")
            .permitAll()
        .and()
            .logout()
            .logoutUrl("/api/logout")
            .logoutSuccessHandler(ajaxLogoutSuccessHandler())<% if (clusteredHttpSession == 'hazelcast') { %>
            .deleteCookies("hazelcast.sessionId")<% } %>
            .permitAll()<% } %>
        .and()<% if (authenticationType == 'jwt') { %>
            .csrf()
            .disable()<% } %>
            .headers()
            .frameOptions()
            .disable()
        .and()<% if (authenticationType == 'jwt') { %>
            .sessionManagement()
            .sessionCreationPolicy(SessionCreationPolicy.STATELESS)
        .and()<% } %>
            .authorizeRequests()
            .antMatchers("/api/register").permitAll()
            .antMatchers("/api/activate").permitAll()
            .antMatchers("/api/authenticate").permitAll()
            .antMatchers("/api/account/reset_password/init").permitAll()
            .antMatchers("/api/account/reset_password/finish").permitAll()
            .antMatchers("/api/profile-info").permitAll()
            .antMatchers("/api/**").authenticated()<% if (websocket == 'spring-websocket') { %>
            .antMatchers("/websocket/tracker").hasAuthority(AuthoritiesConstants.ADMIN)
            .antMatchers("/websocket/**").permitAll()<% } %>
            .antMatchers("/management/health").permitAll()
            .antMatchers("/management/**").hasAuthority(AuthoritiesConstants.ADMIN)
            .antMatchers("/v2/api-docs/**").permitAll()
            .antMatchers("/swagger-resources/configuration/ui").permitAll()
            .antMatchers("/swagger-ui/index.html").hasAuthority(AuthoritiesConstants.ADMIN)<%if (authenticationType != 'jwt') { %>;<% } else { %>
        .and()
            .apply(securityConfigurerAdapter());<% } %>

    }<% } %><% if (authenticationType == 'oauth2') { %>

    @Override
    public void configure(HttpSecurity http) throws Exception {
        http
            .httpBasic().realmName("<%= baseName %>")
            .and()
                .sessionManagement()
                .sessionCreationPolicy(SessionCreationPolicy.STATELESS)
            .and()
                .requestMatchers().antMatchers("/oauth/authorize")
            .and()
                .authorizeRequests()
                .antMatchers("/oauth/authorize").authenticated();
    }

    @Override
    @Bean
    public AuthenticationManager authenticationManagerBean() throws Exception {
        return super.authenticationManagerBean();
    }<% } %><% if (authenticationType == 'jwt') { %>

    private JWTConfigurer securityConfigurerAdapter() {
        return new JWTConfigurer(tokenProvider);
    }<% } %>

    @Bean
    public SecurityEvaluationContextExtension securityEvaluationContextExtension() {
        return new SecurityEvaluationContextExtension();
    }
}
