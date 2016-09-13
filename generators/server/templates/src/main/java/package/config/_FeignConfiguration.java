package <%=packageName%>.config;

import org.springframework.cloud.netflix.feign.EnableFeignClients;
import org.springframework.context.annotation.Configuration;
import org.springframework.context.annotation.Profile;

@Configuration
@Profile("!test")
@EnableFeignClients(basePackages = "<%=packageName%>")
public class FeignConfiguration {

}
