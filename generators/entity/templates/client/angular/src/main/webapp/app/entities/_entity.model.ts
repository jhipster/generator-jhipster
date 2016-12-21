<% for (idx in fields) {
    if (fields[idx].fieldIsEnum) { _%>
const enum <%= fields[idx].fieldType %> {<%
        const enums = fields[idx].fieldValues.split(',');
        for (var i = 0; i < enums.length; i++) { %>
    '<%= enums[i] %>'<%if (i < enums.length - 1) { %>,<% } } _%>

};
<%_ } } _%>

export class <%= entityClass %> {
    constructor(
        public id?: any,
<%_ for (idx in fields) {
    var fieldName = fields[idx].fieldName;
    var fieldType = fields[idx].fieldType;
    var fieldTypeBlobContent = fields[idx].fieldTypeBlobContent; _%>
        public <%= fieldName %>?:<%_ if (fields[idx].fieldIsEnum) { _%>
 <%= fieldType %>,
    <%_ } else if ((fieldType === 'byte[]' || fieldType === 'ByteBuffer') && fieldTypeBlobContent == 'image') { _%>
 any,
    <%_ } else if (fieldType == 'ZonedDateTime') { _%>
 Date,
    <%_ } else if (fieldType == 'LocalDate') { _%>
 Date,
    <%_ } else if (fieldType == 'Boolean') { _%>
 Boolean,
    <%_ } else if (fieldType == 'Double' || fieldType == 'Float' || fieldType == 'Long' || fieldType == 'Integer' || fieldType == 'BigDecimal') { _%>
 number,
    <%_ } else if (fieldType == 'String'  || fieldType == 'UUID') { _%>
 string,
    <%_ } else if ((fieldType === 'byte[]' || fieldType === 'ByteBuffer') && fieldTypeBlobContent == 'any') { _%>
 any,
    <%_ } else { _%>
 any,
    <%_ } _%>
<%_ } _%>
    ) { }
}
