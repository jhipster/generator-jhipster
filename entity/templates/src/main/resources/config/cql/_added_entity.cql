
CREATE TABLE IF NOT EXISTS <%= entityInstance %> (
    id uuid,<% for (fieldId in fields) { %><% if (fields[fieldId].fieldType == 'UUID') { %>
    uuid <%= fields[fieldId].fieldName %>,<% } else if (fields[fieldId].fieldType == 'TimeUUID') { %>
    timeuuid <%= fields[fieldId].fieldName %>,<% } else if (fields[fieldId].fieldType == 'String') { %>
    text <%= fields[fieldId].fieldName %>,<% } else if (fields[fieldId].fieldType == 'Integer') { %>
    int <%= fields[fieldId].fieldName %>,<% } else if (fields[fieldId].fieldType == 'Long') { %>
    bigint <%= fields[fieldId].fieldName %>,<% } else if (fields[fieldId].fieldType == 'BigDecimal') { %>
    decimal <%= fields[fieldId].fieldName %>,<% } else if (fields[fieldId].fieldType == 'Date') { %>
    timestamp <%= fields[fieldId].fieldName %>,<% } else if (fields[fieldId].fieldType == 'Boolean') { %>
    boolean <%= fields[fieldId].fieldName %>,<% } } %>
    PRIMARY KEY(id)
);
