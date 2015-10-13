package <%=packageName%>.domain.util;

import java.io.IOException;

import java.time.ZonedDateTime;
import java.time.format.DateTimeFormatter;

import com.fasterxml.jackson.core.JsonGenerator;
import com.fasterxml.jackson.databind.JsonSerializer;
import com.fasterxml.jackson.databind.SerializerProvider;

/**
 * Custom Jackson serializer for displaying Java ZonedDateTime objects.
 */
public class CustomDateTimeSerializer extends JsonSerializer<ZonedDateTime> {

    private static DateTimeFormatter formatter = DateTimeFormatter.ISO_ZONED_DATE_TIME;

    @Override
    public void serialize(ZonedDateTime value, JsonGenerator generator,
                          SerializerProvider serializerProvider)
            throws IOException {
        generator.writeString(formatter.format(value));
    }
}
