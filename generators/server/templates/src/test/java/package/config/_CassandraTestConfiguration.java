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

import <%=packageName%>.config.cassandra.CassandraConfiguration;

import io.github.jhipster.config.JHipsterConstants;

import org.apache.cassandra.config.DatabaseDescriptor;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.boot.autoconfigure.cassandra.CassandraProperties;
import org.springframework.context.annotation.Configuration;
import org.springframework.context.annotation.Profile;

@Configuration
@Profile(JHipsterConstants.SPRING_PROFILE_TEST)
public class CassandraTestConfiguration extends CassandraConfiguration {

    private final Logger log = LoggerFactory.getLogger(CassandraTestConfiguration.class);

    /**
     * Override how to get the port to connect to the Cassandra cluster
     * When deployed, the port is read by properties
     * For the tests we need to read the port dynamically to discover on which random port Cassandra-unit has started the
     * embedded cluster
     * @param properties
     * @return
     */
    @Override
    protected int getPort(CassandraProperties properties) {
        int port = properties.getPort();
        if (port == 0) {
            // random port for the tests
            int randomPort = DatabaseDescriptor.getNativeTransportPort();
            log.info("Starting the cassandra cluster connection to a random port for the tests: {}", randomPort);
            return randomPort;
        } else {
            return port;
        }
    }
}
