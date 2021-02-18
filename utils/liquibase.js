/**
 * Copyright 2013-2021 the original author or authors from the JHipster project.
 *
 * This file is part of the JHipster project, see https://www.jhipster.tech/
 * for more information.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *      https://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

const _ = require('lodash');

module.exports = {
  parseLiquibaseChangelogDate,
  formatDateForChangelog,
  parseLiquibaseColumnType,
  parseLiquibaseLoadColumnType,
  prepareFieldForLiquibaseTemplates,
};

function parseLiquibaseChangelogDate(changelogDate) {
  if (!changelogDate || changelogDate.length !== 14) {
    throw new Error(`${changelogDate} is not a valid changelogDate.`);
  }
  const formatedDate = `${changelogDate.substring(0, 4)}-${changelogDate.substring(4, 6)}-${changelogDate.substring(
    6,
    8
  )}T${changelogDate.substring(8, 10)}:${changelogDate.substring(10, 12)}:${changelogDate.substring(12, 14)}+00:00`;
  return new Date(Date.parse(formatedDate));
}

function formatDateForChangelog(now) {
  const nowUTC = new Date(
    now.getUTCFullYear(),
    now.getUTCMonth(),
    now.getUTCDate(),
    now.getUTCHours(),
    now.getUTCMinutes(),
    now.getUTCSeconds()
  );
  const year = `${nowUTC.getFullYear()}`;
  let month = `${nowUTC.getMonth() + 1}`;
  if (month.length === 1) {
    month = `0${month}`;
  }
  let day = `${nowUTC.getDate()}`;
  if (day.length === 1) {
    day = `0${day}`;
  }
  let hour = `${nowUTC.getHours()}`;
  if (hour.length === 1) {
    hour = `0${hour}`;
  }
  let minute = `${nowUTC.getMinutes()}`;
  if (minute.length === 1) {
    minute = `0${minute}`;
  }
  let second = `${nowUTC.getSeconds()}`;
  if (second.length === 1) {
    second = `0${second}`;
  }
  return `${year}${month}${day}${hour}${minute}${second}`;
}

function parseLiquibaseColumnType(entity, field) {
  const fieldType = field.fieldType;
  if (fieldType === 'String' || field.fieldIsEnum) {
    return `varchar(${field.fieldValidateRulesMaxlength || 255})`;
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
    // eslint-disable-next-line no-template-curly-in-string
    return '${datetimeType}';
  }

  if (fieldType === 'ZonedDateTime') {
    // eslint-disable-next-line no-template-curly-in-string
    return '${datetimeType}';
  }

  if (fieldType === 'Duration') {
    return 'bigint';
  }

  if (fieldType === 'UUID') {
    // eslint-disable-next-line no-template-curly-in-string
    return '${uuidType}';
  }

  if (fieldType === 'byte[]' && field.fieldTypeBlobContent !== 'text') {
    const { prodDatabaseType } = entity;
    if (prodDatabaseType === 'mysql' || prodDatabaseType === 'postgresql' || prodDatabaseType === 'mariadb') {
      return 'longblob';
    }

    return 'blob';
  }

  if (field.fieldTypeBlobContent === 'text') {
    // eslint-disable-next-line no-template-curly-in-string
    return '${clobType}';
  }

  if (fieldType === 'Boolean') {
    return 'boolean';
  }

  return undefined;
}

function parseLiquibaseLoadColumnType(entity, field) {
  const columnType = field.columnType;
  // eslint-disable-next-line no-template-curly-in-string
  if (['integer', 'bigint', 'double', 'decimal(21,2)', '${floatType}'].includes(columnType)) {
    return 'numeric';
  }

  if (field.fieldIsEnum) {
    return 'string';
  }

  // eslint-disable-next-line no-template-curly-in-string
  if (['date', '${datetimeType}', 'boolean'].includes(columnType)) {
    return columnType;
  }

  if (columnType === 'blob' || columnType === 'longblob') {
    return 'blob';
  }

  // eslint-disable-next-line no-template-curly-in-string
  if (columnType === '${clobType}') {
    return 'clob';
  }

  const { prodDatabaseType } = entity;
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

function prepareFieldForLiquibaseTemplates(entity, field) {
  _.defaults(field, {
    columnType: parseLiquibaseColumnType(entity, field),
    shouldDropDefaultValue: field.fieldType === 'ZonedDateTime' || field.fieldType === 'Instant',
    shouldCreateContentType: field.fieldType === 'byte[]' && field.fieldTypeBlobContent !== 'text',
    nullable: !(field.fieldValidate === true && field.fieldValidateRules.includes('required')),
  });
  _.defaults(field, {
    loadColumnType: parseLiquibaseLoadColumnType(entity, field),
  });
  return field;
}
