package com.okta.developer.notification.config;

import com.fasterxml.jackson.core.JsonGenerator;
import com.fasterxml.jackson.databind.JsonSerializer;
import com.fasterxml.jackson.databind.SerializerProvider;
import com.fasterxml.jackson.datatype.jdk8.Jdk8Module;
import com.fasterxml.jackson.datatype.jsr310.JavaTimeModule;
import java.io.IOException;
import java.time.LocalTime;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

@Configuration
public class JacksonConfiguration {

    /**
     * Support for Java date and time API.
     * @return the corresponding Jackson module.
     */
    @Bean
    public JavaTimeModule javaTimeModule() {
        final JavaTimeModule javaTime = new JavaTimeModule();
        javaTime.addSerializer(
            LocalTime.class,
            new JsonSerializer<LocalTime>() {
                @Override
                public void serialize(LocalTime value, JsonGenerator gen, SerializerProvider serializers) throws IOException {
                    gen.writeString(value.toString());
                }
            }
        );
        return javaTime;
    }

    @Bean
    public Jdk8Module jdk8TimeModule() {
        return new Jdk8Module();
    }
}
