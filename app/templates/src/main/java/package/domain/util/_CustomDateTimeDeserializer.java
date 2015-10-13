package <%=packageName%>.domain.util;

import com.fasterxml.jackson.core.JsonParser;
import com.fasterxml.jackson.core.JsonToken;
import com.fasterxml.jackson.databind.DeserializationContext;
import com.fasterxml.jackson.databind.JsonDeserializer;

import java.io.IOException;
import java.time.*;
import java.time.format.DateTimeFormatter;

/**
 * Custom Jackson deserializer for displaying Java ZonedDateTime objects.
 */
public class CustomDateTimeDeserializer extends JsonDeserializer<ZonedDateTime> {

    private static DateTimeFormatter formatter = DateTimeFormatter.ISO_ZONED_DATE_TIME;

    @Override
    public ZonedDateTime deserialize(JsonParser jp, DeserializationContext ctxt)
            throws IOException {
        JsonToken t = jp.getCurrentToken();
        if (t == JsonToken.VALUE_STRING) {
            String str = jp.getText().trim();
            return ZonedDateTime.from(formatter.parse(str));
        }
        if (t == JsonToken.VALUE_NUMBER_INT) {
            return Instant.ofEpochMilli(jp.getLongValue()).atZone(ZoneId.systemDefault());
        }
        throw ctxt.mappingException(handledType());
    }
}
