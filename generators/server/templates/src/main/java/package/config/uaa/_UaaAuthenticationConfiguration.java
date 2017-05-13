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
package <%=packageName%>.config.uaa;

import <%=packageName%>.security.uaa.CookieTokenExtractor;
import <%=packageName%>.security.uaa.OAuth2CookieHelper;
import <%=packageName%>.security.uaa.UaaAuthenticationService;
import <%=packageName%>.web.filter.RefreshTokenFilterConfigurer;
import io.github.jhipster.config.JHipsterProperties;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.config.annotation.method.configuration.EnableGlobalMethodSecurity;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.oauth2.config.annotation.web.configuration.EnableResourceServer;
import org.springframework.security.oauth2.config.annotation.web.configuration.ResourceServerConfigurerAdapter;
import org.springframework.security.oauth2.config.annotation.web.configurers.ResourceServerSecurityConfigurer;
import org.springframework.security.oauth2.provider.authentication.TokenExtractor;
import org.springframework.security.oauth2.provider.token.TokenStore;
import org.springframework.web.client.RestTemplate;

/**
 * Configures the RefreshFilter refreshing expired OAuth2 token Cookies.
 */
@Configuration
@EnableResourceServer
@EnableGlobalMethodSecurity(prePostEnabled = true, securedEnabled = true)
public class UaaAuthenticationConfiguration extends ResourceServerConfigurerAdapter {
    private final JHipsterProperties jHipsterProperties;
    private final TokenStore tokenStore;
    private final RestTemplate restTemplate;

    public UaaAuthenticationConfiguration(JHipsterProperties jHipsterProperties, TokenStore tokenStore, RestTemplate loadBalancedRestTemplate) {
        this.jHipsterProperties = jHipsterProperties;
        this.tokenStore = tokenStore;
        this.restTemplate = loadBalancedRestTemplate;
    }

    @Override
    public void configure(HttpSecurity http) throws Exception {
        http
            .authorizeRequests()
            .antMatchers("/auth/login").permitAll()
            .antMatchers("/auth/logout").authenticated()
            .and()
            .apply(refreshTokenSecurityConfigurerAdapter());
    }

    /**
     * A SecurityConfigurerAdapter to install a servlet filter that refreshes OAuth2 tokens.
     */
    private RefreshTokenFilterConfigurer refreshTokenSecurityConfigurerAdapter() {
        return new RefreshTokenFilterConfigurer(uaaAuthenticationService(), tokenStore);
    }

    @Bean
    public OAuth2CookieHelper cookieHelper() {
        return new OAuth2CookieHelper();
    }

    @Bean
    public UaaAuthenticationService uaaAuthenticationService() {
        return new UaaAuthenticationService(jHipsterProperties, cookieHelper(), restTemplate);
    }

    /**
     * Configure the ResourceServer security by installing a new TokenExtractor.
     */
    @Override
    public void configure(ResourceServerSecurityConfigurer resources) throws Exception {
        resources.tokenExtractor(tokenExtractor());
    }

    /**
     * The new TokenExtractor can extract tokens from Cookies and Authorization headers.
     *
     * @return the CookieTokenExtractor bean.
     */
    @Bean
    public TokenExtractor tokenExtractor() {
        return new CookieTokenExtractor();
    }

}
