<%#
 Copyright 2013-2018 the original author or authors from the JHipster project.

 This file is part of the JHipster project, see http://www.jhipster.tech/
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

<%_ if (authenticationType === 'session' || authenticationType === 'jwt' || authenticationType === 'oauth2') { _%>
import <%=packageName%>.security.*;
<%_ } _%>
<%_ if (authenticationType === 'jwt') { _%>
import <%=packageName%>.security.jwt.*;
<%_ } _%>
<%_ if (authenticationType === 'session') { _%>

import io.github.jhipster.config.JHipsterProperties;
import io.github.jhipster.security.*;
<%_ } _%>
<%_ if (authenticationType === 'oauth2') { _%>

import io.github.jhipster.security.*;
<%_ } _%>

<%_ if (authenticationType !== 'oauth2' && !skipUserManagement) { _%>
import org.springframework.beans.factory.BeanInitializationException;
<%_ } _%>
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.context.annotation.Import;
import org.springframework.http.HttpMethod;
<%_ if (authenticationType !== 'oauth2' && !skipUserManagement) { _%>
import org.springframework.security.config.annotation.authentication.builders.AuthenticationManagerBuilder;
<%_ } _%>
import org.springframework.security.config.annotation.method.configuration.EnableGlobalMethodSecurity;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.builders.WebSecurity;
<%_ if (authenticationType !== 'oauth2') { _%>
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
<%_ } _%>
import org.springframework.security.config.annotation.web.configuration.WebSecurityConfigurerAdapter;<% if (authenticationType === 'jwt') { %>
import org.springframework.security.config.http.SessionCreationPolicy;<% } %>
<%_ if (authenticationType !== 'oauth2' && !skipUserManagement) { _%>
import org.springframework.security.core.userdetails.UserDetailsService;
<%_ } _%>
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
<%_ if (authenticationType === 'session') { _%>
import org.springframework.security.web.authentication.RememberMeServices;
import org.springframework.security.web.csrf.CookieCsrfTokenRepository;
import org.springframework.security.web.csrf.CsrfFilter;
<%_ } _%>
<%_ if (authenticationType === 'oauth2') { _%>
import org.springframework.boot.autoconfigure.security.oauth2.client.EnableOAuth2Sso;
import org.springframework.security.web.csrf.CookieCsrfTokenRepository;
import org.springframework.security.web.csrf.CsrfFilter;
<%_ } _%>
<%_ if (authenticationType === 'jwt') { _%>
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;
<%_ } _%>
import org.springframework.web.filter.CorsFilter;
import org.zalando.problem.spring.web.advice.security.SecurityProblemSupport;
<%_ if (authenticationType !== 'oauth2' && !skipUserManagement) { _%>

import javax.annotation.PostConstruct;
<% } %>
@Configuration
@Import(SecurityProblemSupport.class)
<%_ if (authenticationType === 'oauth2') { _%>
@EnableOAuth2Sso
<%_ } else { _%>
@EnableWebSecurity
<%_ } _%>
@EnableGlobalMethodSecurity(prePostEnabled = true, securedEnabled = true)
public class SecurityConfiguration extends WebSecurityConfigurerAdapter {
    <%_ if (authenticationType !== 'oauth2' && !skipUserManagement) { _%>

    private final AuthenticationManagerBuilder authenticationManagerBuilder;

    private final UserDetailsService userDetailsService;
    <%_ } _%>
    <%_ if (authenticationType === 'session') { _%>

    private final JHipsterProperties jHipsterProperties;

    private final RememberMeServices rememberMeServices;
    <%_ } _%>
    <%_ if (authenticationType === 'jwt') { _%>

    private final TokenProvider tokenProvider;
    <%_ } _%>

    private final CorsFilter corsFilter;

    private final SecurityProblemSupport problemSupport;

    public SecurityConfiguration(<%_ if (authenticationType !== 'oauth2' && !skipUserManagement) { _%>AuthenticationManagerBuilder authenticationManagerBuilder, UserDetailsService userDetailsService<%_ } _%><%_ if (authenticationType === 'session') { _%>,
        JHipsterProperties jHipsterProperties, RememberMeServices rememberMeServices<%_ } if (authenticationType === 'jwt') { _%><%_ if (!skipUserManagement) { _%>,<%_ } _%>TokenProvider tokenProvider<%_ } _%>
        <%_ if (authenticationType !== 'oauth2') { _%>,<%_ } _%>CorsFilter corsFilter, SecurityProblemSupport problemSupport) {
        <%_ if (authenticationType !== 'oauth2'  && !skipUserManagement) { _%>
        this.authenticationManagerBuilder = authenticationManagerBuilder;
        this.userDetailsService = userDetailsService;
        <%_ } _%>
        <%_ if (authenticationType === 'session') { _%>
        this.jHipsterProperties = jHipsterProperties;
        this.rememberMeServices = rememberMeServices;
        <%_ } _%>
        <%_ if (authenticationType === 'jwt') { _%>
        this.tokenProvider = tokenProvider;
        <%_ } _%>
        this.corsFilter = corsFilter;
        this.problemSupport = problemSupport;
    }
    <%_ if (authenticationType !== 'oauth2' && !skipUserManagement) { _%>

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
    <%_ } _%>
    <%_ if (authenticationType === 'session') { _%>

    @Bean
    public AjaxAuthenticationSuccessHandler ajaxAuthenticationSuccessHandler() {
        return new AjaxAuthenticationSuccessHandler();
    }

    @Bean
    public AjaxAuthenticationFailureHandler ajaxAuthenticationFailureHandler() {
        return new AjaxAuthenticationFailureHandler();
    }
    <%_ } _%>
    <%_ if (authenticationType === 'session' || authenticationType === 'oauth2') { _%>

    @Bean
    public AjaxLogoutSuccessHandler ajaxLogoutSuccessHandler() {
        return new AjaxLogoutSuccessHandler();
    }
    <%_ } _%>

    @Bean
    public PasswordEncoder passwordEncoder() {
        return new BCryptPasswordEncoder();
    }

    @Override
    public void configure(WebSecurity web) throws Exception {
        web.ignoring()
            .antMatchers(HttpMethod.OPTIONS, "/**")
            .antMatchers("/app/**/*.{js,html}")
            <%_ if (clientFramework === 'angular1') { _%>
            .antMatchers("/bower_components/**")
            <%_ } _%>
            .antMatchers("/i18n/**")
            .antMatchers("/content/**")
            .antMatchers("/swagger-ui/index.html")
            .antMatchers("/test/**")<% if (devDatabaseType !== 'h2Disk' && devDatabaseType !== 'h2Memory') { %>;<% } else { %>
            .antMatchers("/h2-console/**");<% } %>
    }<% if (authenticationType === 'session' || authenticationType === 'jwt' || authenticationType === 'oauth2') { %>

    @Override
    protected void configure(HttpSecurity http) throws Exception {
        http
            <%_ if (authenticationType === 'session' || authenticationType == 'oauth2') { _%>
            .csrf()
            .csrfTokenRepository(CookieCsrfTokenRepository.withHttpOnlyFalse())
        .and()
            <%_ } _%>
            <%_ if (authenticationType === 'jwt') { _%>
            .addFilterBefore(corsFilter, UsernamePasswordAuthenticationFilter.class)
            <%_ } else if (authenticationType === 'session' || authenticationType === 'oauth2') { _%>
            .addFilterBefore(corsFilter, CsrfFilter.class)
            <%_ } _%>
            .exceptionHandling()
            .authenticationEntryPoint(problemSupport)
            .accessDeniedHandler(problemSupport)<% if (authenticationType === 'session') { %>
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
            .logoutSuccessHandler(ajaxLogoutSuccessHandler())
            .permitAll()<% } %><% if (authenticationType === 'oauth2') { %>
        .and()
            .logout()
            .logoutUrl("/api/logout")
            .logoutSuccessHandler(ajaxLogoutSuccessHandler())
            .permitAll()<% } %>
        .and()<% if (authenticationType === 'jwt') { %>
            .csrf()
            .disable()<% } %>
            .headers()
            .frameOptions()
            .disable()
        .and()<% if (authenticationType === 'jwt') { %>
            .sessionManagement()
            .sessionCreationPolicy(SessionCreationPolicy.STATELESS)
        .and()<% } %>
            .authorizeRequests()
            <%_ if (authenticationType !== 'oauth2') { _%>
            .antMatchers("/api/register").permitAll()
            .antMatchers("/api/activate").permitAll()
            .antMatchers("/api/authenticate").permitAll()
            .antMatchers("/api/account/reset-password/init").permitAll()
            .antMatchers("/api/account/reset-password/finish").permitAll()
            <%_ } _%>
            .antMatchers("/api/profile-info").permitAll()
            .antMatchers("/api/**").authenticated()<% if (websocket === 'spring-websocket') { %>
            .antMatchers("/websocket/tracker").hasAuthority(AuthoritiesConstants.ADMIN)
            .antMatchers("/websocket/**").permitAll()<% } %>
            .antMatchers("/management/health").permitAll()
            .antMatchers("/management/**").hasAuthority(AuthoritiesConstants.ADMIN)
            .antMatchers("/v2/api-docs/**").permitAll()
            .antMatchers("/swagger-resources/configuration/ui").permitAll()
            .antMatchers("/swagger-ui/index.html").hasAuthority(AuthoritiesConstants.ADMIN)<%if (authenticationType !== 'jwt') { %>;<% } else { %>
        .and()
            .apply(securityConfigurerAdapter());<% } %>

    }<% } %><% if (authenticationType === 'jwt') { %>

    private JWTConfigurer securityConfigurerAdapter() {
        return new JWTConfigurer(tokenProvider);
    }<% } %>

}
