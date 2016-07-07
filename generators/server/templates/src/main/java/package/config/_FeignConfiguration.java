package <%=packageName%>.config;

import feign.RequestInterceptor;
import org.springframework.cloud.netflix.feign.EnableFeignClients;
import org.springframework.cloud.security.oauth2.client.feign.OAuth2FeignRequestInterceptor;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.context.annotation.Profile;
import org.springframework.security.oauth2.client.DefaultOAuth2ClientContext;

import javax.inject.Inject;
import java.io.IOException;

@Configuration
@Profile("!test")
@EnableFeignClients(basePackages = "<%=packageName%>.client")
public class FeignConfiguration {

    @Inject
    LoadBalancedResourceDetails loadBalancedResourceDetails;

    @Bean
    public RequestInterceptor getOAuth2RequestInterceptor() throws IOException {
        return new OAuth2FeignRequestInterceptor(new DefaultOAuth2ClientContext(), loadBalancedResourceDetails);
    }
}
