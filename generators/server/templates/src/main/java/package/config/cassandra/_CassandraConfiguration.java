<%#
 Copyright 2013-2017 the original author or authors from the JHipster project.

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
package <%=packageName%>.config.cassandra;

import io.github.jhipster.config.JHipsterConstants;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.BeanUtils;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.autoconfigure.cassandra.CassandraProperties;<% if (applicationType === 'gateway' && databaseType !== 'cassandra') { %>
import org.springframework.boot.autoconfigure.condition.ConditionalOnProperty;<% } %>
import org.springframework.boot.context.properties.EnableConfigurationProperties;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.context.annotation.Profile;
import org.springframework.util.StringUtils;

import com.codahale.metrics.MetricRegistry;
import com.datastax.driver.core.Cluster;
import com.datastax.driver.core.DataType;
import com.datastax.driver.core.ProtocolVersion;
import com.datastax.driver.core.QueryOptions;
import com.datastax.driver.core.Session;
import com.datastax.driver.core.SocketOptions;
import com.datastax.driver.core.TupleType;
import com.datastax.driver.core.policies.LoadBalancingPolicy;
import com.datastax.driver.core.policies.ReconnectionPolicy;
import com.datastax.driver.core.policies.RetryPolicy;
import com.datastax.driver.extras.codecs.jdk8.InstantCodec;
import com.datastax.driver.extras.codecs.jdk8.LocalDateCodec;
import com.datastax.driver.extras.codecs.jdk8.ZonedDateTimeCodec;

@Configuration<% if (applicationType === 'gateway' && databaseType !== 'cassandra') { %>
@ConditionalOnProperty("jhipster.gateway.rate-limiting.enabled")<% } %>
@EnableConfigurationProperties(CassandraProperties.class)
@Profile({JHipsterConstants.SPRING_PROFILE_DEVELOPMENT, JHipsterConstants.SPRING_PROFILE_PRODUCTION})
public class CassandraConfiguration {

    @Value("${spring.data.cassandra.protocolVersion:V4}")
    private ProtocolVersion protocolVersion;

    @Autowired(required = false)
    MetricRegistry metricRegistry;

    private final Logger log = LoggerFactory.getLogger(CassandraConfiguration.class);

    @Bean
    public Cluster cluster(CassandraProperties properties) {
        Cluster.Builder builder = Cluster.builder()
                .withClusterName(properties.getClusterName())
                .withProtocolVersion(protocolVersion)
                .withPort(getPort(properties));

        if (properties.getUsername() != null) {
            builder.withCredentials(properties.getUsername(), properties.getPassword());
        }
        if (properties.getCompression() != null) {
            builder.withCompression(properties.getCompression());
        }
        if (properties.getLoadBalancingPolicy() != null) {
            LoadBalancingPolicy policy = instantiate(properties.getLoadBalancingPolicy());
            builder.withLoadBalancingPolicy(policy);
        }
        builder.withQueryOptions(getQueryOptions(properties));
        if (properties.getReconnectionPolicy() != null) {
            ReconnectionPolicy policy = instantiate(properties.getReconnectionPolicy());
            builder.withReconnectionPolicy(policy);
        }
        if (properties.getRetryPolicy() != null) {
            RetryPolicy policy = instantiate(properties.getRetryPolicy());
            builder.withRetryPolicy(policy);
        }
        builder.withSocketOptions(getSocketOptions(properties));
        if (properties.isSsl()) {
            builder.withSSL();
        }
        String points = properties.getContactPoints();
        builder.addContactPoints(StringUtils.commaDelimitedListToStringArray(points));

        Cluster cluster = builder.build();

        TupleType tupleType = cluster.getMetadata()
            .newTupleType(DataType.timestamp(), DataType.varchar());

        cluster.getConfiguration().getCodecRegistry()
                .register(LocalDateCodec.instance)
                .register(InstantCodec.instance)
                .register(new ZonedDateTimeCodec(tupleType));

        if (metricRegistry != null) {
            cluster.init();
            metricRegistry.registerAll(cluster.getMetrics().getRegistry());
        }

        return cluster;
    }

    protected int getPort(CassandraProperties properties) {
        return properties.getPort();
    }

    public static <T> T instantiate(Class<T> type) {
        return BeanUtils.instantiate(type);
    }

    private QueryOptions getQueryOptions(CassandraProperties properties) {
        QueryOptions options = new QueryOptions();
        if (properties.getConsistencyLevel() != null) {
            options.setConsistencyLevel(properties.getConsistencyLevel());
        }
        if (properties.getSerialConsistencyLevel() != null) {
            options.setSerialConsistencyLevel(properties.getSerialConsistencyLevel());
        }
        options.setFetchSize(properties.getFetchSize());
        return options;
    }

    private SocketOptions getSocketOptions(CassandraProperties properties) {
        SocketOptions options = new SocketOptions();
        options.setConnectTimeoutMillis(properties.getConnectTimeoutMillis());
        options.setReadTimeoutMillis(properties.getReadTimeoutMillis());
        return options;
    }

    @Bean(destroyMethod = "close")
    public Session session(CassandraProperties properties, Cluster cluster) {
        log.debug("Configuring Cassandra session");
        return StringUtils.hasText(properties.getKeyspaceName()) ? cluster.connect(properties.getKeyspaceName()) : cluster.connect();
    }
}
