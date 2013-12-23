package <%=packageName%>.conf;

import <%=packageName%>.security.*;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.core.Ordered;
import org.springframework.core.annotation.Order;
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
@EnableGlobalMethodSecurity
@Order(Ordered.LOWEST_PRECEDENCE - 20)
public class SecurityConfiguration extends WebSecurityConfigurerAdapter {

    @Inject
    public void registerGlobal(AuthenticationManagerBuilder auth) throws Exception {
        auth.userDetailsService(userDetailsService()).passwordEncoder(passwordEncoder());
    }

    @Override
    public void configure(WebSecurity web) throws Exception {
        web.ignoring()
                .antMatchers("/*")
                .antMatchers("/bower_components/**")
                .antMatchers("/fonts/**")
                .antMatchers("/images/**")
                .antMatchers("/scripts/**")
                .antMatchers("/styles/**")
                .antMatchers("/view/**");
    }

    @Bean
    public RememberMeServices rememberMeServices() {
        return new CustomPersistentRememberMeServices(userDetailsService());
    }

    @Bean
    public RememberMeAuthenticationProvider rememberMeAuthenticationProvider() {
        return new RememberMeAuthenticationProvider("jhipsterKey");
    }

    @Bean
    public PasswordEncoder passwordEncoder() {
        return new StandardPasswordEncoder();
    }

    @Bean
    public UserDetailsService userDetailsService() {
        return new <%=packageName%>.security.UserDetailsService();
    }

    @Configuration
    @EnableWebSecurity
    @Order(Ordered.LOWEST_PRECEDENCE - 30)
    public static class ApiWebSecurityConfigurationAdapter extends WebSecurityConfigurerAdapter {

        @Inject
        private Http401UnauthorizedEntryPoint authenticationEntryPoint;

        @Inject
        private RememberMeServices rememberMeServices;

        protected void configure(HttpSecurity http) throws Exception {
            http
                    .exceptionHandling()
                        .authenticationEntryPoint(authenticationEntryPoint)
                        .and()
                    .rememberMe()
                        .rememberMeServices(rememberMeServices)
                        .and()
                    .authorizeRequests()
                        .antMatchers("/app/rest/**").authenticated();
        }
    }

    @Configuration
    @EnableWebSecurity
    @Order(Ordered.LOWEST_PRECEDENCE - 40)
    public static class FormLoginWebSecurityConfigurerAdapter extends WebSecurityConfigurerAdapter {

        @Inject
        private RememberMeServices rememberMeServices;

        @Inject
        private AjaxAuthenticationSuccessHandler ajaxAuthenticationSuccessHandler;

        @Inject
        private AjaxAuthenticationFailureHandler ajaxAuthenticationFailureHandler;

        @Inject
        private AjaxLogoutSuccessHandler ajaxLogoutSuccessHandler;

        @Override
        protected void configure(HttpSecurity http) throws Exception {
            http
                    .formLogin()
                        .loginProcessingUrl("/app/authentication")
                        .successHandler(ajaxAuthenticationSuccessHandler)
                        .failureHandler(ajaxAuthenticationFailureHandler)
                        .permitAll()
                        .and()
                    .logout()
                        .logoutUrl("/app/logout")
                        .logoutSuccessHandler(ajaxLogoutSuccessHandler)
                        .deleteCookies("JSESSIONID")
                        .permitAll()
                        .and()
                    .rememberMe()
                        .rememberMeServices(rememberMeServices)
                        .and()
                    .csrf()
                        .disable()
                    .authorizeRequests()
                        .antMatchers("/app/**").authenticated()
                        .antMatchers("/metrics/**").hasRole("ADMIN")
                        .antMatchers("/logs/**").hasRole("ADMIN");



        }
    }
}
