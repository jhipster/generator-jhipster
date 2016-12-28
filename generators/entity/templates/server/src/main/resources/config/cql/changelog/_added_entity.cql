
CREATE TABLE IF NOT EXISTS <%= entityInstance %> (
    id uuid,<% for (idx in fields) {
        var fieldType = fields[idx].fieldType;
        var fieldName = fields[idx].fieldName;
        var fieldNameUnderscored = fields[idx].fieldNameUnderscored;
        var fieldTypeBlobContent = fields[idx].fieldTypeBlobContent;
        if (fieldType == 'UUID') { %>
    <%= fieldName %> uuid,<% } else if (fieldType == 'String') { %>
    <%= fieldName %> text,<% } else if (fieldType == 'Integer') { %>
    <%= fieldName %> int,<% } else if (fieldType == 'Long') { %>
    <%= fieldName %> bigint,<% } else if (fieldType == 'Float') { %>
    <%= fieldName %> float,<% } else if (fieldType == 'Double') { %>
    <%= fieldName %> double,<% } else if (fieldType == 'BigDecimal') { %>
    <%= fieldName %> decimal,<% } else if (fieldType == 'LocalDate') { %>
    <%= fieldName %> date,<% } else if (fieldType == 'ZonedDateTime') { %>
    <%= fieldName %> timestamp,<% } else if (fieldType == 'Boolean') { %>
    <%= fieldName %> boolean,<% } else if (fieldType === 'ByteBuffer') { %>
    <%= fieldName %> blob,<% if (fieldTypeBlobContent !== 'text') { %>
    <%= fieldNameUnderscored %>_content_type text,<% } } } %>
    PRIMARY KEY(id)
);
