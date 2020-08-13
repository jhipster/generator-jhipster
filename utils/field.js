/**
 * Copyright 2013-2020 the original author or authors from the JHipster project.
 *
 * This file is part of the JHipster project, see https://www.jhipster.tech/
 * for more information.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *      http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

const _ = require('lodash');
const { isReservedTableName } = require('../jdl/jhipster/reserved-keywords');

function prepareFieldForTemplates(entityWithConfig, field, generator) {
    const fieldOptions = field.options || {};
    _.defaults(field, {
        fieldNameCapitalized: _.upperFirst(field.fieldName),
        fieldNameUnderscored: _.snakeCase(field.fieldName),
        fieldNameHumanized: fieldOptions.fieldNameHumanized || _.startCase(field.fieldName),
    });
    const fieldType = field.fieldType;

    field.fieldIsEnum = fieldIsEnum(fieldType);

    if (field.fieldNameAsDatabaseColumn === undefined) {
        const fieldNameUnderscored = _.snakeCase(field.fieldName);
        const jhiFieldNamePrefix = generator.getColumnName(entityWithConfig.jhiPrefix);
        if (isReservedTableName(fieldNameUnderscored, entityWithConfig.prodDatabaseType)) {
            if (!jhiFieldNamePrefix) {
                generator.warning(
                    `The field name '${fieldNameUnderscored}' is regarded as a reserved keyword, but you have defined an empty jhiPrefix. This might lead to a non-working application.`
                );
                field.fieldNameAsDatabaseColumn = fieldNameUnderscored;
            } else {
                field.fieldNameAsDatabaseColumn = `${jhiFieldNamePrefix}_${fieldNameUnderscored}`;
            }
        } else {
            field.fieldNameAsDatabaseColumn = fieldNameUnderscored;
        }
        field.columnName = field.fieldNameAsDatabaseColumn;
    }

    if (field.fieldInJavaBeanMethod === undefined) {
        // Handle the specific case when the second letter is capitalized
        // See http://stackoverflow.com/questions/2948083/naming-convention-for-getters-setters-in-java
        if (field.fieldName.length > 1) {
            const firstLetter = field.fieldName.charAt(0);
            const secondLetter = field.fieldName.charAt(1);
            if (firstLetter === firstLetter.toLowerCase() && secondLetter === secondLetter.toUpperCase()) {
                field.fieldInJavaBeanMethod = firstLetter.toLowerCase() + field.fieldName.slice(1);
            } else {
                field.fieldInJavaBeanMethod = _.upperFirst(field.fieldName);
            }
        } else {
            field.fieldInJavaBeanMethod = _.upperFirst(field.fieldName);
        }
    }

    if (field.fieldValidateRulesPatternJava === undefined) {
        field.fieldValidateRulesPatternJava = field.fieldValidateRulesPattern
            ? field.fieldValidateRulesPattern.replace(/\\/g, '\\\\').replace(/"/g, '\\"')
            : field.fieldValidateRulesPattern;
    }

    if (field.fieldValidateRulesPatternAngular === undefined) {
        field.fieldValidateRulesPatternAngular = field.fieldValidateRulesPattern
            ? field.fieldValidateRulesPattern.replace(/"/g, '&#34;')
            : field.fieldValidateRulesPattern;
    }

    if (field.fieldValidateRulesPatternReact === undefined) {
        field.fieldValidateRulesPatternReact = field.fieldValidateRulesPattern
            ? field.fieldValidateRulesPattern.replace(/'/g, "\\'")
            : field.fieldValidateRulesPattern;
    }

    field.fieldValidate = Array.isArray(field.fieldValidateRules) && field.fieldValidateRules.length >= 1;
    field.nullable = !(field.fieldValidate === true && field.fieldValidateRules.includes('required'));
    field.unique = field.fieldValidate === true && field.fieldValidateRules.includes('unique');
    if (field.unique) {
        field.uniqueConstraintName = generator.getUXConstraintName(
            entityWithConfig.entityTableName,
            field.columnName,
            entityWithConfig.prodDatabaseType
        );
    }
    if (field.fieldValidate === true && field.fieldValidateRules.includes('maxlength')) {
        field.maxlength = field.fieldValidateRulesMaxlength || 255;
    }
    return field;
}

function fieldIsEnum(fieldType) {
    return ![
        'String',
        'Integer',
        'Long',
        'Float',
        'Double',
        'BigDecimal',
        'LocalDate',
        'Instant',
        'ZonedDateTime',
        'Duration',
        'UUID',
        'Boolean',
        'byte[]',
        'ByteBuffer',
    ].includes(fieldType);
}

module.exports = { prepareFieldForTemplates, fieldIsEnum };
