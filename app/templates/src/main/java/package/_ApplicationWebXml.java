package <%=packageName%>;

import org.springframework.boot.builder.SpringApplicationBuilder;
import org.springframework.boot.web.SpringBootServletInitializer;

/**
 * This is an helper Java class that provides an alternative to creating a web.xml
 */
public class ApplicationWebXml extends SpringBootServletInitializer {

    @Override
    protected SpringApplicationBuilder configure(SpringApplicationBuilder application) {
        application.sources(Application.class);
        return application.main(Application.class);
    }
}
