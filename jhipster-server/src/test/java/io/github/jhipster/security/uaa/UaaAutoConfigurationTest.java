/*
 * Copyright 2016-2017 the original author or authors from the JHipster project.
 *
 * This file is part of the JHipster project, see http://www.jhipster.tech/
 * for more information.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *      http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

package io.github.jhipster.security.uaa;

import static org.assertj.core.api.Assertions.assertThat;

import org.junit.Before;
import org.junit.Test;

import io.github.jhipster.config.JHipsterProperties;
import io.github.jhipster.config.JHipsterProperties.Security.ClientAuthorization;

public class UaaAutoConfigurationTest {

    private static final String ACCESS_TOKEN_URI = "http://access.token.uri/";
    private static final String TOKEN_SERVICE_ID = "tokkie";
    private static final String CLIENT_ID = "abacadabra";
    private static final String CLIENT_SECRET = "hush";

    private JHipsterProperties properties;
    private ClientAuthorization authorization;
    private UaaAutoConfiguration config;

    @Before
    public void setup() {
        properties = new JHipsterProperties();
        authorization = properties.getSecurity().getClientAuthorization();
        authorization.setAccessTokenUri(ACCESS_TOKEN_URI);
        authorization.setTokenServiceId(TOKEN_SERVICE_ID);
        authorization.setClientId(CLIENT_ID);
        authorization.setClientSecret(CLIENT_SECRET);
        config = new UaaAutoConfiguration(properties);
    }

    @Test
    public void testLoadBalancedResourceDetails() {
        LoadBalancedResourceDetails details = config.loadBalancedResourceDetails(null);
        assertThat(details.getAccessTokenUri()).isEqualTo(authorization.getAccessTokenUri());
        assertThat(details.getTokenServiceId()).isEqualTo(authorization.getTokenServiceId());
        assertThat(details.getClientId()).isEqualTo(authorization.getClientId());
        assertThat(details.getClientSecret()).isEqualTo(authorization.getClientSecret());
    }
}
