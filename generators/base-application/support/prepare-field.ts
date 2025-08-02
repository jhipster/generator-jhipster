/**
 * Copyright 2013-2025 the original author or authors from the JHipster project.
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
import { defaults, kebabCase, snakeCase, startCase, upperFirst } from 'lodash-es';
import { fieldTypes, validations } from '../../../lib/jhipster/index.ts';
import { getTypescriptType } from '../../client/support/index.ts';
import { applyDerivedPropertyOnly, mutateData } from '../../../lib/utils/index.ts';
import type CoreGenerator from '../../base-core/generator.js';
import type { Entity as CommonEntity, Field as CommonField } from '../../common/types.d.ts';
import { isFieldEnumType } from '../internal/types/field-types.ts';
import { fieldTypesValues } from '../../../lib/jhipster/field-types.ts';
import type { DatabaseProperty } from '../../liquibase/types.js';
import type { FakerWithRandexp } from './faker.js';
import { prepareProperty } from './prepare-property.ts';

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
  TEXT_BLOB,
  LOCAL_TIME,
} = CommonDBTypes;
const { BYTES, BYTE_BUFFER } = RelationalOnlyDBTypes;

const fakeStringTemplateForFieldName = (columnName: string) => {
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
 * @returns fake value
 */
function generateFakeDataForField(
  this: CoreGenerator,
  field: CommonField,
  faker: FakerWithRandexp,
  changelogDate: any,
  type: 'csv' | 'cypress' | 'json-serializable' | 'ts' = 'csv',
) {
  let originalData: string | number | boolean | Date | undefined;
  let data: string | number | boolean | Date | undefined;
  for (const prop of [
    'fieldValidateRulesMax',
    'fieldValidateRulesMin',
    'fieldValidateRulesMaxlength',
    'fieldValidateRulesMinlength',
  ] as const) {
    if (prop in field && typeof field[prop] === 'string') {
      try {
        field[prop] = parseInt(field[prop], 10);
      } catch {
        throw new Error(`Error parsing ${prop} for field ${field.fieldName}`);
      }
    }
  }

  if (field.fakerTemplate) {
    originalData = faker.helpers.fake(field.fakerTemplate);
    data = originalData;
  } else if (field.fieldValidate && field.fieldValidateRules?.includes('pattern')) {
    originalData = field.generateFakeDataFromPattern!();
    if (!originalData) {
      return {};
    }
    if (type === 'csv' || type === 'cypress') {
      data = originalData.replace(/"/g, '');
    } else {
      data = originalData;
    }
    if (data.length === 0) {
      this.log.warn(`Generated value for pattern ${field.fieldValidateRulesPattern} is not valid.`);
      data = undefined;
    }
  } else if (field.fieldIsEnum) {
    if (field.enumValues && field.enumValues.length > 0) {
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
      max: field.fieldValidateRulesMax ?? 32767,
      min: field.fieldValidateRulesMin ?? 0,
      multipleOf: 0.01,
    });
  } else if (([INTEGER, LONG, DURATION] as string[]).includes(field.fieldType)) {
    data = faker.number.int({
      max: field.fieldValidateRulesMax ?? 32767,
      min: field.fieldValidateRulesMin ?? 0,
    });
  } else if (([INSTANT, ZONED_DATE_TIME, LOCAL_DATE, LOCAL_TIME] as string[]).includes(field.fieldType)) {
    // Iso: YYYY-MM-DDTHH:mm:ss.sssZ
    const date = faker.date.recent({ days: 1, refDate: changelogDate });
    originalData = date.toISOString();
    if (field.fieldType === LOCAL_DATE) {
      data = originalData.split('T')[0];
    } else if (field.fieldType === LOCAL_TIME) {
      // time without seconds by default
      const timeWithoutMilliseconds = originalData.split('T')[1].split('.')[0];
      // default time input fields are set to support HH:mm. Some databases require :00 during loading of fake data to detect the datatype.
      data = `${timeWithoutMilliseconds.substring(0, timeWithoutMilliseconds.lastIndexOf(':'))}:00`;
    } else if (type === 'json-serializable') {
      data = date;
    } else {
      // Write the date without milliseconds so Java can parse it
      // See https://stackoverflow.com/a/34053802/150868
      // YYYY-MM-DDTHH:mm:ss
      data = originalData.split('.')[0];
      if (type === 'cypress' || type === 'ts') {
        // YYYY-MM-DDTHH:mm
        data = data.substr(0, data.length - 3);
      }
    }
  } else if (field.fieldTypeBinary && field.fieldTypeBlobContent !== TEXT) {
    data = '../fake-data/blob/hipster.png';
  } else if (field.fieldTypeBinary && field.fieldTypeBlobContent === TEXT) {
    data = '../fake-data/blob/hipster.txt';
  } else if (field.fieldType === STRING) {
    data = field.id ? faker.string.uuid() : faker.helpers.fake(fakeStringTemplateForFieldName((field as DatabaseProperty).columnName!));
  } else if (field.fieldType === UUID) {
    data = faker.string.uuid();
  } else if (field.fieldType === BOOLEAN) {
    data = faker.datatype.boolean();
  } else {
    this.log.warn(`Fake data for field ${field.fieldType} is not supported`);
  }
  originalData ??= data;

  if (field.fieldType === BYTES && type === 'json-serializable') {
    data = Buffer.from(data as string).toString('base64');
  }

  // Validation rules
  if (data !== undefined && field.fieldValidate === true && field.fieldValidateRules) {
    const { fieldValidateRulesMinlength = 0, fieldValidateRulesMaxlength } = field;
    // manage String max length
    if (field.fieldValidateRules.includes(MAXLENGTH) && fieldValidateRulesMaxlength !== undefined) {
      if (typeof data === 'string') {
        const maxlength = field.fieldValidateRulesMaxlength;
        data = data.substring(0, maxlength);
      } else {
        this.log.error(`Error at field ${field.fieldName}: maxLength validation rule is only supported for string fields.`);
      }
    }

    // manage String min length
    if (field.fieldValidateRules.includes(MINLENGTH) && fieldValidateRulesMinlength !== undefined) {
      if (typeof data === 'string') {
        data = data.length > fieldValidateRulesMinlength ? data : data + 'X'.repeat(fieldValidateRulesMinlength - data.length);
      } else {
        this.log.error(`Error at field ${field.fieldName}: minLength validation rule is only supported for string fields.`);
      }
    }

    // test if generated data is still compatible with the regexp as we potentially modify it with min/maxLength
    if (field.fieldValidateRules.includes(PATTERN)) {
      if (typeof data === 'string') {
        if (!new RegExp(`^${field.fieldValidateRulesPattern}$`).test(data)) {
          data = undefined;
        }
      } else {
        this.log.error(`Error at field ${field.fieldName}: pattern validation rule is only supported for string fields.`);
      }
    }
  }

  if (data !== undefined) {
    // eslint-disable-next-line no-template-curly-in-string
    if (type === 'ts' && ![BOOLEAN, INTEGER, LONG, FLOAT, '${floatType}', DOUBLE, BIG_DECIMAL].includes(field.fieldType)) {
      data = `'${typeof data === 'string' ? data.replace(/\\/g, '\\\\').replace(/'/g, "\\'") : data}'`;
    } else if (type === 'csv' && field.fieldValidate && field.fieldValidateRules?.includes(PATTERN)) {
      data = `"${typeof data === 'string' ? data.replace(/"/g, '\\"') : data}"`;
    }
  }

  return { data, originalData };
}

function _derivedProperties(field: CommonField) {
  const fieldType = field.fieldType;
  const fieldTypeBlobContent = field.fieldTypeBlobContent;
  const validationRules = field.fieldValidate ? (field.fieldValidateRules ?? []) : [];

  applyDerivedPropertyOnly(field, 'fieldType', fieldType, Object.values(fieldTypesValues));

  mutateData(field, {
    __override__: false,
    blobContentTypeText: fieldTypeBlobContent === TEXT,
    blobContentTypeImage: fieldTypeBlobContent === IMAGE,
    blobContentTypeAny: fieldTypeBlobContent === ANY,
    fieldTypeByteBuffer: fieldType === BYTE_BUFFER,
    fieldTypeBytes: ({ fieldTypeByte }) => fieldTypeByte,

    fieldTypeNumeric:
      fieldType === INTEGER || fieldType === LONG || fieldType === FLOAT || fieldType === DOUBLE || fieldType === BIG_DECIMAL,
    fieldTypeBinary: fieldType === BYTES || fieldType === BYTE_BUFFER,
    fieldTypeTimed: fieldType === ZONED_DATE_TIME || fieldType === INSTANT,
    fieldTypeCharSequence: fieldType === STRING || fieldType === UUID || fieldType === TEXT_BLOB,
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

export function prepareCommonFieldForTemplates(entityWithConfig: CommonEntity, field: CommonField, generator: CoreGenerator): CommonField {
  mutateData(field, {
    __override__: false,
    path: [field.fieldName],
    propertyName: field.fieldName,

    fieldNameCapitalized: ({ fieldName }) => upperFirst(fieldName),
    fieldNameUnderscored: ({ fieldName }) => snakeCase(fieldName),
    fieldNameHumanized: ({ fieldName }) => startCase(fieldName),
    fieldTranslationKey: ({ fieldName }) => `${entityWithConfig.i18nKeyPrefix}.${fieldName}`,
    tsType: ({ fieldType }) => getTypescriptType(fieldType),
  });

  prepareProperty(field);

  defaults(field, {
    entity: entityWithConfig,
  });
  const fieldType = field.fieldType;

  const fieldIsEnum = isFieldEnumType(field);
  field.fieldIsEnum = fieldIsEnum;
  if (fieldIsEnum) {
    if ((Object.values(fieldTypesValues) as string[]).includes(fieldType)) {
      throw new Error(`Field type '${fieldType}' is a reserved keyword and can't be used as an enum name.`);
    }
    field.enumFileName = kebabCase(field.fieldType);
    field.enumValues = getEnumValuesWithCustomValues(field.fieldValues!);
  }

  field.fieldWithContentType = (fieldType === BYTES || fieldType === BYTE_BUFFER) && field.fieldTypeBlobContent !== TEXT;
  if (field.fieldWithContentType) {
    field.contentTypeFieldName = `${field.fieldName}ContentType`;
  }

  field.fieldValidate = Array.isArray(field.fieldValidateRules) && field.fieldValidateRules.length >= 1;
  defaults(field, {
    nullable: !(field.fieldValidate === true && field.fieldValidateRules!.includes(REQUIRED)),
  });
  field.unique = field.fieldValidate === true && field.fieldValidateRules!.includes(UNIQUE);
  if (field.fieldValidate === true && field.fieldValidateRules!.includes(MAXLENGTH)) {
    field.maxlength = field.fieldValidateRulesMaxlength || 255;
  }

  const faker = entityWithConfig.faker;
  field.generateFakeDataFromPattern = () => {
    // check if regex is valid. If not, issue warning and we skip fake data generation.
    try {
      new RegExp(field.fieldValidateRulesPattern!);
    } catch {
      generator.log.warn(`${field.fieldName} pattern is not valid: ${field.fieldValidateRulesPattern}. Skipping generating fake data. `);
      return undefined;
    }
    const re = faker.createRandexp(field.fieldValidateRulesPattern!);
    if (!re) {
      generator.log.warn(`Error creating generator for pattern ${field.fieldValidateRulesPattern}`);
    }
    return re?.gen();
  };

  field.uniqueValue = [];

  field.generateFakeData = (type = 'csv') => {
    let generated = generateFakeDataForField.call(generator, field, faker, entityWithConfig.changelogDateForRecent, type);
    // manage uniqueness
    if ((field.fieldValidate === true && field.fieldValidateRules!.includes(UNIQUE)) || field.id) {
      let i = 0;
      while (field.uniqueValue!.indexOf(generated.originalData) !== -1) {
        if (i++ === 5) {
          generated = {};
          break;
        }
        generated = generateFakeDataForField.call(generator, field, faker, entityWithConfig.changelogDateForRecent, type);
      }
      if (generated.data === undefined) {
        generator.log.warn(`Error generating a unique value field ${field.fieldName} and type ${field.fieldType}`);
      } else {
        field.uniqueValue!.push(generated.originalData);
      }
    }
    if (generated.data === undefined) {
      generator.log.warn(`Error generating fake data for field ${entityWithConfig.name}.${field.fieldName}`);
    }
    return generated.data;
  };

  _derivedProperties(field);
  return field;
}

/**
 * From an enum's values (with or without custom values), returns the enum's values without custom values.
 * @param {String} [enumValues] - an enum's values.
 * @return {Array<String>} the formatted enum's values.
 */
export function getEnumValuesWithCustomValues(enumValues: string): { name: string; value: string }[] {
  if (!enumValues || enumValues === '') {
    throw new Error('Enumeration values must be passed to get the formatted values.');
  }
  return enumValues.split(',').map(enumValue => {
    if (!enumValue.includes('(')) {
      return { name: enumValue.trim(), value: enumValue.trim() };
    }
    const matched = /\s*(.+?)\s*\((.+?)\)/.exec(enumValue);
    return {
      name: matched![1],
      value: matched![2],
    };
  });
}
