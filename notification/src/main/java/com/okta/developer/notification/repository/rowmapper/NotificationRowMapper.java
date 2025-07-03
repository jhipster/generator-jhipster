package com.okta.developer.notification.repository.rowmapper;

import com.okta.developer.notification.domain.NotificationEntity;
import io.r2dbc.spi.Row;
import java.util.function.BiFunction;
import org.springframework.stereotype.Service;

/**
 * Converter between {@link Row} to {@link NotificationEntity}, with proper type conversions.
 */
@Service
public class NotificationRowMapper implements BiFunction<Row, String, NotificationEntity> {

    private final ColumnConverter converter;

    public NotificationRowMapper(ColumnConverter converter) {
        this.converter = converter;
    }

    /**
     * Take a {@link Row} and a column prefix, and extract all the fields.
     * @return the {@link NotificationEntity} stored in the database.
     */
    @Override
    public NotificationEntity apply(Row row, String prefix) {
        NotificationEntity entity = new NotificationEntity();
        entity.setId(converter.fromRow(row, prefix + "_id", Long.class));
        entity.setTitle(converter.fromRow(row, prefix + "_title", String.class));
        return entity;
    }
}
