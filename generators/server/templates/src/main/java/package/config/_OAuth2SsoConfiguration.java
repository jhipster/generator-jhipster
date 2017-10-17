<%#
 Copyright 2013-2017 the original author or authors from the JHipster project.

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

import org.springframework.beans.factory.annotation.Qualifier;
import org.springframework.boot.autoconfigure.security.oauth2.client.EnableOAuth2Sso;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.WebSecurityConfigurerAdapter;
import org.springframework.security.web.util.matcher.NegatedRequestMatcher;
import org.springframework.security.web.util.matcher.RequestMatcher;

@EnableOAuth2Sso
@Configuration
public class OAuth2SsoConfiguration extends WebSecurityConfigurerAdapter {

    private final RequestMatcher authorizationHeaderRequestMatcher;

    public OAuth2SsoConfiguration(@Qualifier("authorizationHeaderRequestMatcher") RequestMatcher authorizationHeaderRequestMatcher) {
        this.authorizationHeaderRequestMatcher = authorizationHeaderRequestMatcher;
    }

    @Override
    protected void configure(HttpSecurity http) throws Exception {
        http
            .csrf().disable()
            .requestMatcher(new NegatedRequestMatcher(authorizationHeaderRequestMatcher))
            .authorizeRequests()
            .anyRequest().permitAll();
    }
}
