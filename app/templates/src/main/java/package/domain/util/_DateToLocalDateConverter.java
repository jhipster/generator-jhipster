package <%=packageName%>.domain.util;

import org.springframework.core.convert.converter.Converter;

import java.time.*;
import java.util.Date;

public class DateToLocalDateConverter implements Converter<Date, LocalDate> {

    @Override
    public LocalDate convert(Date source) {
        return source == null ? null : ZonedDateTime.ofInstant(source.toInstant(), ZoneId.systemDefault()).toLocalDate();
    }
}
