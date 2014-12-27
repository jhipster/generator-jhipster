package <%=packageName%>.config;
<% if (authenticationType == 'cookie' || authenticationType == 'xauth') { %>
import <%=packageName%>.security.*;<% } %><% if (authenticationType == 'cookie') { %>
import <%=packageName%>.web.filter.CsrfCookieGeneratorFilter;<% } %><% if (authenticationType == 'xauth') { %>
import <%=packageName%>.security.xauth.*;<% } %>
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;<% if (authenticationType == 'cookie') { %>
import org.springframework.core.env.Environment;<% } %><% if (authenticationType == 'token') { %>
import org.springframework.security.access.expression.method.MethodSecurityExpressionHandler;<% } %>
<% if (authenticationType == 'token' || authenticationType == 'xauth') { %>
import org.springframework.security.authentication.AuthenticationManager;<% } %>
import org.springframework.security.config.annotation.authentication.builders.AuthenticationManagerBuilder;
import org.springframework.security.config.annotation.method.configuration.EnableGlobalMethodSecurity;
import org.springframework.security.config.annotation.method.configuration.GlobalMethodSecurityConfiguration;<% if (authenticationType == 'cookie' || authenticationType == 'xauth') { %>
import org.springframework.security.config.annotation.web.builders.HttpSecurity;<% } %>
import org.springframework.security.config.annotation.web.builders.WebSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.config.annotation.web.configuration.WebSecurityConfigurerAdapter;<% if (authenticationType == 'xauth') { %>
import org.springframework.security.config.http.SessionCreationPolicy;<% } %>
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;<% if (authenticationType == 'cookie') { %>
import org.springframework.security.web.authentication.RememberMeServices;
import org.springframework.security.web.csrf.CsrfFilter;<% } %><% if (authenticationType == 'token') { %>
import org.springframework.security.oauth2.provider.expression.OAuth2MethodSecurityExpressionHandler;<% } %>

import javax.inject.Inject;

@Configuration
@EnableWebSecurity
public class SecurityConfiguration extends WebSecurityConfigurerAdapter {<% if (authenticationType == 'cookie') { %>

    @Inject
    private Environment env;

    @Inject
    private AjaxAuthenticationSuccessHandler ajaxAuthenticationSuccessHandler;

    @Inject
    private AjaxAuthenticationFailureHandler ajaxAuthenticationFailureHandler;

    @Inject
    private AjaxLogoutSuccessHandler ajaxLogoutSuccessHandler;<% } %><% if (authenticationType == 'cookie' || authenticationType == 'xauth') { %>

    @Inject
    private Http401UnauthorizedEntryPoint authenticationEntryPoint;<% } %>

    @Inject
    private UserDetailsService userDetailsService;<% if (authenticationType == 'cookie') { %>

    @Inject
    private RememberMeServices rememberMeServices;<% } %><% if (authenticationType == 'xauth') { %>

    @Inject
    private TokenProvider tokenProvider;<% } %>

    @Bean
    public PasswordEncoder passwordEncoder() {
        return new BCryptPasswordEncoder();
    }

    @Inject
    public void configureGlobal(AuthenticationManagerBuilder auth) throws Exception {
        auth
            .userDetailsService(userDetailsService)
                .passwordEncoder(passwordEncoder());
    }

    @Override
    public void configure(WebSecurity web) throws Exception {
        web.ignoring()
            .antMatchers("/scripts/**/*.{js,html}")
            .antMatchers("/bower_components/**")
            .antMatchers("/i18n/**")
            .antMatchers("/assets/**")
            .antMatchers("/swagger-ui/**")<% if (authenticationType == 'token') { %>
            .antMatchers("/api/register")
            .antMatchers("/api/activate")<% if (websocket == 'atmosphere') { %>
            .antMatchers("/websocket/activity")<% } %><% } %>
            .antMatchers("/test/**")<% if (devDatabaseType != 'h2Memory') { %>;<% } else { %>
            .antMatchers("/console/**");<% } %>
    }<% if (authenticationType == 'cookie' || authenticationType == 'xauth') { %>

    @Override
    protected void configure(HttpSecurity http) throws Exception {
        http<% if (authenticationType == 'cookie') { %>
            .addFilterAfter(new CsrfCookieGeneratorFilter(), CsrfFilter.class)<% } %>
            .exceptionHandling()
            .authenticationEntryPoint(authenticationEntryPoint)<% if (authenticationType == 'cookie') { %>
        .and()
            .rememberMe()
            .rememberMeServices(rememberMeServices)
            .key(env.getProperty("jhipster.security.rememberme.key"))
        .and()
            .formLogin()
            .loginProcessingUrl("/api/authentication")
            .successHandler(ajaxAuthenticationSuccessHandler)
            .failureHandler(ajaxAuthenticationFailureHandler)
            .usernameParameter("j_username")
            .passwordParameter("j_password")
            .permitAll()
        .and()
            .logout()
            .logoutUrl("/api/logout")
            .logoutSuccessHandler(ajaxLogoutSuccessHandler)
            .deleteCookies("JSESSIONID", "hazelcast.sessionId", "CSRF-TOKEN")
            .permitAll()<% } %>
        .and()<% if (authenticationType == 'xauth') { %>
            .csrf()
            .disable()<% } %>
            .headers()
            .frameOptions()
            .disable()<% if (authenticationType == 'xauth') { %>
            .sessionManagement()
            .sessionCreationPolicy(SessionCreationPolicy.STATELESS)
        .and()<% } %>
            .authorizeRequests()
                .antMatchers("/api/register").permitAll()
                .antMatchers("/api/activate").permitAll()
                .antMatchers("/api/authenticate").permitAll()
                .antMatchers("/api/logs/**").hasAuthority(AuthoritiesConstants.ADMIN)
                .antMatchers("/api/**").authenticated()<% if (websocket == 'atmosphere') { %>
                .antMatchers("/websocket/tracker").hasAuthority(AuthoritiesConstants.ADMIN)
                .antMatchers("/websocket/**").permitAll()<% } %>
                .antMatchers("/metrics/**").hasAuthority(AuthoritiesConstants.ADMIN)
                .antMatchers("/health/**").hasAuthority(AuthoritiesConstants.ADMIN)
                .antMatchers("/trace/**").hasAuthority(AuthoritiesConstants.ADMIN)
                .antMatchers("/dump/**").hasAuthority(AuthoritiesConstants.ADMIN)
                .antMatchers("/shutdown/**").hasAuthority(AuthoritiesConstants.ADMIN)
                .antMatchers("/beans/**").hasAuthority(AuthoritiesConstants.ADMIN)
                .antMatchers("/configprops/**").hasAuthority(AuthoritiesConstants.ADMIN)
                .antMatchers("/info/**").hasAuthority(AuthoritiesConstants.ADMIN)
                .antMatchers("/autoconfig/**").hasAuthority(AuthoritiesConstants.ADMIN)
                .antMatchers("/env/**").hasAuthority(AuthoritiesConstants.ADMIN)
                .antMatchers("/trace/**").hasAuthority(AuthoritiesConstants.ADMIN)
                .antMatchers("/api-docs/**").hasAuthority(AuthoritiesConstants.ADMIN)
                .antMatchers("/protected/**").authenticated()<% if (authenticationType != 'xauth') { %>;<% } %><% if (authenticationType == 'xauth') { %>
        .and()
            .apply(securityConfigurerAdapter());<% } %>

    }<% } %><% if (authenticationType == 'token') { %>

    @Override
    @Bean
    public AuthenticationManager authenticationManagerBean() throws Exception {
        return super.authenticationManagerBean();
    }<% } %>

    @EnableGlobalMethodSecurity(prePostEnabled = true, jsr250Enabled = true)
    private static class GlobalSecurityConfiguration extends GlobalMethodSecurityConfiguration {<% if (authenticationType == 'token') { %>

        @Override
        protected MethodSecurityExpressionHandler createExpressionHandler() {
            return new OAuth2MethodSecurityExpressionHandler();
        }<% } %>
    }<% if (authenticationType == 'xauth') { %>

    private XAuthTokenConfigurer securityConfigurerAdapter() {
      return new XAuthTokenConfigurer(userDetailsService, tokenProvider);
    }<% } %>
}
