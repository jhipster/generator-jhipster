package com.okta.developer.notification.config;

import java.util.List;
import org.springdoc.core.customizers.ServerBaseUrlCustomizer;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

@Configuration
public class SpringDocConfiguration {

    @Bean
    public ServerBaseUrlCustomizer serverBaseUrlRequestCustomizer() {
        return (serverBaseUrl, request) -> {
            List<String> forwardedPrefix = request.getHeaders().get("X-Forwarded-Prefix");
            if (forwardedPrefix != null && forwardedPrefix.size() > 0) {
                return forwardedPrefix.get(0);
            }
            return serverBaseUrl;
        };
    }
}
