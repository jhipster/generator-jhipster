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

import io.github.jhipster.config.JHipsterConstants;
import io.undertow.UndertowOptions;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.boot.web.embedded.undertow.UndertowServletWebServerFactory;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.core.env.Environment;

import java.util.Arrays;
import java.util.Collection;

@Configuration
public class UndertowConfiguration {

    private final Environment env;

    private final Logger log = LoggerFactory.getLogger(UndertowConfiguration.class);

    public UndertowConfiguration(Environment env) {
        this.env = env;
    }

    @Bean
    public UndertowServletWebServerFactory embeddedServletContainerFactory() {
        UndertowServletWebServerFactory factory = new UndertowServletWebServerFactory();
        log.info("Configuring Undertow");
        Collection<String> activeProfiles = Arrays.asList(env.getActiveProfiles());
        boolean isHttpsActive = env.getProperty("server.ssl.key-store") != null;
        boolean userCipherPresent = env.getProperty("server.ssl.ciphers") != null;
        boolean prodProfileActive = activeProfiles.contains(JHipsterConstants.SPRING_PROFILE_PRODUCTION);

        if (isHttpsActive && prodProfileActive && userCipherPresent) {
            log.info("Setting user cipher suite order to true");
            factory.addBuilderCustomizers(builder -> builder.setSocketOption(UndertowOptions.SSL_USER_CIPHER_SUITES_ORDER, Boolean.TRUE));
        }

        return factory;
    }
}
