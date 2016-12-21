<% for (idx in fields) {
    var fieldType = fields[idx].fieldType;
    if (fields[idx].fieldIsEnum) { _%>
import { <%= fieldType %> } from "./<%= fieldType %>";
    <%_ } _%>
<%_ }
if (dto == "no") {%>
<%- include('model-class-import-template.ejs'); -%>
<%_ }

var variables = [];
var tsKeyType;
if (pkType == 'String') {
    tsKeyType = 'string';
} else {
    tsKeyType = 'number';
}
variables.push('id?: ' + tsKeyType);
for (idx in fields) {
    var fieldType = fields[idx].fieldType;
    var fieldName = fields[idx].fieldName;
    var tsType;
    if (fields[idx].fieldIsEnum) {
        tsType = fieldType;
    } else if (fieldType == 'ZonedDateTime' || fieldType == 'LocalDate') {
        tsType = 'Date';
    } else if (fieldType == 'Boolean') {
        tsType = 'Boolean';
    } else if (fieldType == 'Double' || fieldType == 'Float' || fieldType == 'Long' || fieldType == 'Integer' || fieldType == 'BigDecimal') {
        tsType = 'number';
    } else if (fieldType == 'String'  || fieldType == 'UUID') {
        tsType = 'string';
    } else { //(fieldType === 'byte[]' || fieldType === 'ByteBuffer') && fieldTypeBlobContent == 'any' || (fieldType === 'byte[]' || fieldType === 'ByteBuffer') && fieldTypeBlobContent == 'image'
        tsType = 'any';
    }
    variables.push(fieldName + '?: ' + tsType);
}
for (idx in relationships) {
    var fieldType;
    var fieldName;
    if (dto == "no") {
        fieldType = relationships[idx].otherEntityNameCapitalized;
        fieldName = relationships[idx].relationshipFieldName;
    } else {
        fieldType = tsKeyType;
        fieldName = relationships[idx].relationshipFieldName + "Id";
    }
    variables.push(fieldName + '?: ' + fieldType);
}_%>
export class <%= entityClass %> {
    constructor(<% for (idx in variables) { %>
        public <%- variables[idx] %>,<% } %>
) { }
}
