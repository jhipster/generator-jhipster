package <%=packageName%>.web.rest;
<% if (javaVersion != '7') { %>
import java.time.Instant;
import java.time.LocalDateTime;
import java.time.OffsetDateTime;
import java.time.ZonedDateTime;
import <%=packageName%>.domain.util.JSR310DateTimeSerializer;
import <%=packageName%>.domain.util.JSR310LocalDateDeserializer;
import com.fasterxml.jackson.datatype.jsr310.JSR310Module;
<% } %>
import java.io.IOException;
import java.nio.charset.Charset;

import org.joda.time.DateTime;
import org.joda.time.LocalDate;
import org.springframework.http.MediaType;

import com.fasterxml.jackson.annotation.JsonInclude;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.datatype.joda.JodaModule;
import <%=packageName%>.domain.util.CustomDateTimeSerializer;
import <%=packageName%>.domain.util.CustomLocalDateSerializer;

/**
 * Utility class for testing REST controllers.
 */
public class TestUtil {

    /** MediaType for JSON UTF8 */
    public static final MediaType APPLICATION_JSON_UTF8 = new MediaType(
            MediaType.APPLICATION_JSON.getType(),
            MediaType.APPLICATION_JSON.getSubtype(), Charset.forName("utf8"));

    /**
     * Convert an object to JSON byte array.
     *
     * @param object the object to convert
     * @return the JSON byte array
     * @throws IOException
     */
    public static byte[] convertObjectToJsonBytes(Object object)
            throws IOException {
        ObjectMapper mapper = new ObjectMapper();
        mapper.setSerializationInclusion(JsonInclude.Include.NON_NULL);
        JodaModule module = new JodaModule();
        module.addSerializer(DateTime.class, new CustomDateTimeSerializer());
        module.addSerializer(LocalDate.class, new CustomLocalDateSerializer());
        mapper.registerModule(module);<% if (javaVersion != '7') { %>

        JSR310Module jsr310Module = new JSR310Module();
        jsr310Module.addSerializer(OffsetDateTime.class, JSR310DateTimeSerializer.INSTANCE);
        jsr310Module.addSerializer(ZonedDateTime.class, JSR310DateTimeSerializer.INSTANCE);
        jsr310Module.addSerializer(LocalDateTime.class, JSR310DateTimeSerializer.INSTANCE);
        jsr310Module.addSerializer(Instant.class, JSR310DateTimeSerializer.INSTANCE);
        jsr310Module.addDeserializer(java.time.LocalDate.class, JSR310LocalDateDeserializer.INSTANCE);
        mapper.registerModule(jsr310Module);
<% } %>
        return mapper.writeValueAsBytes(object);
    }

    /**
     * Create a byte array with a specific size filled with specified data.
     *
     * @param size the size of the byte array
     * @param data the data to put in the byte array
     */
    public static byte[] createByteArray(int size, String data) {
        byte[] byteArray = new byte[size];
        for (int i = 0; i < size; i++) {
            byteArray[i] = Byte.parseByte(data, 2);
        }
        return byteArray;
    }
}
