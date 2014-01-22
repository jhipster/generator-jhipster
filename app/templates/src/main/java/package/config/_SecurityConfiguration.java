package <%=packageName%>.config;

import <%=packageName%>.security.*;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.core.env.Environment;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.RememberMeAuthenticationProvider;
import org.springframework.security.config.annotation.authentication.builders.AuthenticationManagerBuilder;
import org.springframework.security.config.annotation.method.configuration.EnableGlobalMethodSecurity;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.builders.WebSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.config.annotation.web.configuration.WebSecurityConfigurerAdapter;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.crypto.password.StandardPasswordEncoder;
import org.springframework.security.web.authentication.RememberMeServices;

import javax.inject.Inject;

@Configuration
@EnableWebSecurity
@EnableGlobalMethodSecurity(prePostEnabled = true, jsr250Enabled = true)
public class SecurityConfiguration extends WebSecurityConfigurerAdapter {

    @Inject
    private Environment env;

    @Inject
    private AjaxAuthenticationSuccessHandler ajaxAuthenticationSuccessHandler;

    @Inject
    private AjaxAuthenticationFailureHandler ajaxAuthenticationFailureHandler;

    @Inject
    private AjaxLogoutSuccessHandler ajaxLogoutSuccessHandler;

    @Inject
    private Http401UnauthorizedEntryPoint authenticationEntryPoint;

    @Bean
    public RememberMeServices rememberMeServices() {
        return new CustomPersistentRememberMeServices(env, userDetailsService());
    }

    @Bean
    public RememberMeAuthenticationProvider rememberMeAuthenticationProvider() {
        return new RememberMeAuthenticationProvider(env.getProperty("jhipster.security.rememberme.key"));
    }

    @Bean
    public AuthenticationManager authenticationManager() throws Exception {
        return super.authenticationManager();
    }

    @Bean
    public PasswordEncoder passwordEncoder() {
        return new StandardPasswordEncoder();
    }

    @Bean
    public UserDetailsService userDetailsService() {
        return new  <%=packageName%>.security.UserDetailsService();
    }

    @Override
    protected void configure(AuthenticationManagerBuilder auth) throws Exception {
        auth.userDetailsService(userDetailsService()).passwordEncoder(passwordEncoder());
    }

    @Override
    public void configure(WebSecurity web) throws Exception {
        web.ignoring()
            .antMatchers("/bower_components/**")
            .antMatchers("/fonts/**")
            .antMatchers("/images/**")
            .antMatchers("/scripts/**")
            .antMatchers("/styles/**")
            .antMatchers("/view/**");
    }

    @Override
    protected void configure(HttpSecurity http) throws Exception {
        http
            .exceptionHandling()
                .authenticationEntryPoint(authenticationEntryPoint)
                .and()
            .rememberMe()
                .rememberMeServices(rememberMeServices())
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
            .authorizeRequests()
                .antMatchers("/*").permitAll()
                .antMatchers("/app/rest/authenticate").permitAll()
                .antMatchers("/app/rest/logs/**").hasRole("ADMIN")
                .antMatchers("/app/**").authenticated()
                .antMatchers("/websocket/tracker").hasRole("ADMIN")
                .antMatchers("/websocket/**").permitAll()
                .antMatchers("/metrics/**").hasRole("ADMIN");
    }
}
