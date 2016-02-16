package <%=packageName%>.config;

import <%=packageName%>.gateway.ratelimiting.RateLimitingFilter;
import <%=packageName%>.gateway.ratelimiting.RateLimitingRepository;

import javax.inject.Inject;

import org.springframework.boot.autoconfigure.condition.ConditionalOnProperty;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

import com.datastax.driver.core.Session;
<%_ if (databaseType != 'cassandra') { _%>

import info.archinnov.achilles.embedded.CassandraEmbeddedServerBuilder;
<%_ } _%>

@Configuration
public class GatewayConfiguration {
    <%_ if (databaseType != 'cassandra') { _%>

    /**
     * Starts an embedded Cassandra server, useful in development.
     */
    @Configuration
    @ConditionalOnProperty("jhipster.gateway.embedded-cassandra.enabled")
    public static class EmbeddedCassandra {

        @Bean
        public Session session() {
            return CassandraEmbeddedServerBuilder
                .noEntityPackages()
                .withCQLPort(9042)
                .withClusterName("JHipster embedded cluster")
                .withKeyspaceName("gateway2")
                .withScript("config/cql/create-tables.cql")
                .buildPersistenceManager().getNativeSession();
        }
    }
    <%_ } _%>

    /**
     * Configures the Zuul filter that limits the number of API calls per user.
     * <p>
     * For this filter to work, you need to:
     * <p><ul>
     * <li>Have a working Cassandra cluster
     * <li>Have this cluster configured in your application-*.yml files, using the
     * "spring.data.cassandra" keys
     * <li>Have Spring Data Cassandra running, by removing in your application-*.yml the
     * "spring.autoconfigure.exclude" key that excludes the Cassandra and Spring Data
     * Cassandra auto-configuration.
     * </ul><p>
     */
    @Configuration
    @ConditionalOnProperty("jhipster.gateway.rate-limiting.enabled")
    public static class RateLimitingConfiguration {

        @Inject
        private JHipsterProperties jHipsterProperties;

        @Bean
        public RateLimitingRepository rateLimitingRepository() {
            return new RateLimitingRepository();
        }

        @Bean
        public RateLimitingFilter rateLimitingFilter() {
            return new RateLimitingFilter(rateLimitingRepository(), jHipsterProperties);
        }
    }
}
