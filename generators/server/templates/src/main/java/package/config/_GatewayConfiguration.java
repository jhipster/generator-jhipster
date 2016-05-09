package <%=packageName%>.config;

import <%=packageName%>.gateway.ratelimiting.RateLimitingFilter;
import <%=packageName%>.gateway.ratelimiting.RateLimitingRepository;
import <%=packageName%>.gateway.accesscontrol.AccessControlFilter;
import <%=packageName%>.gateway.responserewriting.SwaggerBasePathRewritingFilter;

import javax.inject.Inject;

import org.springframework.boot.autoconfigure.condition.ConditionalOnProperty;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

@Configuration
public class GatewayConfiguration {

    @Configuration
    public static class SwaggerBasePathRewritingConfiguration {

        @Bean
        public SwaggerBasePathRewritingFilter swaggerBasePathRewritingFilter(){
            return new SwaggerBasePathRewritingFilter();
        }
    }

    @Configuration
    public static class AccessControlFilterConfiguration {

        @Bean
        public AccessControlFilter accessControlFilter(){
            return new AccessControlFilter();
        }
    }

    /**
     * Configures the Zuul filter that limits the number of API calls per user.
     * <p>
     * For this filter to work, you need to have:
     * <ul>
     * <li>A working Cassandra cluster
     * <li>A schema with the JHipster rate-limiting tables configured, using the
     * "create_keyspace.cql" and "create_tables.cql" scripts from the
     * "src/main/resources/config/cql" directory
     * <li>Your cluster configured in your application-*.yml files, using the
     * "spring.data.cassandra" keys
     * </ul>
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
