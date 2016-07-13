package <%=packageName%>.config;

import <%=packageName%>.domain.util.*;
import com.fasterxml.jackson.databind.SerializationFeature;
import com.fasterxml.jackson.datatype.jsr310.JavaTimeModule;
import org.springframework.http.converter.json.Jackson2ObjectMapperBuilder;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import com.fasterxml.jackson.datatype.jsr310.JavaTimeModule;
import org.springframework.core.env.Environment;

import javax.inject.Inject;
import java.time.*;
import java.util.Arrays;

@Configuration
public class JacksonConfiguration {

    @Inject
    Environment env;

    @Bean
    Jackson2ObjectMapperBuilder jackson2ObjectMapperBuilder() {
        JavaTimeModule module = new JavaTimeModule();
        module.addSerializer(OffsetDateTime.class, JSR310DateTimeSerializer.INSTANCE);
        module.addSerializer(ZonedDateTime.class, JSR310DateTimeSerializer.INSTANCE);
        module.addSerializer(LocalDateTime.class, JSR310DateTimeSerializer.INSTANCE);
        module.addSerializer(Instant.class, JSR310DateTimeSerializer.INSTANCE);
        module.addDeserializer(LocalDate.class, JSR310LocalDateDeserializer.INSTANCE);
        Jackson2ObjectMapperBuilder objectMapperBuilder = new Jackson2ObjectMapperBuilder()
            .featuresToDisable(SerializationFeature.WRITE_DATES_AS_TIMESTAMPS)
            .findModulesViaServiceLoader(true)
            .modulesToInstall(module);

        // Pretty print JSON in dev profile
        if(Arrays.asList(env.getActiveProfiles()).contains(Constants.SPRING_PROFILE_DEVELOPMENT)) {
            objectMapperBuilder.featuresToEnable(SerializationFeature.INDENT_OUTPUT);
        }

        return objectMapperBuilder;
    }
}
