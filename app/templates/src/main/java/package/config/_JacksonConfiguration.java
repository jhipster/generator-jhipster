package <%=packageName%>.config;

import com.fasterxml.jackson.datatype.jsr310.JSR310Module;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

@Configuration
public class JacksonConfiguration {

    @Bean
    public JSR310Module jacksonJSR310Module() {
        return new JSR310Module();
    }
}
