package <%=packageName%>.config.metrics;

import org.springframework.beans.factory.InitializingBean;
import org.springframework.boot.actuate.health.HealthIndicator;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;<% if (prodDatabaseType == 'none' && nosqlDatabaseType == 'mongodb') { %>
import org.springframework.data.mongodb.core.MongoTemplate;<% } %>
import org.springframework.mail.javamail.JavaMailSenderImpl;

import javax.inject.Inject;<% if (prodDatabaseType != 'none') { %>
import javax.sql.DataSource;<% } %>
import java.util.LinkedHashMap;
import java.util.Map;

@Configuration
public class JHipsterHealthIndicatorConfiguration implements InitializingBean {

    @Inject
    private JavaMailSenderImpl javaMailSender;<% if (prodDatabaseType != 'none') { %>

    @Inject
    private DataSource dataSource;<% } %><% if (prodDatabaseType == 'none' && nosqlDatabaseType == 'mongodb') { %>

    @Inject
    private MongoTemplate mongoTemplate;<% } %>

    private JavaMailHealthCheckIndicator javaMailHealthCheckIndicator = new JavaMailHealthCheckIndicator();
    private DatabaseHealthCheckIndicator databaseHealthCheckIndicator = new DatabaseHealthCheckIndicator();

    @Bean
    public HealthIndicator healthIndicator() {
        return new HealthIndicator() {
            @Override
            public Object health() {
                Map<String, HealthCheckIndicator.Result> healths = new LinkedHashMap<>();

                healths.putAll(javaMailHealthCheckIndicator.health());
                healths.putAll(databaseHealthCheckIndicator.health());

                return healths;
            }
        };
    }

    @Override
    public void afterPropertiesSet() throws Exception {
        javaMailHealthCheckIndicator.setJavaMailSender(javaMailSender);<% if (prodDatabaseType != 'none') { %>
        databaseHealthCheckIndicator.setDataSource(dataSource);<% } %><% if (prodDatabaseType == 'none' && nosqlDatabaseType == 'mongodb') { %>
        databaseHealthCheckIndicator.setMongoTemplate(mongoTemplate);<% } %>
    }
}
