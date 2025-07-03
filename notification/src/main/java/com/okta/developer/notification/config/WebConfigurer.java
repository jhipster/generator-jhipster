package com.okta.developer.notification.config;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.okta.developer.notification.web.rest.errors.ExceptionTranslator;
import java.util.concurrent.TimeUnit;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.boot.autoconfigure.web.reactive.ResourceHandlerRegistrationCustomizer;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.context.annotation.Profile;
import org.springframework.core.annotation.Order;
import org.springframework.data.web.ReactivePageableHandlerMethodArgumentResolver;
import org.springframework.data.web.ReactiveSortHandlerMethodArgumentResolver;
import org.springframework.util.CollectionUtils;
import org.springframework.web.cors.CorsConfiguration;
import org.springframework.web.cors.reactive.CorsConfigurationSource;
import org.springframework.web.cors.reactive.UrlBasedCorsConfigurationSource;
import org.springframework.web.reactive.config.WebFluxConfigurer;
import org.springframework.web.reactive.result.method.HandlerMethodArgumentResolver;
import org.springframework.web.server.WebExceptionHandler;
import tech.jhipster.config.JHipsterConstants;
import tech.jhipster.config.JHipsterProperties;
import tech.jhipster.web.filter.reactive.CachingHttpHeadersFilter;
import tech.jhipster.web.rest.errors.ReactiveWebExceptionHandler;

/**
 * Configuration of web application with Servlet 3.0 APIs.
 */
@Configuration
public class WebConfigurer implements WebFluxConfigurer {

    private static final Logger LOG = LoggerFactory.getLogger(WebConfigurer.class);

    private final JHipsterProperties jHipsterProperties;

    public WebConfigurer(JHipsterProperties jHipsterProperties) {
        this.jHipsterProperties = jHipsterProperties;
    }

    @Bean
    public CorsConfigurationSource corsConfigurationSource() {
        UrlBasedCorsConfigurationSource source = new UrlBasedCorsConfigurationSource();
        CorsConfiguration config = jHipsterProperties.getCors();
        if (!CollectionUtils.isEmpty(config.getAllowedOrigins()) || !CollectionUtils.isEmpty(config.getAllowedOriginPatterns())) {
            LOG.debug("Registering CORS filter");
            source.registerCorsConfiguration("/api/**", config);
            source.registerCorsConfiguration("/management/**", config);
            source.registerCorsConfiguration("/v3/api-docs", config);
            source.registerCorsConfiguration("/swagger-ui/**", config);
        }
        return source;
    }

    // TODO: remove when this is supported in spring-boot
    @Bean
    HandlerMethodArgumentResolver reactivePageableHandlerMethodArgumentResolver() {
        return new ReactivePageableHandlerMethodArgumentResolver();
    }

    // TODO: remove when this is supported in spring-boot
    @Bean
    HandlerMethodArgumentResolver reactiveSortHandlerMethodArgumentResolver() {
        return new ReactiveSortHandlerMethodArgumentResolver();
    }

    @Bean
    @Order(-2) // The handler must have precedence over WebFluxResponseStatusExceptionHandler and Spring Boot's ErrorWebExceptionHandler
    public WebExceptionHandler problemExceptionHandler(ObjectMapper mapper, ExceptionTranslator problemHandling) {
        return new ReactiveWebExceptionHandler(problemHandling, mapper);
    }

    @Bean
    ResourceHandlerRegistrationCustomizer registrationCustomizer() {
        // Disable built-in cache control to use our custom filter instead
        return registration -> registration.setCacheControl(null);
    }

    @Bean
    @Profile(JHipsterConstants.SPRING_PROFILE_PRODUCTION)
    public CachingHttpHeadersFilter cachingHttpHeadersFilter() {
        // Use a cache filter that only match selected paths
        return new CachingHttpHeadersFilter(TimeUnit.DAYS.toMillis(jHipsterProperties.getHttp().getCache().getTimeToLiveInDays()));
    }
}
