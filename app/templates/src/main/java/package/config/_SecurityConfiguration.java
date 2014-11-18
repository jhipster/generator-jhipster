package <%=packageName%>.config;
<% if (authenticationType == 'cookie') { %>
import <%=packageName%>.security.*;<% } %>
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;<% if (authenticationType == 'cookie') { %>
import org.springframework.core.env.Environment;<% } %><% if (authenticationType == 'token') { %>
import org.springframework.security.access.expression.method.MethodSecurityExpressionHandler;<% } %>
<% if (authenticationType == 'token') { %>
import org.springframework.security.authentication.AuthenticationManager;<% } %>
import org.springframework.security.config.annotation.authentication.builders.AuthenticationManagerBuilder;
import org.springframework.security.config.annotation.method.configuration.EnableGlobalMethodSecurity;
import org.springframework.security.config.annotation.method.configuration.GlobalMethodSecurityConfiguration;<% if (authenticationType == 'cookie') { %>
import org.springframework.security.config.annotation.web.builders.HttpSecurity;<% } %>
import org.springframework.security.config.annotation.web.builders.WebSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.config.annotation.web.configuration.WebSecurityConfigurerAdapter;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;<% if (authenticationType == 'cookie') { %>
import org.springframework.security.web.authentication.RememberMeServices;<% } %><% if (authenticationType == 'token') { %>
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
    private AjaxLogoutSuccessHandler ajaxLogoutSuccessHandler;

    @Inject
    private Http401UnauthorizedEntryPoint authenticationEntryPoint;<% } %>

    @Inject
    private UserDetailsService userDetailsService;<% if (authenticationType == 'cookie') { %>

    @Inject
    private RememberMeServices rememberMeServices;<% } %>

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
            .antMatchers("/bower_components/**")
            .antMatchers("/fonts/**")
            .antMatchers("/images/**")
            .antMatchers("/scripts/**")
            .antMatchers("/styles/**")
            .antMatchers("/views/**")
            .antMatchers("/i18n/**")
            .antMatchers("/swagger-ui/**")<% if (authenticationType == 'token') { %>
            .antMatchers("/app/rest/register")
            .antMatchers("/app/rest/activate")<% if (websocket == 'atmosphere') { %>
            .antMatchers("/websocket/activity")<% } %><% } %><% if (devDatabaseType != 'h2Memory') { %>;<% } else { %>
            .antMatchers("/console/**");<% } %>
    }<% if (authenticationType == 'cookie') { %>

    @Override
    protected void configure(HttpSecurity http) throws Exception {
        http
            .exceptionHandling()
            .authenticationEntryPoint(authenticationEntryPoint)
        .and()
            .rememberMe()
            .rememberMeServices(rememberMeServices)
            .key(env.getProperty("jhipster.security.rememberme.key"))
        .and()
            .formLogin()
            .loginProcessingUrl("/app/authentication")
            .successHandler(ajaxAuthenticationSuccessHandler)
            .failureHandler(ajaxAuthenticationFailureHandler)
            .usernameParameter("j_username")
            .passwordParameter("j_password")
            .permitAll()
        .and()
            .logout()
            .logoutUrl("/app/logout")
            .logoutSuccessHandler(ajaxLogoutSuccessHandler)
            .deleteCookies("JSESSIONID")
            .permitAll()
        .and()
            .csrf()
            .disable()
            .headers()
            .frameOptions()
            .disable()
            .authorizeRequests()
                .antMatchers("/app/rest/register").permitAll()
                .antMatchers("/app/rest/activate").permitAll()
                .antMatchers("/app/rest/authenticate").permitAll()
                .antMatchers("/app/rest/logs/**").hasAuthority(AuthoritiesConstants.ADMIN)
                .antMatchers("/app/**").authenticated()<% if (websocket == 'atmosphere') { %>
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
                .antMatchers("/protected/**").authenticated();

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
    }
}
