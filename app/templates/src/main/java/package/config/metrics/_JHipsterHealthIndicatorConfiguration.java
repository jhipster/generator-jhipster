package <%=packageName%>.config.metrics;
<% if (databaseType == 'cassandra') { %>
import com.datastax.driver.core.Session;<% } %>
import org.springframework.boot.actuate.health.HealthIndicator;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

import javax.inject.Inject;<% if (databaseType == 'sql') { %>
import javax.sql.DataSource;<% } %>

@Configuration
public class JHipsterHealthIndicatorConfiguration {<% if (databaseType == 'sql') { %>

    @Inject
    private DataSource dataSource;

    @Bean
    public HealthIndicator dbHealthIndicator() {
        return new DatabaseHealthIndicator(dataSource);
    }<% } %><% if (databaseType == 'cassandra') { %>

    @Inject
    private Session session;

    @Bean
    public HealthIndicator cassandraHealthIndicator() {
        return new CassandraHealthIndicator(session);
    }<% } %>
}
