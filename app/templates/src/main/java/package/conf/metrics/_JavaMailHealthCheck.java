package <%=packageName%>.conf.metrics;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import com.codahale.metrics.health.HealthCheck;
import org.springframework.mail.javamail.JavaMailSenderImpl;

import javax.mail.MessagingException;

/**
 * Metrics HealthCheck for JavaMail.
 */
public class JavaMailHealthCheck extends HealthCheck {

    private final Logger log = LoggerFactory.getLogger(JavaMailHealthCheck.class);

    private final JavaMailSenderImpl javaMailSender;

    public JavaMailHealthCheck(JavaMailSenderImpl javaMailSender) {
        this.javaMailSender = javaMailSender;
    }

    @Override
    public Result check() {
        try {
            javaMailSender.getSession().getTransport().connect();
            return Result.healthy();
        } catch (MessagingException e) {
            log.debug("Cannot connect to e-mail server: {}", e);
            return Result.unhealthy("Cannot connect to e-mail server");
        }
    }
}
