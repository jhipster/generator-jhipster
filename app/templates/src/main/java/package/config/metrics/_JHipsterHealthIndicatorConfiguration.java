package <%=packageName%>.config.metrics;

import org.springframework.boot.actuate.health.HealthIndicator;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.mail.javamail.JavaMailSenderImpl;

import javax.inject.Inject;<% if (databaseType == 'sql') { %>
import javax.sql.DataSource;<% } %><% if (databaseType == 'nosql') { %>
import org.springframework.data.mongodb.core.MongoTemplate;<% } %>

@Configuration
public class JHipsterHealthIndicatorConfiguration {

    @Inject
    private JavaMailSenderImpl javaMailSender;<% if (databaseType == 'sql') { %>

    @Inject
    private DataSource dataSource;<% } %><% if (databaseType == 'nosql') { %>

    @Inject
    private MongoTemplate mongoTemplate;<% } %>

    @Bean
    public HealthIndicator dbHealthIndicator() {<% if (databaseType == 'sql') { %>
        return new DatabaseHealthIndicator(dataSource);<% } %><% if (databaseType == 'nosql') { %>
        return new DatabaseHealthIndicator(mongoTemplate);<% } %>
    }

    @Bean
    public HealthIndicator mailHealthIndicator() {
        return new JavaMailHealthIndicator(javaMailSender);
    }
}
