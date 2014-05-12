package <%=packageName%>.service;

import <%=packageName%>.domain.User;
import org.apache.velocity.app.VelocityEngine;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.context.MessageSource;
import org.springframework.core.env.Environment;
import org.springframework.mail.MailException;
import org.springframework.mail.SimpleMailMessage;
import org.springframework.mail.javamail.JavaMailSenderImpl;
import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Service;
import org.springframework.ui.velocity.VelocityEngineUtils;

import javax.annotation.PostConstruct;
import javax.inject.Inject;
import java.util.HashMap;
import java.util.Locale;
import java.util.Map;

/**
 * Service for sending e-mails.
 * <p/>
 * <p>
 * We use the @Async annotation to send e-mails asynchronously.
 * </p>
 */
@Service
public class MailService {

    // TODO: this can be used for external mail template configuration
    private static final String TEMPLATE_ROOT = "/mails/";
    private static final String TEMPLATE_SUFFIX = "Email.vm";

    private final Logger log = LoggerFactory.getLogger(MailService.class);

    @Inject
    private Environment env;

    @Inject
    private JavaMailSenderImpl javaMailSender;

    @Inject
    private MessageSource mailMessageSource;

    @Inject
    private VelocityEngine velocityEngine;

    /**
     * System default email address that sends the e-mails.
     */
    private String from;

    /**
     * System base url in sent emails.
     */
    private String baseUrl;

    @PostConstruct
    public void init() {
        this.from = env.getProperty("spring.mail.from");
        this.baseUrl = env.getProperty("spring.mail.baseUrl");
    }

    @Async
    public void sendEmail(String to, String subject, String text) {
        SimpleMailMessage message = new SimpleMailMessage();
        message.setTo(to);
        message.setFrom(from);
        message.setSubject(subject);
        message.setText(text);
        try {
            javaMailSender.send(message);
            log.debug("Sent e-mail to User '{}'!", to);
        } catch (MailException me) {
            log.warn("E-mail could not be sent to user '{}', exception is: {}", to, me.getMessage());
        }
    }

    @Async
    public void sendActivationEmail(User user) {
        Locale locale = Locale.forLanguageTag(user.getLangKey());
        String activationUrl = baseUrl + "/#/activate?key=" + user.getActivationKey();
        log.debug("Sending activation e-mail to User '{}', Url='{}' " +
                "with locale : '{}'", user.getLogin(), activationUrl, locale);

        Map<String, Object> model = new HashMap<String, Object>();
        model.put("user", user);
        model.put("activationUrl", activationUrl);

        sendTextFromTemplate(user.getLogin(), model, "activation", locale);
    }

    /**
     * Generate and send the mail corresponding to the given template.
     */
    private void sendTextFromTemplate(String email, Map<String, Object> model, String template, Locale locale) {
        model.put("messages", mailMessageSource);
        model.put("locale", locale);

        String subject = mailMessageSource.getMessage(template + ".title", null, locale);
        String text = VelocityEngineUtils.mergeTemplateIntoString(velocityEngine,
                TEMPLATE_ROOT + template + TEMPLATE_SUFFIX, "utf-8", model);
        log.debug("e-mail text  '{}", text);

        sendEmail(email, subject, text);
    }
}
