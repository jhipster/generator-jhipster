<% var enumsAlreadyDeclared = [];
    for (idx in fields) {
    if (fields[idx].fieldIsEnum && enumsAlreadyDeclared.indexOf(fields[idx].fieldType) === -1) {
        enumsAlreadyDeclared.push(fields[idx].fieldType); %>
const enum <%= fields[idx].fieldType %> {<%
        const enums = fields[idx].fieldValues.split(',');
        for (var i = 0; i < enums.length; i++) { %>
    '<%= enums[i] %>'<%if (i < enums.length - 1) { %>,<% } } %>

};
<%_ } } _%>
<%_ if (dto == "no") {
       for (var rel of differentRelationships) { _%>
import { <%= rel.otherEntityNameCapitalized %> } from '../<%= rel.otherEntityModulePath %>';
<%_ }
}
var variables = {};
var defaultVariablesValues = {};
var tsKeyType;
if (pkType == 'String') {
    tsKeyType = 'string';
} else {
    tsKeyType = 'number';
}
variables['id'] = 'id?: ' + tsKeyType;
for (idx in fields) {
    var fieldType = fields[idx].fieldType;
    var fieldName = fields[idx].fieldName;
    var tsType;
    if (fields[idx].fieldIsEnum) {
        tsType = fieldType;
    } else if (fieldType == 'ZonedDateTime') {
        tsType = 'any';
    } else if (fieldType == 'Boolean') {
        tsType = 'boolean';
        defaultVariablesValues[fieldName] = 'this.' + fieldName + ' = false;';
    } else if (fieldType == 'Double' || fieldType == 'Float' || fieldType == 'Long' || fieldType == 'Integer' || fieldType == 'BigDecimal') {
        tsType = 'number';
    } else if (fieldType == 'String'  || fieldType == 'UUID') {
        tsType = 'string';
    } else { //(fieldType === 'byte[]' || fieldType === 'ByteBuffer') && fieldTypeBlobContent == 'any' || (fieldType === 'byte[]' || fieldType === 'ByteBuffer') && fieldTypeBlobContent == 'image' || fieldType == 'LocalDate'
        tsType = 'any';
    }
    variables[fieldName] = fieldName + '?: ' + tsType;
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
    variables[fieldName] = fieldName + '?: ' + fieldType;
}_%>
export class <%= entityAngularName %> {
    constructor(<% for (idx in variables) { %>
        public <%- variables[idx] %>,<% } %>
    ) {<% for (idx in defaultVariablesValues) { %>
        <%- defaultVariablesValues[idx] %><% } %>
    }
}
