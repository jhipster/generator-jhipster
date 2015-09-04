package <%=packageName%>.config;
<% if (javaVersion != '7') { %>
import <%=packageName%>.domain.util.JSR310DateTimeSerializer;
import <%=packageName%>.domain.util.JSR310LocalDateDeserializer;
import com.fasterxml.jackson.databind.SerializationFeature;
import com.fasterxml.jackson.datatype.jsr310.JSR310Module;
import org.springframework.http.converter.json.Jackson2ObjectMapperBuilder;
import java.time.Instant;
import java.time.LocalDateTime;
import java.time.OffsetDateTime;
import java.time.ZonedDateTime;
<% } %>
import <%=packageName%>.domain.util.CustomDateTimeDeserializer;
import <%=packageName%>.domain.util.CustomDateTimeSerializer;
import <%=packageName%>.domain.util.CustomLocalDateSerializer;
import <%=packageName%>.domain.util.ISO8601LocalDateDeserializer;
import com.fasterxml.jackson.datatype.joda.JodaModule;
import org.joda.time.DateTime;
import org.joda.time.LocalDate;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

@Configuration
public class JacksonConfiguration {

    @Bean
    public JodaModule jacksonJodaModule() {
        JodaModule module = new JodaModule();
        module.addSerializer(DateTime.class, new CustomDateTimeSerializer());
        module.addDeserializer(DateTime.class, new CustomDateTimeDeserializer());
        module.addSerializer(LocalDate.class, new CustomLocalDateSerializer());
        module.addDeserializer(LocalDate.class, new ISO8601LocalDateDeserializer());
        return module;
    }<% if (javaVersion != '7') { %>

    @Bean
    public JSR310Module jsr310Module() {
        JSR310Module module = new JSR310Module();
        module.addSerializer(OffsetDateTime.class, JSR310DateTimeSerializer.INSTANCE);
        module.addSerializer(ZonedDateTime.class, JSR310DateTimeSerializer.INSTANCE);
        module.addSerializer(LocalDateTime.class, JSR310DateTimeSerializer.INSTANCE);
        module.addSerializer(Instant.class, JSR310DateTimeSerializer.INSTANCE);
        module.addDeserializer(java.time.LocalDate.class, JSR310LocalDateDeserializer.INSTANCE);
        return module;
    }

    @Bean Jackson2ObjectMapperBuilder jackson2ObjectMapperBuilder() {
        Jackson2ObjectMapperBuilder builder = new Jackson2ObjectMapperBuilder();
        builder.featuresToDisable(SerializationFeature.WRITE_DATES_AS_TIMESTAMPS);
        return builder;
    }<% } %>

}

