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

import com.datastax.driver.core.*;
import com.datastax.driver.core.policies.LoadBalancingPolicy;
import com.datastax.driver.core.ProtocolVersion;
import com.datastax.driver.core.policies.ReconnectionPolicy;
import com.datastax.driver.core.policies.RetryPolicy;
import com.datastax.driver.extras.codecs.jdk8.InstantCodec;
import com.datastax.driver.extras.codecs.jdk8.LocalDateCodec;
import com.datastax.driver.extras.codecs.jdk8.LocalTimeCodec;
import com.datastax.driver.extras.codecs.jdk8.ZonedDateTimeCodec;

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
import org.springframework.data.cassandra.config.Abstract<% if (reactive) { %>Reactive<% } %>CassandraConfiguration;
import org.springframework.data.cassandra.config.CassandraClusterFactoryBean;
import org.springframework.data.cassandra.config.ClusterBuilderConfigurer;
import org.springframework.data.cassandra.config.CompressionType;

import com.codahale.metrics.MetricRegistry;


@Configuration<% if (applicationType === 'gateway' && databaseType !== 'cassandra') { %>
@ConditionalOnProperty("jhipster.gateway.rate-limiting.enabled")<% } %>
@EnableConfigurationProperties(CassandraProperties.class)
@Profile({JHipsterConstants.SPRING_PROFILE_DEVELOPMENT, JHipsterConstants.SPRING_PROFILE_PRODUCTION})
public class CassandraConfiguration extends Abstract<% if (reactive) { %>Reactive<% } %>CassandraConfiguration {

    @Value("${spring.data.cassandra.protocolVersion:V4}")
    private ProtocolVersion protocolVersion;

    @Autowired
    CassandraProperties properties;

    @Autowired(required = false)
    MetricRegistry metricRegistry;

    private final Logger log = LoggerFactory.getLogger(CassandraConfiguration.class);

    @Override
    protected String getKeyspaceName() {
        return properties.getKeyspaceName();
    }

    @Override
    @Bean
    public CassandraClusterFactoryBean cluster() {
        final CassandraClusterFactoryBean cluster = new CassandraClusterFactoryBean();
        cluster.setClusterName(properties.getClusterName());
        cluster.setProtocolVersion(protocolVersion);
        cluster.setPort(properties.getPort());

        if (properties.getUsername() != null) {
            cluster.setUsername(properties.getUsername());
            cluster.setPassword(properties.getPassword());
        }
        if (properties.getCompression() != null && !properties.getCompression().toString().isEmpty()) {
            cluster.setCompressionType(CompressionType.valueOf(properties.getCompression().toString().toUpperCase()));
        }
        if (properties.getLoadBalancingPolicy() != null) {
            LoadBalancingPolicy policy = instantiate(properties.getLoadBalancingPolicy());
            cluster.setLoadBalancingPolicy(policy);
        }
        cluster.setQueryOptions(getQueryOptions());
        if (properties.getReconnectionPolicy() != null) {
            ReconnectionPolicy policy = instantiate(properties.getReconnectionPolicy());
            cluster.setReconnectionPolicy(policy);
        }
        if (properties.getRetryPolicy() != null) {
            RetryPolicy policy = instantiate(properties.getRetryPolicy());
            cluster.setRetryPolicy(policy);
        }
        cluster.setSocketOptions(getSocketOptions());
        if (properties.isSsl()) {
            cluster.setSslEnabled(true);
        }
        String points = properties.getContactPoints();
        cluster.setContactPoints(points);
        cluster.setClusterBuilderConfigurer(clusterBuilder -> {
            log.info(String.valueOf(clusterBuilder.getConfiguration().getCodecRegistry()==null));
            clusterBuilder.getConfiguration().getCodecRegistry()
                .register(LocalDateCodec.instance,
                    InstantCodec.instance,
                    new ZonedDateTimeCodec(TupleType.of(protocolVersion, clusterBuilder.getConfiguration().getCodecRegistry(), DataType.timestamp(), DataType.varchar())));
            return clusterBuilder;
        });
        return cluster;
    }

    protected QueryOptions getQueryOptions() {
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

    protected SocketOptions getSocketOptions() {
        SocketOptions options = new SocketOptions();
        options.setConnectTimeoutMillis(properties.getConnectTimeoutMillis());
        options.setReadTimeoutMillis(properties.getReadTimeoutMillis());
        return options;
    }

    public static <T> T instantiate(Class<T> type) {
        return BeanUtils.instantiateClass(type);
    }
}
