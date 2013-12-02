package <%=packageName%>.conf.metrics;

import com.codahale.metrics.health.HealthCheck;
import org.springframework.mail.javamail.JavaMailSenderImpl;

import javax.mail.MessagingException;

/**
 * Metrics HealthCheck for JavaMail.
 */
public class JavaMailHealthCheck extends HealthCheck {

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
            return Result.unhealthy("Cannot connect to e-mail server");
        }
    }
}
