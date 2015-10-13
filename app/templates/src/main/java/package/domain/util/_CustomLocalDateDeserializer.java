package <%=packageName%>.domain.util;

import com.fasterxml.jackson.core.JsonParser;
import com.fasterxml.jackson.core.JsonToken;
import com.fasterxml.jackson.databind.DeserializationContext;
import com.fasterxml.jackson.databind.JsonDeserializer;

import java.io.IOException;
import java.time.*;
import java.time.format.DateTimeFormatter;

/**
 * ISO 8601 date format
 * Jackson deserializer for displaying Java LocalDate objects.
 */
public class CustomLocalDateDeserializer extends JsonDeserializer<LocalDate> {

    private static DateTimeFormatter formatter = DateTimeFormatter.ISO_LOCAL_DATE;

    @Override
    public LocalDate deserialize(JsonParser jp, DeserializationContext ctxt)
        throws IOException {
        JsonToken t = jp.getCurrentToken();
        if (t == JsonToken.VALUE_STRING) {
            String str = jp.getText().trim();
            return LocalDate.from(formatter.parse(str));
        }
        if (t == JsonToken.VALUE_NUMBER_INT) {
            return Instant.ofEpochMilli(jp.getLongValue()).atZone(ZoneId.systemDefault()).toLocalDate();
        }
        throw ctxt.mappingException(handledType());
    }
}
