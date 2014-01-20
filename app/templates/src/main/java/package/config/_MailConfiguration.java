package <%=packageName%>.config;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.boot.bind.RelaxedPropertyResolver;
import org.springframework.context.EnvironmentAware;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.core.env.Environment;
import org.springframework.mail.javamail.JavaMailSenderImpl;

import java.util.Properties;

@Configuration
public class MailConfiguration implements EnvironmentAware {

  private final Logger log = LoggerFactory.getLogger(MailConfiguration.class);

  private RelaxedPropertyResolver env;

  public MailConfiguration() {
  }

  @Override
  public void setEnvironment(Environment environment) {
    this.env = new RelaxedPropertyResolver(environment, "spring.mail.");
  }

  @Bean
  public JavaMailSenderImpl javaMailSender() {
    log.debug("Configuring mail server");
    String host = env.getProperty("host", "localhost");
    int port = env.getProperty("port", Integer.class, 0);
    String user = env.getProperty("user");
    String password = env.getProperty("password");
    String protocol = env.getProperty("protocol");
    Boolean tls = env.getProperty("tls", Boolean.class, false);

    JavaMailSenderImpl sender = new JavaMailSenderImpl();
    if (host != null && !host.equals("")) {
      log.warn("Warning! Your SMTP server is not configured. We will try to use one on localhost.");
      log.debug("Did you configure your SMTP settings in your application.yml?");
      sender.setHost("127.0.0.1");
    } else {
      sender.setHost(host);
    }
    sender.setPort(port);
    sender.setUsername(user);
    sender.setPassword(password);

    Properties sendProperties = new Properties();
    sendProperties.setProperty("smtp.starttls.enable", tls ? "true" : "false");
    sendProperties.setProperty("mail.transport.protocol", protocol);
    sender.setJavaMailProperties(sendProperties);
    return sender;
  }
}
