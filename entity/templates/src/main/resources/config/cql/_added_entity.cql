
CREATE TABLE IF NOT EXISTS <%= entityInstance %> (
    id uuid,<% for (fieldId in fields) { %><% if (fields[fieldId].fieldType == 'UUID') { %>
    <%= fields[fieldId].fieldName %> uuid,<% } else if (fields[fieldId].fieldType == 'String') { %>
    <%= fields[fieldId].fieldName %> text,<% } else if (fields[fieldId].fieldType == 'Integer') { %>
    <%= fields[fieldId].fieldName %> int,<% } else if (fields[fieldId].fieldType == 'Long') { %>
    <%= fields[fieldId].fieldName %> bigint,<% } else if (fields[fieldId].fieldType == 'Float') { %>
    <%= fields[fieldId].fieldName %> float,<% } else if (fields[fieldId].fieldType == 'Double') { %>
    <%= fields[fieldId].fieldName %> double,<% } else if (fields[fieldId].fieldType == 'BigDecimal') { %>
    <%= fields[fieldId].fieldName %> decimal,<% } else if (fields[fieldId].fieldType == 'Date') { %>
    <%= fields[fieldId].fieldName %> timestamp,<% } else if (fields[fieldId].fieldType == 'Boolean') { %>
    <%= fields[fieldId].fieldName %> boolean,<% } } %>
    PRIMARY KEY(id)
);
