package <%=packageName%>.config;

import org.springframework.cloud.netflix.feign.EnableFeignClients;
import org.springframework.context.annotation.Configuration;

@Configuration
@EnableFeignClients(basePackages = "<%=packageName%>")
public class FeignConfiguration {

}
