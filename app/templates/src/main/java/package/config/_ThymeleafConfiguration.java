package <%=packageName%>.config;

import org.springframework.context.annotation.Configuration;
import org.springframework.core.env.Environment;
import org.thymeleaf.spring4.view.ThymeleafViewResolver;

import javax.annotation.PostConstruct;
import javax.inject.Inject;

@Configuration
public class ThymeleafConfiguration {

    public static final String DEFAULT_PREFIX = "classpath:/templates/";
    public static final String DEFAULT_SUFFIX = ".html";

    @Inject
    private ThymeleafViewResolver thymeleafViewResolver;

    @Inject
    private Environment env;

    @PostConstruct
    private void init() {
        thymeleafViewResolver.setViewNames(new String[]{"error", "/tl/*"});
    }
}
