/**
 * Copyright 2013-2022 the original author or authors from the JHipster project.
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
import assert from 'assert';
import _ from 'lodash';
import { databaseTypes, entityOptions, fieldTypes, reservedKeywords, validations } from '../jdl/jhipster/index.mjs';

const { isReservedTableName } = reservedKeywords;
const { BlobTypes, CommonDBTypes, RelationalOnlyDBTypes } = fieldTypes;
const {
  Validations: { MIN, MINLENGTH, MINBYTES, MAX, MAXBYTES, MAXLENGTH, PATTERN, REQUIRED, UNIQUE },
} = validations;
const { MYSQL, SQL } = databaseTypes;
const { MapperTypes } = entityOptions;

const { MAPSTRUCT } = MapperTypes;
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

/**
 * @param {*} field
 * @param {*} faker
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
      this.warning(`Generated value for pattern ${field.fieldValidateRulesPattern} is not valid.`);
      data = undefined;
    }
  } else if (field.fieldIsEnum) {
    if (field.fieldValues.length !== 0) {
      const enumValues = field.enumValues;
      data = enumValues[faker.datatype.number(enumValues.length - 1)].name;
    } else {
      this.warning(`Enum ${field.fieldType} is not valid`);
      data = undefined;
    }
  } else if (field.fieldType === DURATION && type === 'cypress') {
    data = `PT${faker.datatype.number({ min: 1, max: 59 })}M`;

    // eslint-disable-next-line no-template-curly-in-string
  } else if ([INTEGER, LONG, FLOAT, '${floatType}', DOUBLE, BIG_DECIMAL, DURATION].includes(field.fieldType)) {
    data = faker.datatype.number({
      max: field.fieldValidateRulesMax ? parseInt(field.fieldValidateRulesMax, 10) : undefined,
      min: field.fieldValidateRulesMin ? parseInt(field.fieldValidateRulesMin, 10) : undefined,
    });
  } else if ([INSTANT, ZONED_DATE_TIME, LOCAL_DATE].includes(field.fieldType)) {
    // Iso: YYYY-MM-DDTHH:mm:ss.sssZ
    const date = faker.date.recent(1, changelogDate);
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
    data = field.id ? faker.datatype.uuid() : faker.helpers.fake(fakeStringTemplateForFieldName(field.columnName));
  } else if (field.fieldType === UUID) {
    data = faker.datatype.uuid();
  } else if (field.fieldType === BOOLEAN) {
    data = faker.datatype.boolean();
  } else {
    this.warning(`Fake data for field ${field.fieldType} is not supported`);
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

export function prepareFieldForTemplates(entityWithConfig, field, generator) {
  prepareCommonFieldForTemplates(entityWithConfig, field, generator);

  if (entityWithConfig.prodDatabaseType || entityWithConfig.databaseType) {
    prepareServerFieldForTemplates(entityWithConfig, field, generator);
  }

  prepareClientFieldForTemplates(entityWithConfig, field, generator);
  return field;
}

export function prepareCommonFieldForTemplates(entityWithConfig, field, generator) {
  _.defaults(field, {
    propertyName: field.fieldName,
    path: [field.fieldName],
    fieldNameCapitalized: _.upperFirst(field.fieldName),
    fieldNameUnderscored: _.snakeCase(field.fieldName),
    fieldNameHumanized: _.startCase(field.fieldName),
    fieldTranslationKey: `${entityWithConfig.i18nKeyPrefix}.${field.fieldName}`,
    tsType: generator.getTypescriptType(field.fieldType),
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
      generator.warning(`${field.fieldName} pattern is not valid: ${field.fieldValidateRulesPattern}. Skipping generating fake data. `);
      return undefined;
    }
    const re = faker.createRandexp(field.fieldValidateRulesPattern);
    if (!re) {
      generator.warning(`Error creating generator for pattern ${field.fieldValidateRulesPattern}`);
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
        generator.warning(`Error generating a unique value field ${field.fieldName} and type ${field.fieldType}`);
      } else {
        field.uniqueValue.push(data);
      }
    }
    if (data === undefined) {
      generator.warning(`Error generating fake data for field ${entityWithConfig.name}.${field.fieldName}`);
    }
    return data;
  };
  field.relationshipsPath = [];

  field.reference = fieldToReference(entityWithConfig, field);
  _derivedProperties(field);
  return field;
}

export function fieldIsEnum(fieldType) {
  return ![
    STRING,
    INTEGER,
    LONG,
    FLOAT,
    DOUBLE,
    BIG_DECIMAL,
    LOCAL_DATE,
    INSTANT,
    ZONED_DATE_TIME,
    DURATION,
    UUID,
    BOOLEAN,
    BYTES,
    BYTE_BUFFER,
    ANY_BLOB,
    BLOB,
    IMAGE_BLOB,
    TEXT_BLOB,
  ].includes(fieldType);
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

export function prepareClientFieldForTemplates(entityWithConfig, field, generator) {
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
}

export function prepareServerFieldForTemplates(entityWithConfig, field, generator) {
  if (field.mapstructExpression) {
    assert.equal(
      entityWithConfig.dto,
      MAPSTRUCT,
      `@MapstructExpression requires an Entity with mapstruct dto [${entityWithConfig.name}.${field.fieldName}].`
    );
    // Remove from Entity.java and liquibase.
    field.transient = true;
    // Disable update form.
    field.readonly = true;
  }

  if (field.id && entityWithConfig.primaryKey) {
    if (field.autoGenerate === undefined) {
      field.autoGenerate = !entityWithConfig.primaryKey.composite && [LONG, UUID].includes(field.fieldType);
    }

    if (!field.autoGenerate) {
      field.liquibaseAutoIncrement = false;
      field.jpaGeneratedValue = false;
      field.autoGenerateByService = false;
      field.autoGenerateByRepository = false;
      field.requiresPersistableImplementation = true;
    } else if (entityWithConfig.databaseType !== SQL) {
      field.liquibaseAutoIncrement = false;
      field.jpaGeneratedValue = false;
      field.autoGenerateByService = field.fieldType === UUID;
      field.autoGenerateByRepository = !field.autoGenerateByService;
      field.requiresPersistableImplementation = false;
      field.readonly = true;
    } else if (entityWithConfig.reactive) {
      field.liquibaseAutoIncrement = field.fieldType === LONG;
      field.jpaGeneratedValue = false;
      field.autoGenerateByService = !field.liquibaseAutoIncrement;
      field.autoGenerateByRepository = !field.autoGenerateByService;
      field.requiresPersistableImplementation = !field.liquibaseAutoIncrement;
      field.readonly = true;
    } else {
      const defaultGenerationType = entityWithConfig.prodDatabaseType === MYSQL ? 'identity' : 'sequence';
      field.jpaGeneratedValue = field.jpaGeneratedValue || field.fieldType === LONG ? defaultGenerationType : true;
      field.autoGenerateByService = false;
      field.autoGenerateByRepository = true;
      field.requiresPersistableImplementation = false;
      field.readonly = true;
      if (field.jpaGeneratedValue === 'identity') {
        field.liquibaseAutoIncrement = true;
      }
    }
  }

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
  if (field.unique) {
    field.uniqueConstraintName = generator.getUXConstraintName(
      entityWithConfig.entityTableName,
      field.columnName,
      entityWithConfig.prodDatabaseType
    );
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

  if (field.blobContentTypeText) {
    field.javaFieldType = 'String';
  } else {
    field.javaFieldType = field.fieldType;
  }
}

export function fieldToReference(entity, field, pathPrefix = []) {
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
