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

const assert = require('assert');
const _ = require('lodash');
const { isReservedTableName } = require('../jdl/jhipster/reserved-keywords');

const fakeStringTemplateForFieldName = columnName => {
  let fakeTemplate;
  if (columnName === 'first_name') {
    fakeTemplate = 'name.firstName';
  } else if (columnName === 'last_name') {
    fakeTemplate = 'name.lastName';
  } else if (columnName === 'job_title') {
    fakeTemplate = 'name.jobTitle';
  } else if (columnName === 'telephone' || columnName === 'phone') {
    fakeTemplate = 'phone.phoneNumber';
  } else if (columnName === 'zip_code' || columnName === 'post_code') {
    fakeTemplate = 'address.zipCode';
  } else if (columnName === 'city') {
    fakeTemplate = 'address.city';
  } else if (columnName === 'street_name' || columnName === 'street') {
    fakeTemplate = 'address.streetName';
  } else if (columnName === 'country') {
    fakeTemplate = 'address.country';
  } else if (columnName === 'country_code') {
    fakeTemplate = 'address.countryCode';
  } else if (columnName === 'color') {
    fakeTemplate = 'commerce.color';
  } else if (columnName === 'account') {
    fakeTemplate = 'finance.account';
  } else if (columnName === 'account_name') {
    fakeTemplate = 'finance.accountName';
  } else if (columnName === 'currency_code') {
    fakeTemplate = 'finance.currencyCode';
  } else if (columnName === 'currency_name') {
    fakeTemplate = 'finance.currencyName';
  } else if (columnName === 'currency_symbol') {
    fakeTemplate = 'finance.currencySymbol';
  } else if (columnName === 'iban') {
    fakeTemplate = 'finance.iban';
  } else if (columnName === 'bic') {
    fakeTemplate = 'finance.bic';
  } else if (columnName === 'email') {
    fakeTemplate = 'internet.email';
  } else if (columnName === 'url') {
    fakeTemplate = 'internet.url';
  } else {
    fakeTemplate = 'random.words';
  }
  return `{{${fakeTemplate}}}`;
};

const generateFakeDataForField = (field, faker, changelogDate, type = 'csv') => {
  let data;
  if (field.fakerTemplate) {
    data = faker.faker(field.fakerTemplate);
  } else if (field.fieldValidate && field.fieldValidateRules.includes('pattern')) {
    const generated = field.createRandexp().gen();
    if (type === 'csv') {
      data = `"${generated.replace(/"/g, '')}"`;
    } else if (type === 'cypress') {
      data = generated.replace(/"/g, '');
    } else {
      data = generated;
    }
    if (data.length === 0) {
      data = undefined;
    }
  } else if (field.fieldIsEnum) {
    if (field.fieldValues.length !== 0) {
      const enumValues = field.enumValues;
      data = enumValues[faker.datatype.number(enumValues.length - 1)].name;
    } else {
      data = undefined;
    }
    // eslint-disable-next-line no-template-curly-in-string
  } else if (['Integer', 'Long', 'Float', '${floatType}', 'Double', 'BigDecimal', 'Duration'].includes(field.fieldType)) {
    data = faker.datatype.number({
      max: field.fieldValidateRulesMax ? parseInt(field.fieldValidateRulesMax, 10) : undefined,
      min: field.fieldValidateRulesMin ? parseInt(field.fieldValidateRulesMin, 10) : undefined,
    });
  } else if (['Instant', 'ZonedDateTime', 'LocalDate'].includes(field.fieldType)) {
    // Iso: YYYY-MM-DDTHH:mm:ss.sssZ
    const isoDate = faker.date.recent(1, changelogDate).toISOString();
    if (field.fieldType === 'LocalDate') {
      data = isoDate.split('T')[0];
    } else {
      // Write the date without milliseconds so Java can parse it
      // See https://stackoverflow.com/a/34053802/150868
      // YYYY-MM-DDTHH:mm:ss
      data = isoDate.split('.')[0];
      if (type === 'cypress') {
        // YYYY-MM-DDTHH:mm
        data = data.substr(0, data.length - 3);
      }
    }
  } else if (field.fieldType === 'byte[]' && field.fieldTypeBlobContent !== 'text') {
    data = '../fake-data/blob/hipster.png';
  } else if (field.fieldType === 'byte[]' && field.fieldTypeBlobContent === 'text') {
    data = '../fake-data/blob/hipster.txt';
  } else if (field.fieldType === 'String') {
    data = faker.fake(fakeStringTemplateForFieldName(field.columnName));
  } else if (field.fieldType === 'UUID') {
    data = faker.datatype.uuid();
  } else if (field.fieldType === 'Boolean') {
    data = faker.datatype.boolean();
  }

  // Validation rules
  if (data !== undefined && field.fieldValidate === true) {
    // manage String max length
    if (field.fieldValidateRules.includes('maxlength')) {
      const maxlength = field.fieldValidateRulesMaxlength;
      data = data.substring(0, maxlength);
    }

    // manage String min length
    if (field.fieldValidateRules.includes('minlength')) {
      const minlength = field.fieldValidateRulesMinlength;
      data = data.length > minlength ? data : data + 'X'.repeat(minlength - data.length);
    }

    // test if generated data is still compatible with the regexp as we potentially modify it with min/maxLength
    if (
      field.fieldValidateRules.includes('pattern') &&
      !new RegExp(`^${field.fieldValidateRulesPattern}$`).test(data.substring(1, data.length - 1))
    ) {
      data = undefined;
    }
  }
  if (
    data !== undefined &&
    type === 'ts' &&
    // eslint-disable-next-line no-template-curly-in-string
    !['Boolean', 'Integer', 'Long', 'Float', '${floatType}', 'Double', 'BigDecimal'].includes(field.fieldType)
  ) {
    data = `'${data}'`;
  }

  return data;
};

function prepareFieldForTemplates(entityWithConfig, field, generator) {
  _.defaults(field, {
    fieldNameCapitalized: _.upperFirst(field.fieldName),
    fieldNameUnderscored: _.snakeCase(field.fieldName),
    fieldNameHumanized: _.startCase(field.fieldName),
    fieldTranslationKey: `${entityWithConfig.i18nKeyPrefix}.${field.fieldName}`,
    tsType: generator.getTypescriptKeyType(field.fieldType),
    entity: entityWithConfig,
  });
  const fieldType = field.fieldType;
  if (field.mapstructExpression) {
    assert.equal(
      entityWithConfig.dto,
      'mapstruct',
      `@MapstructExpression requires an Entity with mapstruct dto [${entityWithConfig.name}.${field.fieldName}].`
    );
    // Remove from Entity.java and liquibase.
    field.transient = true;
    // Disable update form.
    field.readonly = true;
  }

  if (field.id) {
    if (field.autoGenerate === undefined) {
      field.autoGenerate = !entityWithConfig.primaryKey.composite && ['Long', 'UUID'].includes(field.fieldType);
    }
    if (!field.autoGenerate) {
      field.liquibaseAutoIncrement = false;
      field.jpaGeneratedValue = false;
    } else if (entityWithConfig.reactive) {
      field.liquibaseAutoIncrement = true;
      field.jpaGeneratedValue = false;
      field.readonly = true;
    } else {
      const defaultGenerationType = entityWithConfig.prodDatabaseType === 'mysql' ? 'identity' : 'sequence';
      field.jpaGeneratedValue = field.jpaGeneratedValue || field.fieldType === 'Long' ? defaultGenerationType : true;
      field.readonly = true;
      if (field.jpaGeneratedValue === 'identity') {
        field.liquibaseAutoIncrement = true;
      }
    }
  }

  field.fieldIsEnum = !field.id && fieldIsEnum(fieldType);
  field.fieldWithContentType = (fieldType === 'byte[]' || fieldType === 'ByteBuffer') && field.fieldTypeBlobContent !== 'text';

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
  }
  field.columnName = field.fieldNameAsDatabaseColumn;

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

  if (field.fieldIsEnum) {
    field.enumValues = getEnumValuesWithCustomValues(field.fieldValues);
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

  const faker = entityWithConfig.faker;
  field.createRandexp = () => faker.createRandexp(field.fieldValidateRulesPattern);

  field.uniqueValue = [];

  field.generateFakeData = (type = 'csv') => {
    let data = generateFakeDataForField(field, faker, entityWithConfig.changelogDateForRecent, type);
    // manage uniqueness
    if (field.fieldValidate === true && field.fieldValidateRules.includes('unique')) {
      let i = 0;
      while (field.uniqueValue.indexOf(data) !== -1) {
        if (i++ === 5) {
          data = undefined;
          break;
        }
        data = generateFakeDataForField(field, faker, entityWithConfig.changelogDateForRecent, type);
      }
      if (data !== undefined) {
        field.uniqueValue.push(data);
      }
    }
    if (data === undefined) {
      generator.warning(`Error generating fake data for field ${field.fieldName}`);
    }
    return data;
  };
  field.path = [field.fieldName];
  field.relationshipsPath = [];
  field.reference = fieldToReference(entityWithConfig, field);

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

/**
 * From an enum's values (with or without custom values), returns the enum's values without custom values.
 * @param {String} enumValues - an enum's values.
 * @return {Array<String>} the formatted enum's values.
 */
function getEnumValuesWithCustomValues(enumValues) {
  if (!enumValues || enumValues === '') {
    throw new Error('Enumeration values must be passed to get the formatted values.');
  }
  return enumValues.split(',').map(enumValue => {
    if (!enumValue.includes('(')) {
      return { name: enumValue.trim(), value: enumValue.trim() };
    }
    const matched = /\s*(.+?)\s*\((.+?)\)/.exec(enumValue);
    return {
      name: matched[1],
      value: matched[2],
    };
  });
}

function fieldToReference(entity, field, pathPrefix = []) {
  return {
    id: field.id,
    entity,
    field,
    multiple: false,
    owned: true,
    doc: field.javadoc,
    label: field.fieldNameHumanized,
    name: field.fieldName,
    type: field.fieldType,
    nameCapitalized: field.fieldNameCapitalized,
    path: [...pathPrefix, field.fieldName],
  };
}

module.exports = { prepareFieldForTemplates, fieldIsEnum, getEnumValuesWithCustomValues, fieldToReference };
