package <%=packageName%>.client;

import <%=packageName%>.config.ApplicationProperties;
import feign.RequestInterceptor;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.cloud.client.loadbalancer.LoadBalancerClient;
import org.springframework.cloud.security.oauth2.client.feign.OAuth2FeignRequestInterceptor;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.oauth2.client.DefaultOAuth2ClientContext;

import java.io.IOException;

@Configuration
public class OAuth2InterceptedFeignConfiguration {

    private final ApplicationProperties applicationProperties;

    private LoadBalancerClient loadBalancerClient;

    public OAuth2InterceptedFeignConfiguration(ApplicationProperties applicationProperties) {
        this.applicationProperties = applicationProperties;
    }

    @Bean(name = "oauth2RequestInterceptor")
    public RequestInterceptor getOAuth2RequestInterceptor() throws IOException {
        if (loadBalancerClient != null) {
            applicationProperties.getSecurity().getClientAuthorization().setLoadBalancerClient(loadBalancerClient);
        }
        return new OAuth2FeignRequestInterceptor(
            new DefaultOAuth2ClientContext(), applicationProperties.getSecurity().getClientAuthorization()
        );
    }

    @Autowired(required = false)
    public void setLoadBalancerClient(LoadBalancerClient loadBalancerClient) {
        this.loadBalancerClient = loadBalancerClient;
    }
}
