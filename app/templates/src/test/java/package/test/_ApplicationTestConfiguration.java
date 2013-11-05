package <%=packageName%>.test;

import <%=packageName%>.conf.AsyncConfiguration;
import <%=packageName%>.conf.CacheConfiguration;
import <%=packageName%>.conf.MetricsConfiguration;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.context.annotation.*;
import org.springframework.core.env.Environment;

import javax.annotation.PostConstruct;
import javax.inject.Inject;
import java.io.IOException;

@Configuration
@PropertySource({"classpath:/META-INF/<%= baseName %>/<%= baseName %>.properties"})
@ComponentScan(basePackages = {
        "com.mycompany.service"})
@Import(value = {
        AsyncConfiguration.class,
        CacheConfiguration.class,
        MetricsConfiguration.class})
@ImportResource("classpath:/META-INF/spring/applicationContext-*.xml")
public class ApplicationTestConfiguration {

    private static final Logger log = LoggerFactory.getLogger(ApplicationTestConfiguration.class);

    @Inject
    private Environment env;

    /**
     * Initializes <%= baseName %> test context.
     * <p/>
     * Spring profiles can be configured with a system property -Dspring.profiles.active=your-active-profile
     * <p/>
     */
    @PostConstruct
    public void initApplication() throws IOException {
        log.debug("Looking for Spring profiles...");
        if (env.getActiveProfiles().length == 0) {
            log.debug("No Spring profile configured, running with default configuration");
        } else {
            for (String profile : env.getActiveProfiles()) {
                log.debug("Detected Spring profile : {}", profile);
            }
        }
    }
}
