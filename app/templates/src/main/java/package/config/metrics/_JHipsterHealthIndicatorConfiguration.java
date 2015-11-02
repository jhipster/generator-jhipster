package <%=packageName%>.config.metrics;
import com.datastax.driver.core.Session;
import org.springframework.boot.actuate.health.HealthIndicator;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

import javax.inject.Inject;

@Configuration
public class JHipsterHealthIndicatorConfiguration {

    @Inject
    private Session session;

    @Bean
    public HealthIndicator cassandraHealthIndicator() {
        return new CassandraHealthIndicator(session);
    }
}
