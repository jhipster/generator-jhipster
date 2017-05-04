<%#
 Copyright 2013-2017 the original author or authors.

 This file is part of the JHipster project, see https://jhipster.github.io/
 for more information.

 Licensed under the Apache License, Version 2.0 (the "License");
 you may not use this file except in compliance with the License.
 You may obtain a copy of the License at

      http://www.apache.org/licenses/LICENSE-2.0

 Unless required by applicable law or agreed to in writing, software
 distributed under the License is distributed on an "AS IS" BASIS,
 WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 See the License for the specific language governing permissions and
 limitations under the License.
-%>
<% const enumsAlreadyDeclared = [];
    for (const idx in fields) {
    if (fields[idx].fieldIsEnum && enumsAlreadyDeclared.indexOf(fields[idx].fieldType) === -1) {
        enumsAlreadyDeclared.push(fields[idx].fieldType); %>
const enum <%= fields[idx].fieldType %> {<%
        const enums = fields[idx].fieldValues.split(',');
        for (let i = 0; i < enums.length; i++) { %>
    '<%= enums[i] %>'<%if (i < enums.length - 1) { %>,<% } } %>

};
<%_ } } _%>
<%_ if (dto == "no") {
       for (const rel of differentRelationships) { _%>
import { <%= rel.otherEntityNameCapitalized %> } from '../<%= rel.otherEntityModulePath %>';
<%_ }
}
const variables = {};
const defaultVariablesValues = {};
let tsKeyType;
if (pkType == 'String') {
    tsKeyType = 'string';
} else {
    tsKeyType = 'number';
}
variables['id'] = 'id?: ' + tsKeyType;
for (const idx in fields) {
    const fieldType = fields[idx].fieldType;
    const fieldName = fields[idx].fieldName;
    let tsType;
    if (fields[idx].fieldIsEnum) {
        tsType = fieldType;
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
    let fieldType;
    let fieldName;
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
