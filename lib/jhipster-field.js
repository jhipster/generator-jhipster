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
const chalk = require('chalk');
const _ = require('lodash');
const jhiCore = require('jhipster-core');

module.exports = class Field {
    /**
     * Field definitions wrapper for calculating extra info.
     *
     * @param {String} entityName - Entity that this field belongs to.
     * @param {Object} definitions - Field definition.
     * @param {Object} baseGenerator - JHipster base generator instance.
     * @param {Object} config - Required application config.
     * @param {String} config.jhiPrefix - jhiPrefix
     * @param {String} config.prodDatabaseType - Production database type
     */
    constructor(entityName, definitions, baseGenerator, config) {
        this.entityName = entityName;
        this.definitions = definitions;
        this.baseGenerator = baseGenerator;
        this.config = config;

        Object.keys(definitions).forEach(fieldName => {
            if (
                !Object.prototype.hasOwnProperty.call(this, fieldName) &&
                !Object.getOwnPropertyDescriptor(Object.getPrototypeOf(this), fieldName)
            ) {
                baseGenerator.warning(`Field is missing ${fieldName} getter, setting the property directly.`);
                this[fieldName] = definitions[fieldName];
            }
        });
    }

    get fieldName() {
        return this.definitions.fieldName;
    }

    get fieldNameCapitalized() {
        return this.definitions.fieldNameCapitalized || _.upperFirst(this.fieldName);
    }

    get fieldNameUnderscored() {
        return this.definitions.fieldNameUnderscored || _.snakeCase(this.fieldName);
    }

    get fieldNameHumanized() {
        return this.definitions.fieldNameHumanized || _.startCase(this.fieldName);
    }

    get fieldValidateRules() {
        return this.definitions.fieldValidateRules;
    }

    get fieldValidate() {
        return Array.isArray(this.fieldValidateRules) && this.fieldValidateRules.length > 0;
    }

    get unique() {
        return this.fieldValidate === true && this.fieldValidateRules.includes('unique');
    }

    get fieldValidateRulesMax() {
        return this.definitions.fieldValidateRulesMax;
    }

    get fieldValidateRulesMin() {
        return this.definitions.fieldValidateRulesMin;
    }

    get fieldValidateRulesMinlength() {
        return this.definitions.fieldValidateRulesMinlength;
    }

    get fieldValidateRulesMaxlength() {
        return this.definitions.fieldValidateRulesMaxlength;
    }

    get fieldValidateRulesMaxbytes() {
        return this.definitions.fieldValidateRulesMaxbytes;
    }

    get fieldValidateRulesMinbytes() {
        return this.definitions.fieldValidateRulesMinbytes;
    }

    get maxlength() {
        if (this.fieldValidate === true && this.fieldValidateRules.includes('maxlength')) {
            return this.fieldValidateRulesMaxlength;
        }

        return 255;
    }

    get fieldValidateRulesPattern() {
        return this.definitions.fieldValidateRulesPattern;
    }

    get fieldType() {
        return this.definitions.fieldType;
    }

    get fieldTypeBlobContent() {
        return this.definitions.fieldTypeBlobContent;
    }

    get fieldValues() {
        return this.definitions.fieldValues;
    }

    get fieldIsEnum() {
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
        ].includes(this.fieldType);
    }

    get javadoc() {
        return this.definitions.javadoc;
    }

    get remarks() {
        return this.baseGenerator.formatAsLiquibaseRemarks(this.javadoc, true);
    }

    get nullable() {
        return !(this.fieldValidate === true && this.fieldValidateRules.includes('required'));
    }

    shouldDropDefaultValue() {
        return this.fieldType === 'ZonedDateTime' || this.fieldType === 'Instant';
    }

    shouldCreateContentType() {
        return this.fieldType === 'byte[]' && this.fieldTypeBlobContent !== 'text';
    }

    getUXConstraintName(entityTableName) {
        return this.baseGenerator.getUXConstraintName(entityTableName, this.columnName, this.config.prodDatabaseType);
    }

    get columnName() {
        const fieldNameUnderscored = _.snakeCase(this.definitions.fieldName);
        const jhiFieldNamePrefix = this.baseGenerator.getColumnName(this.config.jhiPrefix);
        if (jhiCore.isReservedTableName(fieldNameUnderscored, this.config.prodDatabaseType)) {
            if (!jhiFieldNamePrefix) {
                this.warning(
                    chalk.red(
                        `The field name '${fieldNameUnderscored}' is regarded as a reserved keyword, but you have defined an empty jhiPrefix. This might lead to a non-working application.`
                    )
                );
                return fieldNameUnderscored;
            }

            return `${jhiFieldNamePrefix}_${fieldNameUnderscored}`;
        }

        return fieldNameUnderscored;
    }

    get loadColumnType() {
        const columnType = this.columnType;
        if (
            columnType === 'integer' ||
            columnType === 'bigint' ||
            columnType === 'double' ||
            columnType === 'decimal(21,2)' ||
            // eslint-disable-next-line no-template-curly-in-string
            columnType === '${floatType}'
        ) {
            return 'numeric';
        }

        if (columnType === 'date') {
            return 'date';
        }

        if (columnType === 'datetime') {
            return 'datetime';
        }

        if (columnType === 'boolean') {
            return 'boolean';
        }

        if (this.fieldIsEnum) {
            return 'string';
        }

        if (columnType === 'blob' || columnType === 'longblob') {
            return 'blob';
        }

        // eslint-disable-next-line no-template-curly-in-string
        if (columnType === '${clobType}') {
            return 'clob';
        }

        const { prodDatabaseType } = this.config;
        if (
            // eslint-disable-next-line no-template-curly-in-string
            columnType === '${uuidType}' &&
            prodDatabaseType !== 'mysql' &&
            prodDatabaseType !== 'mariadb'
        ) {
            // eslint-disable-next-line no-template-curly-in-string
            return '${uuidType}';
        }

        return 'string';
    }

    get columnType() {
        const fieldType = this.fieldType;
        if (fieldType === 'String' || this.fieldIsEnum) {
            return `varchar(${this.maxlength})`;
        }

        if (fieldType === 'Integer') {
            return 'integer';
        }

        if (fieldType === 'Long') {
            return 'bigint';
        }

        if (fieldType === 'Float') {
            // eslint-disable-next-line no-template-curly-in-string
            return '${floatType}';
        }

        if (fieldType === 'Double') {
            return 'double';
        }

        if (fieldType === 'BigDecimal') {
            return 'decimal(21,2)';
        }

        if (fieldType === 'LocalDate') {
            return 'date';
        }

        if (fieldType === 'Instant') {
            return 'datetime';
        }

        if (fieldType === 'ZonedDateTime') {
            return 'datetime';
        }

        if (fieldType === 'Duration') {
            return 'bigint';
        }

        if (fieldType === 'UUID') {
            // eslint-disable-next-line no-template-curly-in-string
            return '${uuidType}';
        }

        if (fieldType === 'byte[]' && this.fieldTypeBlobContent !== 'text') {
            const { prodDatabaseType } = this.config;
            if (prodDatabaseType === 'mysql' || prodDatabaseType === 'postgresql' || prodDatabaseType === 'mariadb') {
                return 'longblob';
            }

            return 'blob';
        }

        if (this.fieldTypeBlobContent === 'text') {
            // eslint-disable-next-line no-template-curly-in-string
            return '${clobType}';
        }

        if (fieldType === 'Boolean') {
            return 'boolean';
        }

        return undefined;
    }

    /**
     * @deprecated
     * Use columnName instead
     */
    get fieldNameAsDatabaseColumn() {
        if (this.definitions.fieldNameAsDatabaseColumn) {
            return this.definitions.fieldNameAsDatabaseColumn;
        }
        return this.columnName;
    }

    get fieldInJavaBeanMethod() {
        if (this.definitions.fieldInJavaBeanMethod) {
            return this.definitions.fieldInJavaBeanMethod;
        }

        // Handle the specific case when the second letter is capitalized
        // See http://stackoverflow.com/questions/2948083/naming-convention-for-getters-setters-in-java
        if (this.fieldName.length > 1) {
            const firstLetter = this.fieldName.charAt(0);
            const secondLetter = this.fieldName.charAt(1);
            if (firstLetter === firstLetter.toLowerCase() && secondLetter === secondLetter.toUpperCase()) {
                return firstLetter.toLowerCase() + this.fieldName.slice(1);
            }
            return _.upperFirst(this.fieldName);
        }
        return _.upperFirst(this.fieldName);
    }

    get fieldValidateRulesPatternJava() {
        if (this.definitions.fieldValidateRulesPatternJava) {
            return this.definitions.fieldValidateRulesPatternJava;
        }
        return this.fieldValidateRulesPattern
            ? this.fieldValidateRulesPattern.replace(/\\/g, '\\\\').replace(/"/g, '\\"')
            : this.fieldValidateRulesPattern;
    }

    get fieldValidateRulesPatternAngular() {
        if (this.definitions.fieldValidateRulesPatternAngular) {
            return this.definitions.fieldValidateRulesPatternAngular;
        }
        return this.fieldValidateRulesPattern ? this.fieldValidateRulesPattern.replace(/"/g, '&#34;') : this.fieldValidateRulesPattern;
    }

    get fieldValidateRulesPatternReact() {
        if (this.definitions.fieldValidateRulesPatternReact) {
            return this.definitions.fieldValidateRulesPatternReact;
        }
        return this.fieldValidateRulesPattern ? this.fieldValidateRulesPattern.replace(/'/g, "\\'") : this.fieldValidateRulesPattern;
    }
};
