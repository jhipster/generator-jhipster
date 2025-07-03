package com.okta.developer.gateway.repository.rowmapper;

import com.okta.developer.gateway.domain.UserData;
import io.r2dbc.spi.Row;
import java.util.function.BiFunction;
import org.springframework.stereotype.Service;

/**
 * Converter between {@link Row} to {@link UserData}, with proper type conversions.
 */
@Service
public class UserDataRowMapper implements BiFunction<Row, String, UserData> {

    private final ColumnConverter converter;

    public UserDataRowMapper(ColumnConverter converter) {
        this.converter = converter;
    }

    /**
     * Take a {@link Row} and a column prefix, and extract all the fields.
     * @return the {@link UserData} stored in the database.
     */
    @Override
    public UserData apply(Row row, String prefix) {
        UserData entity = new UserData();
        entity.setId(converter.fromRow(row, prefix + "_id", Long.class));
        entity.setAddress(converter.fromRow(row, prefix + "_address", String.class));
        return entity;
    }
}
