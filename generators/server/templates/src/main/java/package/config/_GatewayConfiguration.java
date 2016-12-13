package <%=packageName%>.config;

import <%=packageName%>.config.ApplicationProperties;

import <%=packageName%>.gateway.ratelimiting.RateLimitingFilter;
import <%=packageName%>.gateway.ratelimiting.RateLimitingRepository;
import <%=packageName%>.gateway.accesscontrol.AccessControlFilter;
import <%=packageName%>.gateway.responserewriting.SwaggerBasePathRewritingFilter;

import com.datastax.driver.core.*;

import org.springframework.boot.autoconfigure.condition.ConditionalOnProperty;
import org.springframework.cloud.netflix.zuul.filters.RouteLocator;
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
        public AccessControlFilter accessControlFilter(RouteLocator routeLocator, ApplicationProperties applicationProperties){
            return new AccessControlFilter(routeLocator, applicationProperties);
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

        private final ApplicationProperties applicationProperties;

        public RateLimitingConfiguration(ApplicationProperties applicationProperties) {
            this.applicationProperties = applicationProperties;
        }

        @Bean
        public RateLimitingRepository rateLimitingRepository(Session session) {
            return new RateLimitingRepository(session);
        }

        @Bean
        public RateLimitingFilter rateLimitingFilter(RateLimitingRepository rateLimitingRepository) {
            return new RateLimitingFilter(rateLimitingRepository, applicationProperties);
        }
    }
}
