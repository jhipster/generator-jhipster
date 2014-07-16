package <%=packageName%>.config.apidoc;

import com.mangofactory.swagger.configuration.SpringSwaggerConfig;
import com.mangofactory.swagger.plugin.EnableSwagger;
import com.mangofactory.swagger.plugin.SwaggerSpringMvcPlugin;
import com.wordnik.swagger.model.ApiInfo;
import org.springframework.boot.bind.RelaxedPropertyResolver;
import org.springframework.context.EnvironmentAware;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.core.env.Environment;

@Configuration
@EnableSwagger
public class SwaggerConfiguration implements EnvironmentAware {
    public static final String DEFAULT_INCLUDE_PATTERN = "/app/rest/.*";

    private RelaxedPropertyResolver propertyResolver;

    @Override
    public void setEnvironment(Environment environment) {
        this.propertyResolver = new RelaxedPropertyResolver(environment, "swagger.");
    }

    /**
     * Swagger Spring MVC configuration
     */
    @Bean
    public SwaggerSpringMvcPlugin swaggerSpringMvcPlugin(SpringSwaggerConfig springSwaggerConfig) {
        return new SwaggerSpringMvcPlugin(springSwaggerConfig)
                .apiInfo(apiInfo())
                .includePatterns(DEFAULT_INCLUDE_PATTERN);
    }

    /**
     * API Info as it appears on the swagger-ui page
     */
    private ApiInfo apiInfo() {
        return new ApiInfo(
                propertyResolver.getProperty("title"),
                propertyResolver.getProperty("description"),
                propertyResolver.getProperty("termsOfServiceUrl"),
                propertyResolver.getProperty("contact"),
                propertyResolver.getProperty("license"),
                propertyResolver.getProperty("licenseUrl"));
    }
}
