package <%=packageName%>;

<%_ if (applicationType === 'microservice' && authenticationType === 'uaa') { _%>
import <%=packageName%>.client.OAuth2InterceptedFeignConfiguration;
<%_ } _%>
import <%=packageName%>.config.ApplicationProperties;
import <%=packageName%>.config.DefaultProfileUtil;

import io.github.jhipster.config.JHipsterConstants;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.boot.SpringApplication;
import org.springframework.boot.actuate.autoconfigure.*;
import org.springframework.boot.autoconfigure.EnableAutoConfiguration;
<%_ if (clusteredHttpSession === 'hazelcast') { _%>
import org.springframework.boot.autoconfigure.hazelcast.HazelcastAutoConfiguration;
<%_ } _%>
import org.springframework.boot.autoconfigure.liquibase.LiquibaseProperties;
import org.springframework.boot.context.properties.EnableConfigurationProperties;
<%_ if (serviceDiscoveryType) { _%>
import org.springframework.cloud.client.discovery.EnableDiscoveryClient;
<%_ } _%>
<%_ if (applicationType === 'gateway') { _%>
import org.springframework.cloud.netflix.zuul.EnableZuulProxy;
<%_ } _%>
import org.springframework.context.annotation.ComponentScan;
<%_ if (authenticationType === 'uaa') { _%>
import org.springframework.context.annotation.FilterType;
<%_ } _%>
import org.springframework.core.env.Environment;

import javax.annotation.PostConstruct;
import java.net.InetAddress;
import java.net.UnknownHostException;
import java.util.Arrays;
import java.util.Collection;

<%_ if (applicationType === 'microservice' && authenticationType === 'uaa') { _%>
@ComponentScan(
    excludeFilters = @ComponentScan.Filter(type = FilterType.ASSIGNABLE_TYPE, classes = OAuth2InterceptedFeignConfiguration.class)
)
<%_ } else { _%>
@ComponentScan
<%_ } _%>
@EnableAutoConfiguration(exclude = {MetricFilterAutoConfiguration.class, MetricRepositoryAutoConfiguration.class<% if (clusteredHttpSession == 'hazelcast') { %>, HazelcastAutoConfiguration.class<% } %><% if (applicationType == 'gateway') { %>, MetricsDropwizardAutoConfiguration.class<% } %>})
@EnableConfigurationProperties({<% if (databaseType == 'sql') { %>LiquibaseProperties.class, <% } %>ApplicationProperties.class})
<%_ if (serviceDiscoveryType) { _%>
@EnableDiscoveryClient
<%_ } _%>
<%_ if (applicationType === 'gateway') { _%>
@EnableZuulProxy
<%_ } _%>
public class <%= mainClass %> {

    private static final Logger log = LoggerFactory.getLogger(<%= mainClass %>.class);

    private final Environment env;

    public <%= mainClass %>(Environment env) {
        this.env = env;
    }

    /**
     * Initializes <%= baseName %>.
     * <p>
     * Spring profiles can be configured with a program arguments --spring.profiles.active=your-active-profile
     * <p>
     * You can find more information on how profiles work with JHipster on <a href="http://jhipster.github.io/profiles/">http://jhipster.github.io/profiles/</a>.
     */
    @PostConstruct
    public void initApplication() {
        Collection<String> activeProfiles = Arrays.asList(env.getActiveProfiles());
        if (activeProfiles.contains(JHipsterConstants.SPRING_PROFILE_DEVELOPMENT) && activeProfiles.contains(JHipsterConstants.SPRING_PROFILE_PRODUCTION)) {
            log.error("You have misconfigured your application! It should not run " +
                "with both the 'dev' and 'prod' profiles at the same time.");
        }
        if (activeProfiles.contains(JHipsterConstants.SPRING_PROFILE_DEVELOPMENT) && activeProfiles.contains(JHipsterConstants.SPRING_PROFILE_CLOUD)) {
            log.error("You have misconfigured your application! It should not" +
                "run with both the 'dev' and 'cloud' profiles at the same time.");
        }
    }

    /**
     * Main method, used to run the application.
     *
     * @param args the command line arguments
     * @throws UnknownHostException if the local host name could not be resolved into an address
     */
    public static void main(String[] args) throws UnknownHostException {
        SpringApplication app = new SpringApplication(<%= mainClass %>.class);
        DefaultProfileUtil.addDefaultProfile(app);
        Environment env = app.run(args).getEnvironment();
        String protocol = "http";
        if (env.getProperty("server.ssl.key-store") != null) {
            protocol = "https";
        }
        log.info("\n----------------------------------------------------------\n\t" +
                "Application '{}' is running! Access URLs:\n\t" +
                "Local: \t\t{}://localhost:{}\n\t" +
                "External: \t{}://{}:{}\n\t" +
                "Profile(s): \t{}\n----------------------------------------------------------",
            env.getProperty("spring.application.name"),
            protocol,
            env.getProperty("server.port"),
            protocol,
            InetAddress.getLocalHost().getHostAddress(),
            env.getProperty("server.port"),
            env.getActiveProfiles());
        <%_ if (serviceDiscoveryType && (applicationType == 'microservice' || applicationType == 'gateway' || applicationType == 'uaa')) { _%>

        String configServerStatus = env.getProperty("configserver.status");
        log.info("\n----------------------------------------------------------\n\t" +
                "Config Server: \t{}\n----------------------------------------------------------",
            configServerStatus == null ? "Not found or not setup for this application" : configServerStatus);
        <%_ } _%>
    }
}
