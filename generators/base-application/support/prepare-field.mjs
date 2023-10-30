/**
 * Copyright 2013-2023 the original author or authors from the JHipster project.
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
import * as _ from 'lodash-es';
import { fieldTypes, validations } from '../../../jdl/jhipster/index.mjs';
import { getTypescriptType, prepareField as prepareClientFieldForTemplates } from '../../client/support/index.mjs';
import { prepareField as prepareServerFieldForTemplates } from '../../server/support/index.mjs';
import { fieldIsEnum } from './field-utils.mjs';
import { mutateData } from '../../base/support/config.mjs';

const { BlobTypes, CommonDBTypes, RelationalOnlyDBTypes } = fieldTypes;
const {
  Validations: { MIN, MINLENGTH, MINBYTES, MAX, MAXBYTES, MAXLENGTH, PATTERN, REQUIRED, UNIQUE },
} = validations;

const { TEXT, IMAGE, ANY } = BlobTypes;
const {
  BOOLEAN,
  BIG_DECIMAL,
  DOUBLE,
  DURATION,
  FLOAT,
  INSTANT,
  INTEGER,
  LOCAL_DATE,
  LONG,
  STRING,
  UUID,
  ZONED_DATE_TIME,
  IMAGE_BLOB,
  ANY_BLOB,
  TEXT_BLOB,
  BLOB,
} = CommonDBTypes;
const { BYTES, BYTE_BUFFER } = RelationalOnlyDBTypes;

const fakeStringTemplateForFieldName = columnName => {
  let fakeTemplate;
  if (columnName === 'first_name') {
    fakeTemplate = 'person.firstName';
  } else if (columnName === 'last_name') {
    fakeTemplate = 'person.lastName';
  } else if (columnName === 'job_title') {
    fakeTemplate = 'person.jobTitle';
  } else if (columnName === 'telephone' || columnName === 'phone') {
    fakeTemplate = 'phone.number';
  } else if (columnName === 'zip_code' || columnName === 'post_code') {
    fakeTemplate = 'location.zipCode';
  } else if (columnName === 'city') {
    fakeTemplate = 'location.city';
  } else if (columnName === 'street_name' || columnName === 'street') {
    fakeTemplate = 'location.street';
  } else if (columnName === 'country') {
    fakeTemplate = 'location.country';
  } else if (columnName === 'country_code') {
    fakeTemplate = 'location.countryCode';
  } else if (columnName === 'color') {
    fakeTemplate = 'color.human';
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
    fakeTemplate = 'word.words';
  }
  return `{{${fakeTemplate}}}`;
};

/**
 * @param {*} field
 * @param {import('@faker-js/faker').Faker} faker
 * @param {*} changelogDate
 * @param {string} type csv, cypress, json-serializable, ts
 * @returns fake value
 */
function generateFakeDataForField(field, faker, changelogDate, type = 'csv') {
  let data;
  if (field.fakerTemplate) {
    data = faker.faker(field.fakerTemplate);
  } else if (field.fieldValidate && field.fieldValidateRules.includes('pattern')) {
    const re = field.createRandexp();
    if (!re) {
      return undefined;
    }
    const generated = re.gen();
    if (type === 'csv' || type === 'cypress') {
      data = generated.replace(/"/g, '');
    } else {
      data = generated;
    }
    if (data.length === 0) {
      this.log.warn(`Generated value for pattern ${field.fieldValidateRulesPattern} is not valid.`);
      data = undefined;
    }
  } else if (field.fieldIsEnum) {
    if (field.fieldValues.length !== 0) {
      const enumValues = field.enumValues;
      data = enumValues[faker.number.int(enumValues.length - 1)].name;
    } else {
      this.log.warn(`Enum ${field.fieldType} is not valid`);
      data = undefined;
    }
  } else if (field.fieldType === DURATION && type === 'cypress') {
    data = `PT${faker.number.int({ min: 1, max: 59 })}M`;

    // eslint-disable-next-line no-template-curly-in-string
  } else if ([FLOAT, '${floatType}', DOUBLE, BIG_DECIMAL].includes(field.fieldType)) {
    data = faker.number.float({
      max: field.fieldValidateRulesMax ? parseInt(field.fieldValidateRulesMax, 10) : 32767,
      min: field.fieldValidateRulesMin ? parseInt(field.fieldValidateRulesMin, 10) : 0,
      precision: 0.01,
    });
  } else if ([INTEGER, LONG, DURATION].includes(field.fieldType)) {
    data = faker.number.int({
      max: field.fieldValidateRulesMax ? parseInt(field.fieldValidateRulesMax, 10) : 32767,
      min: field.fieldValidateRulesMin ? parseInt(field.fieldValidateRulesMin, 10) : 0,
    });
  } else if ([INSTANT, ZONED_DATE_TIME, LOCAL_DATE].includes(field.fieldType)) {
    // Iso: YYYY-MM-DDTHH:mm:ss.sssZ
    const date = faker.date.recent({ days: 1, refDate: changelogDate });
    const isoDate = date.toISOString();
    if (field.fieldType === LOCAL_DATE) {
      data = isoDate.split('T')[0];
    } else if (type === 'json-serializable') {
      data = date;
    } else {
      // Write the date without milliseconds so Java can parse it
      // See https://stackoverflow.com/a/34053802/150868
      // YYYY-MM-DDTHH:mm:ss
      data = isoDate.split('.')[0];
      if (type === 'cypress' || type === 'ts') {
        // YYYY-MM-DDTHH:mm
        data = data.substr(0, data.length - 3);
      }
    }
  } else if (field.fieldType === BYTES && field.fieldTypeBlobContent !== TEXT) {
    data = '../fake-data/blob/hipster.png';
  } else if (field.fieldType === BYTES && field.fieldTypeBlobContent === TEXT) {
    data = '../fake-data/blob/hipster.txt';
  } else if (field.fieldType === STRING) {
    data = field.id ? faker.string.uuid() : faker.helpers.fake(fakeStringTemplateForFieldName(field.columnName));
  } else if (field.fieldType === UUID) {
    data = faker.string.uuid();
  } else if (field.fieldType === BOOLEAN) {
    data = faker.datatype.boolean();
  } else {
    this.log.warn(`Fake data for field ${field.fieldType} is not supported`);
  }

  if (field.fieldType === BYTES && type === 'json-serializable') {
    data = Buffer.from(data).toString('base64');
  }

  // Validation rules
  if (data !== undefined && field.fieldValidate === true) {
    // manage String max length
    if (field.fieldValidateRules.includes(MAXLENGTH)) {
      const maxlength = field.fieldValidateRulesMaxlength;
      data = data.substring(0, maxlength);
    }

    // manage String min length
    if (field.fieldValidateRules.includes(MINLENGTH)) {
      const minlength = field.fieldValidateRulesMinlength;
      data = data.length > minlength ? data : data + 'X'.repeat(minlength - data.length);
    }

    // test if generated data is still compatible with the regexp as we potentially modify it with min/maxLength
    if (field.fieldValidateRules.includes(PATTERN) && !new RegExp(`^${field.fieldValidateRulesPattern}$`).test(data)) {
      data = undefined;
    }
  }
  if (data !== undefined) {
    // eslint-disable-next-line no-template-curly-in-string
    if (type === 'ts' && ![BOOLEAN, INTEGER, LONG, FLOAT, '${floatType}', DOUBLE, BIG_DECIMAL].includes(field.fieldType)) {
      data = `'${typeof data === 'string' ? data.replace(/'/g, "\\'") : data}'`;
    } else if (type === 'csv' && field.fieldValidate && field.fieldValidateRules.includes(PATTERN)) {
      data = `"${typeof data === 'string' ? data.replace(/"/g, '\\"') : data}"`;
    }
  }

  return data;
}

function _derivedProperties(field) {
  const fieldType = field.fieldType;
  const fieldTypeBlobContent = field.fieldTypeBlobContent;
  const validationRules = field.fieldValidate ? field.fieldValidateRules : [];
  _.defaults(field, {
    blobContentTypeText: fieldTypeBlobContent === TEXT,
    blobContentTypeImage: fieldTypeBlobContent === IMAGE,
    blobContentTypeAny: fieldTypeBlobContent === ANY,
    fieldTypeBoolean: fieldType === BOOLEAN,
    fieldTypeBigDecimal: fieldType === BIG_DECIMAL,
    fieldTypeDouble: fieldType === DOUBLE,
    fieldTypeDuration: fieldType === DURATION,
    fieldTypeFloat: fieldType === FLOAT,
    fieldTypeInstant: fieldType === INSTANT,
    fieldTypeInteger: fieldType === INTEGER,
    fieldTypeLocalDate: fieldType === LOCAL_DATE,
    fieldTypeLong: fieldType === LONG,
    fieldTypeString: fieldType === STRING,
    fieldTypeUUID: fieldType === UUID,
    fieldTypeZonedDateTime: fieldType === ZONED_DATE_TIME,
    fieldTypeImageBlob: fieldType === IMAGE_BLOB,
    fieldTypeAnyBlob: fieldType === ANY_BLOB,
    fieldTypeTextBlob: fieldType === TEXT_BLOB,
    fieldTypeBlob: fieldType === BLOB,
    fieldTypeBytes: fieldType === BYTES,
    fieldTypeByteBuffer: fieldType === BYTE_BUFFER,
    fieldTypeNumeric:
      fieldType === INTEGER || fieldType === LONG || fieldType === FLOAT || fieldType === DOUBLE || fieldType === BIG_DECIMAL,
    fieldTypeBinary: fieldType === BYTES || fieldType === BYTE_BUFFER,
    fieldTypeTimed: fieldType === ZONED_DATE_TIME || fieldType === INSTANT,
    fieldTypeCharSequence: fieldType === STRING || fieldType === UUID,
    fieldTypeTemporal: fieldType === ZONED_DATE_TIME || fieldType === INSTANT || fieldType === LOCAL_DATE,
    fieldValidationRequired: validationRules.includes(REQUIRED),
    fieldValidationMin: validationRules.includes(MIN),
    fieldValidationMinLength: validationRules.includes(MINLENGTH),
    fieldValidationMax: validationRules.includes(MAX),
    fieldValidationMaxLength: validationRules.includes(MAXLENGTH),
    fieldValidationPattern: validationRules.includes(PATTERN),
    fieldValidationUnique: validationRules.includes(UNIQUE),
    fieldValidationMinBytes: validationRules.includes(MINBYTES),
    fieldValidationMaxBytes: validationRules.includes(MAXBYTES),
  });
}

export default function prepareField(entityWithConfig, field, generator) {
  prepareCommonFieldForTemplates(entityWithConfig, field, generator);

  if (entityWithConfig.prodDatabaseType || entityWithConfig.databaseType) {
    prepareServerFieldForTemplates(entityWithConfig, field, generator);
  }

  prepareClientFieldForTemplates(entityWithConfig, field, generator);
  return field;
}

function prepareCommonFieldForTemplates(entityWithConfig, field, generator) {
  mutateData(field, {
    path: [field.fieldName],
    propertyName: field.fieldName,
    propertyNameCapitalized: ({ propertyName, propertyNameCapitalized }) => propertyNameCapitalized ?? _.upperFirst(propertyName),
    fieldNameCapitalized: ({ fieldName, fieldNameCapitalized }) => fieldNameCapitalized ?? _.upperFirst(fieldName),
    fieldNameUnderscored: ({ fieldName, fieldNameUnderscored }) => fieldNameUnderscored ?? _.snakeCase(fieldName),
    fieldNameHumanized: ({ fieldName, fieldNameHumanized }) => fieldNameHumanized ?? _.startCase(fieldName),
    fieldTranslationKey: ({ fieldName, fieldTranslationKey }) => fieldTranslationKey ?? `${entityWithConfig.i18nKeyPrefix}.${fieldName}`,
    tsType: ({ fieldType, tsType }) => tsType ?? getTypescriptType(fieldType),
  });

  _.defaults(field, {
    entity: entityWithConfig,
  });
  const fieldType = field.fieldType;

  field.fieldIsEnum = !field.id && fieldIsEnum(fieldType);
  if (field.fieldIsEnum) {
    field.enumFileName = _.kebabCase(field.fieldType);
    field.enumValues = getEnumValuesWithCustomValues(field.fieldValues);
  }

  field.fieldWithContentType = (fieldType === BYTES || fieldType === BYTE_BUFFER) && field.fieldTypeBlobContent !== TEXT;
  if (field.fieldWithContentType) {
    field.contentTypeFieldName = `${field.fieldName}ContentType`;
  }

  field.fieldValidate = Array.isArray(field.fieldValidateRules) && field.fieldValidateRules.length >= 1;
  _.defaults(field, {
    nullable: !(field.fieldValidate === true && field.fieldValidateRules.includes(REQUIRED)),
  });
  field.unique = field.fieldValidate === true && field.fieldValidateRules.includes(UNIQUE);
  if (field.fieldValidate === true && field.fieldValidateRules.includes(MAXLENGTH)) {
    field.maxlength = field.fieldValidateRulesMaxlength || 255;
  }

  const faker = entityWithConfig.faker;
  field.createRandexp = () => {
    // check if regex is valid. If not, issue warning and we skip fake data generation.
    try {
      // eslint-disable-next-line no-new
      new RegExp(field.fieldValidateRulesPattern);
    } catch (e) {
      generator.log.warn(`${field.fieldName} pattern is not valid: ${field.fieldValidateRulesPattern}. Skipping generating fake data. `);
      return undefined;
    }
    const re = faker.createRandexp(field.fieldValidateRulesPattern);
    if (!re) {
      generator.log.warn(`Error creating generator for pattern ${field.fieldValidateRulesPattern}`);
    }
    return re;
  };

  field.uniqueValue = [];

  field.generateFakeData = (type = 'csv') => {
    let data = generateFakeDataForField.call(generator, field, faker, entityWithConfig.changelogDateForRecent, type);
    // manage uniqueness
    if ((field.fieldValidate === true && field.fieldValidateRules.includes(UNIQUE)) || field.id) {
      let i = 0;
      while (field.uniqueValue.indexOf(data) !== -1) {
        if (i++ === 5) {
          data = undefined;
          break;
        }
        data = generateFakeDataForField.call(generator, field, faker, entityWithConfig.changelogDateForRecent, type);
      }
      if (data === undefined) {
        generator.log.warn(`Error generating a unique value field ${field.fieldName} and type ${field.fieldType}`);
      } else {
        field.uniqueValue.push(data);
      }
    }
    if (data === undefined) {
      generator.log.warn(`Error generating fake data for field ${entityWithConfig.name}.${field.fieldName}`);
    }
    return data;
  };
  field.relationshipsPath = [];

  field.reference = fieldToReference(entityWithConfig, field);
  _derivedProperties(field);
  return field;
}

/**
 * From an enum's values (with or without custom values), returns the enum's values without custom values.
 * @param {String} [enumValues] - an enum's values.
 * @return {Array<String>} the formatted enum's values.
 */
export function getEnumValuesWithCustomValues(enumValues) {
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

export function fieldToReference(entity, field, pathPrefix = []) {
  return {
    id: field.id,
    entity,
    field,
    multiple: false,
    owned: true,
    doc: field.documentation,
    get propertyJavadoc() {
      return field.fieldJavadoc;
    },
    get propertyApiDescription() {
      return field.fieldApiDescription;
    },
    label: field.fieldNameHumanized,
    name: field.fieldName,
    type: field.fieldType,
    nameCapitalized: field.fieldNameCapitalized,
    path: [...pathPrefix, field.fieldName],
  };
}
