package <%=packageName%>.client;

import com.mycompany.myapp.config.LoadBalancedResourceDetails;
import feign.RequestInterceptor;
import org.springframework.cloud.security.oauth2.client.feign.OAuth2FeignRequestInterceptor;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.oauth2.client.DefaultOAuth2ClientContext;

import javax.inject.Inject;
import java.io.IOException;

/**
 * Created by on 07.07.16.
 *
 * @author David Steiman
 */
@Configuration
public class OAuth2InterceptedFeignConfiguration {
    @Inject
    LoadBalancedResourceDetails loadBalancedResourceDetails;

    @Bean
    public RequestInterceptor getOAuth2RequestInterceptor() throws IOException {
        return new OAuth2FeignRequestInterceptor(new DefaultOAuth2ClientContext(), loadBalancedResourceDetails);
    }
}
