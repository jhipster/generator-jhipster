package <%=packageName%>.config.metrics;

import org.springframework.beans.factory.InitializingBean;
import org.springframework.boot.actuate.health.HealthIndicator;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;<% if (databaseType == 'nosql') { %>
import org.springframework.data.mongodb.core.MongoTemplate;<% } %>
import org.springframework.mail.javamail.JavaMailSenderImpl;

import javax.inject.Inject;<% if (databaseType == 'sql') { %>
import javax.sql.DataSource;<% } %>

@Configuration
public class JHipsterHealthIndicatorConfiguration implements InitializingBean {

    @Inject
    private JavaMailSenderImpl javaMailSender;<% if (databaseType == 'sql') { %>

    @Inject
    private DataSource dataSource;<% } %><% if (databaseType == 'nosql') { %>

    @Inject
    private MongoTemplate mongoTemplate;<% } %>

    private JavaMailHealthCheckIndicator javaMailHealthCheckIndicator = new JavaMailHealthCheckIndicator();
	
    private DatabaseHealthCheckIndicator databaseHealthCheckIndicator = new DatabaseHealthCheckIndicator();

    @Override
    public void afterPropertiesSet() throws Exception {
        javaMailHealthCheckIndicator.setJavaMailSender(javaMailSender);<% if (databaseType == 'sql') { %>
        databaseHealthCheckIndicator.setDataSource(dataSource);<% } %><% if (databaseType == 'nosql') { %>
        databaseHealthCheckIndicator.setMongoTemplate(mongoTemplate);<% } %>
    }
}
