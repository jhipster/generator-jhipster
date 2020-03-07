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
     * @param {Object} definitions - Field definition.
     * @param {Object} baseGenerator - JHipster base generator instance.
     * @param {Object} config - Required application config.
     * @param {String} config.jhiPrefix - jhiPrefix
     * @param {String} config.prodDatabaseType - Production database type
     */
    constructor(definitions, baseGenerator, config) {
        this.definitions = definitions;
        this.baseGenerator = baseGenerator;
        this.config = config;
    }

    get fieldValidateRules() {
        return this.definitions.fieldValidateRules;
    }

    get fieldValidate() {
        return _.isArray(this.fieldValidateRules) && this.fieldValidateRules.length >= 1;
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
        // eslint-disable-next-line no-template-curly-in-string
        if (columnType === '${uuidType}' && prodDatabaseType !== 'mysql' && prodDatabaseType !== 'mariadb') {
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
};
