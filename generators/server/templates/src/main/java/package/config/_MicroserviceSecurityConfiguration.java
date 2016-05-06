package <%=packageName%>.config;

<% if(authenticationType == 'jwt') { %>
  import javax.inject.Inject;

  import org.springframework.context.annotation.Bean;
  import org.springframework.context.annotation.Configuration;
  import org.springframework.http.HttpMethod;
  import org.springframework.security.config.annotation.method.configuration.EnableGlobalMethodSecurity;
  import org.springframework.security.config.annotation.web.builders.HttpSecurity;
  import org.springframework.security.config.annotation.web.builders.WebSecurity;
  import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
  import org.springframework.security.config.annotation.web.configuration.WebSecurityConfigurerAdapter;
  import org.springframework.security.config.http.SessionCreationPolicy;
  import org.springframework.security.data.repository.query.SecurityEvaluationContextExtension;

  import <%=packageName%>.security.AuthoritiesConstants;
  import <%=packageName%>.security.jwt.JWTConfigurer;
  import <%=packageName%>.security.jwt.TokenProvider;

  @Configuration
  @EnableWebSecurity
  @EnableGlobalMethodSecurity(prePostEnabled = true, securedEnabled = true)
  public class MicroserviceSecurityConfiguration extends WebSecurityConfigurerAdapter {

      @Inject
      private TokenProvider tokenProvider;

      @Override
      public void configure(WebSecurity web) throws Exception {
          web.ignoring()
              .antMatchers(HttpMethod.OPTIONS, "/**")
              .antMatchers("/app/**/*.{js,html}")
              .antMatchers("/bower_components/**")
              .antMatchers("/i18n/**")
              .antMatchers("/content/**")
              .antMatchers("/swagger-ui/index.html")
              .antMatchers("/test/**")
              .antMatchers("/h2-console/**");
      }

      @Override
      protected void configure(HttpSecurity http) throws Exception {
          http
              .csrf()
              .disable()
              .headers()
              .frameOptions()
              .disable()
          .and()
              .sessionManagement()
              .sessionCreationPolicy(SessionCreationPolicy.STATELESS)
          .and()
              .authorizeRequests()
              .antMatchers("/api/**").authenticated()
              .antMatchers("/management/**").hasAuthority(AuthoritiesConstants.ADMIN)
              .antMatchers("/configuration/ui").permitAll()
          .and()
              .apply(securityConfigurerAdapter());

      }

      private JWTConfigurer securityConfigurerAdapter() {
          return new JWTConfigurer(tokenProvider);
      }

      @Bean
      public SecurityEvaluationContextExtension securityEvaluationContextExtension() {
          return new SecurityEvaluationContextExtension();
      }
  }
<% } %>
<% if(authenticationType == 'uaa') { %>
  import <%=packageName%>.security.AuthoritiesConstants;
  import org.springframework.context.annotation.Bean;
  import org.springframework.context.annotation.Configuration;
  import org.springframework.security.config.annotation.method.configuration.EnableGlobalMethodSecurity;
  import org.springframework.security.config.annotation.web.builders.HttpSecurity;
  import org.springframework.security.config.http.SessionCreationPolicy;
  import org.springframework.security.oauth2.config.annotation.web.configuration.EnableResourceServer;
  import org.springframework.security.oauth2.config.annotation.web.configuration.ResourceServerConfigurerAdapter;
  import org.springframework.security.oauth2.provider.token.TokenStore;
  import org.springframework.security.oauth2.provider.token.store.JwtAccessTokenConverter;
  import org.springframework.security.oauth2.provider.token.store.JwtTokenStore;

  import javax.inject.Inject;

  @Configuration
  @EnableResourceServer
  @EnableGlobalMethodSecurity(prePostEnabled = true, securedEnabled = true)
  public class MicroserviceSecurityConfiguration extends ResourceServerConfigurerAdapter {

      @Inject
      JHipsterProperties jHipsterProperties;


      @Override
      public void configure(HttpSecurity http) throws Exception {
          http
              .csrf()
              .disable()
              .headers()
              .frameOptions()
              .disable()
          .and()
              .sessionManagement()
              .sessionCreationPolicy(SessionCreationPolicy.STATELESS)
          .and()
              .authorizeRequests()
              .antMatchers("/api/**").authenticated()
              .antMatchers("/management/**").hasAuthority(AuthoritiesConstants.ADMIN)
              .antMatchers("/configuration/ui").permitAll();

      }

      @Bean
      public TokenStore tokenStore() {
          return new JwtTokenStore(jwtAccessTokenConverter());
      }

      @Bean
      public JwtAccessTokenConverter jwtAccessTokenConverter() {
          JwtAccessTokenConverter converter = new JwtAccessTokenConverter();
          converter.setSigningKey(jHipsterProperties.getSecurity().getAuthentication().getJwt().getSecret());

          return converter;
      }
  }
<% } %>
