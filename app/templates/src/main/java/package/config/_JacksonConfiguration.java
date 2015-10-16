package <%=packageName%>.config;

import <%=packageName%>.domain.util.*;
<% if (databaseType != 'cassandra') { %>
import com.fasterxml.jackson.databind.SerializationFeature;<% } %>
import com.fasterxml.jackson.datatype.jsr310.JavaTimeModule;
import java.time.*;
import org.springframework.http.converter.json.Jackson2ObjectMapperBuilder;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

@Configuration
public class JacksonConfiguration {

    @Bean
    Jackson2ObjectMapperBuilder jackson2ObjectMapperBuilder() {
        JavaTimeModule module = new JavaTimeModule();
        module.addSerializer(OffsetDateTime.class, JSR310DateTimeSerializer.INSTANCE);
        module.addSerializer(ZonedDateTime.class, JSR310DateTimeSerializer.INSTANCE);
        module.addSerializer(LocalDateTime.class, JSR310DateTimeSerializer.INSTANCE);
        module.addSerializer(Instant.class, JSR310DateTimeSerializer.INSTANCE);
        module.addDeserializer(LocalDate.class, JSR310LocalDateDeserializer.INSTANCE);
        return new Jackson2ObjectMapperBuilder()<% if (databaseType != 'cassandra') { %>
                .featuresToDisable(SerializationFeature.WRITE_DATES_AS_TIMESTAMPS)<% } %>
                .findModulesViaServiceLoader(true)
                .modulesToInstall(module);
    }
}
