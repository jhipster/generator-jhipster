package <%=packageName%>;

import <%=packageName%>.config.BuildProperties;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.boot.builder.SpringApplicationBuilder;
import org.springframework.boot.context.web.SpringBootServletInitializer;

/**
 * This is a helper Java class that provides an alternative to creating a web.xml.
 */
public class ApplicationWebXml extends SpringBootServletInitializer {

    private final Logger log = LoggerFactory.getLogger(ApplicationWebXml.class);

    @Override
    protected SpringApplicationBuilder configure(SpringApplicationBuilder application) {
        return application.profiles(getDefaultProfiles())
            .sources(<%= mainClass %>.class);
    }

    /**
     * Set default profile(s) if none have been set. The default is provided by Maven/Gradle, or "dev" otherwise.
     * <p>
     * Spring profiles can be configured with a System property; -Dspring.profiles.active=your,active,profiles
     * </p>
     */
    private String[] getDefaultProfiles() {
        String profiles = System.getProperty("spring.profiles.active");
        if (profiles != null) {
            log.info("Running with Spring profile(s) : {}", profiles);
            return profiles.split("\\s*,\\s*");
        }

        log.warn("No Spring profile configured, running with default configuration");
        return BuildProperties.getDefaultProfiles();
    }
}
