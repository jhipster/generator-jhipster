package <%=packageName%>.config.metrics;
import com.datastax.driver.core.Session;
import org.springframework.boot.actuate.health.HealthIndicator;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

@Configuration
public class JHipsterHealthIndicatorConfiguration {

    private final Session session;

    public JHipsterHealthIndicatorConfiguration(Session session) {
        this.session = session;
    }

    @Bean
    public HealthIndicator cassandraHealthIndicator() {
        return new CassandraHealthIndicator(session);
    }
}
