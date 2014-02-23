package <%=packageName%>.config.metrics;

import com.codahale.metrics.health.HealthCheck;
import <%=packageName%>.config.MetricsConfiguration;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.boot.autoconfigure.AutoConfigureAfter;
import org.springframework.context.annotation.Configuration;
import org.springframework.mail.javamail.JavaMailSenderImpl;

import javax.inject.Inject;

/**
 * Metrics HealthCheck for JavaMail.
 */
@Configuration("email")
@AutoConfigureAfter(MetricsConfiguration.class)
public class JavaMailHealthCheck extends HealthCheck {

    private final Logger log = LoggerFactory.getLogger(JavaMailHealthCheck.class);

    @Inject
    private JavaMailSenderImpl javaMailSender;

    public JavaMailHealthCheck() {
    }

    @Override
    public Result check() {
        try {
            javaMailSender.getSession().getTransport().connect(javaMailSender.getHost(),
                            javaMailSender.getUsername(),
                            javaMailSender.getPassword());
            return Result.healthy();
        } catch (Exception e) {
            log.debug("Cannot connect to e-mail server: {}", e);
            return Result.unhealthy("Cannot connect to e-mail server");
        }
    }
}
