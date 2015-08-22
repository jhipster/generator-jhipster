package <%=packageName%>.config;

import org.springframework.context.annotation.Configuration;
import org.springframework.web.servlet.config.annotation.ContentNegotiationConfigurer;
import org.springframework.web.servlet.config.annotation.WebMvcConfigurerAdapter;

/**
 * Configures the REST endpoints content negotation and supported media types.
 */
@Configuration
public class ContentNegotiationConfiguration extends WebMvcConfigurerAdapter {

    @Override
    public void configureContentNegotiation(ContentNegotiationConfigurer configurer) {
        configurer.defaultContentType(ApplicationMediaType.APPLICATION_JSON);
    }
}
