<%#
 Copyright 2013-2018 the original author or authors from the JHipster project.

 This file is part of the JHipster project, see http://www.jhipster.tech/
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
<%_
const variablesWithTypes = [];
const typeImports = new Set();
const defaultVariablesValues = {};
let hasUserRelationship = false;
let tsKeyType;
if (pkType === 'String') {
    tsKeyType = 'string';
} else {
    tsKeyType = 'number';
}
variablesWithTypes.push(`id?: ${tsKeyType}`);
fields.forEach(field => {
    const fieldType = field.fieldType;
    const fieldName = field.fieldName;
    let tsType;
    if (field.fieldIsEnum) {
        tsType = fieldType;
    } else if (fieldType === 'Boolean') {
        tsType = 'boolean';
        defaultVariablesValues[fieldName] = 'this.' + fieldName + ' = false;';
    } else if (['Integer', 'Long', 'Float', 'Double', 'BigDecimal'].includes(fieldType)) {
        tsType = 'number';
    } else if (fieldType === 'String'  || fieldType === 'UUID') {
        tsType = 'string';
    } else { //(fieldType === 'byte[]' || fieldType === 'ByteBuffer') && fieldTypeBlobContent === 'any' || (fieldType === 'byte[]' || fieldType === 'ByteBuffer') && fieldTypeBlobContent === 'image' || fieldType === 'LocalDate'
        tsType = 'any';
        if (['byte[]', 'ByteBuffer'].includes(fieldType) && field.fieldTypeBlobContent !== 'text') {
            variablesWithTypes.push(`${fieldName}ContentType?: string`);
        }
    }
    variablesWithTypes.push(`${fieldName}?: ${tsType}`);
});
relationships.forEach(relationship => {
    let fieldType;
    let fieldName;
    const relationshipType = relationship.relationshipType;
    if (relationshipType === 'one-to-many' || relationshipType === 'many-to-many') {
        if (relationship.otherEntityAngularName === 'User') {
            fieldType = 'IUser[]';
            hasUserRelationship = true;
        } else {
            fieldType = `I${relationship.otherEntityAngularName}[]`;
            typeImports.add(`import { I${relationship.otherEntityAngularName} } from './${relationship.otherEntityModulePath}.model'`);
        }
        fieldName = relationship.relationshipFieldNamePlural;
    } else {
        if (dto === 'no') {
            if (relationship.otherEntityAngularName === 'User') {
                fieldType = 'IUser';
                hasUserRelationship = true;
            } else {
                fieldType = `I${relationship.otherEntityAngularName}`;
                typeImports.add(`import { I${relationship.otherEntityAngularName} } from './${relationship.otherEntityModulePath}.model'`);
            }
            fieldName = relationship.relationshipFieldName;
        } else {
            fieldType = tsKeyType;
            fieldName = `${relationship.relationshipFieldName}Id`;
        }
    }
    variablesWithTypes.push(`${fieldName}?: ${fieldType}`);
});
_%>
<%_ if (hasUserRelationship) { _%>
import { IUser } from '../user/user.model';
<%_ } _%>
<%_ typeImports.forEach(typeImport => { _%>
<%- typeImport %>;
<%_ }); _%>

<%_ const enumsAlreadyDeclared = [];
fields.forEach(field => {
    if (field.fieldIsEnum && !enumsAlreadyDeclared.includes(field.fieldType)) {
        enumsAlreadyDeclared.push(field.fieldType); _%>
export const enum <%= field.fieldType %> {<%
        const enums = field.fieldValues.split(',');
        for (let i = 0; i < enums.length; i++) { %>
    '<%= enums[i] %>'<%if (i < enums.length - 1) { %>,<% }
        } %>
}

<%_ }
}); _%>
export interface I<%= entityAngularName %> {
    <%_ variablesWithTypes.forEach(variablesWithType => { _%>
    <%- variablesWithType %>;
    <%_ }); _%>
}

export class <%= entityAngularName %> implements I<%= entityAngularName %> {
    constructor(<% variablesWithTypes.forEach(variablesWithType => { %>
        public <%- variablesWithType %>,<% }); %>
    ) {<% for (idx in defaultVariablesValues) { %>
        <%- defaultVariablesValues[idx] %><% } %>
    }
}
