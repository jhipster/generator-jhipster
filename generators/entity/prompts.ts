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
import fs from 'fs';
import chalk from 'chalk';
import { isArray, lowerFirst, snakeCase, uniq, upperFirst } from 'lodash-es';
import { clientFrameworkTypes, databaseTypes, entityOptions, fieldTypes, reservedKeywords, validations } from '../../lib/jhipster/index.js';
import { asPromptingTask } from '../base-application/support/task-type-inference.ts';
import { APPLICATION_TYPE_GATEWAY } from '../../lib/core/application-types.ts';
import type { Field as BaseApplicationField } from '../base-application/types.js';
import { inputIsNumber, inputIsSignedDecimalNumber, inputIsSignedNumber } from './support/index.js';
import type EntityGenerator from './generator.js';

const { isReservedPaginationWords, isReservedFieldName, isReservedTableName } = reservedKeywords;
const { NO: NO_DATABASE, CASSANDRA, SQL } = databaseTypes;
const { FilteringTypes, MapperTypes, ServiceTypes, PaginationTypes } = entityOptions;
const { ANGULAR, REACT } = clientFrameworkTypes;
const { NO: NO_FILTERING, JPA_METAMODEL } = FilteringTypes;
const { NO: NO_PAGINATION, INFINITE_SCROLL, PAGINATION } = PaginationTypes;
const { NO: NO_SERVICE, SERVICE_IMPL, SERVICE_CLASS } = ServiceTypes;
const { NO: NO_MAPPER, MAPSTRUCT } = MapperTypes;

const { CommonDBTypes, RelationalOnlyDBTypes, BlobTypes } = fieldTypes;

const {
  BIG_DECIMAL,
  BOOLEAN,
  DOUBLE,
  DURATION,
  ENUM,
  FLOAT,
  INTEGER,
  INSTANT,
  LOCAL_DATE,
  LONG,
  STRING,
  UUID,
  ZONED_DATE_TIME,
  LOCAL_TIME,
} = CommonDBTypes;
const { BYTES, BYTE_BUFFER } = RelationalOnlyDBTypes;
const { ANY, IMAGE, TEXT } = BlobTypes;

const {
  Validations: { PATTERN, MINBYTES, MAXBYTES, MINLENGTH, MAXLENGTH, MIN, MAX, REQUIRED, UNIQUE },
} = validations;

const getFieldNameUndercored = (fields: BaseApplicationField[]): string[] => ['id'].concat(fields.map(field => snakeCase(field.fieldName)));

export const askForMicroserviceJson = asPromptingTask<EntityGenerator>(async function askForMicroserviceJson(this: EntityGenerator) {
  const context = this.entityData;
  if (this.jhipsterConfig.applicationType !== APPLICATION_TYPE_GATEWAY || context.configExisted) {
    return undefined;
  }

  const databaseType = this.jhipsterConfig.databaseType;

  const answers = await this.prompt([
    {
      when: () => databaseType !== NO_DATABASE,
      type: 'confirm',
      name: 'useMicroserviceJson',
      message: 'Do you want to generate this entity from an existing microservice?',
      default: true,
    },
    {
      when: response => response.useMicroserviceJson === true || databaseType === NO_DATABASE,
      type: 'input',
      name: 'microservicePath',
      message: 'Enter the path to the microservice root directory:',
      store: true,
      default: this.entityConfig.microservicePath,
      validate: input => {
        if (fs.existsSync(this.destinationPath(input, context.filename))) {
          return true;
        }
        return `${context.filename} not found in ${input}/`;
      },
    },
  ]);
  if (answers.microservicePath) {
    this.log.log(chalk.green(`\nFound the ${context.filename} configuration file, entity can be automatically generated!\n`));
    context.microservicePath = this.entityConfig.microservicePath = answers.microservicePath;
  }
});

export const askForUpdate = asPromptingTask(async function askForUpdate(this: EntityGenerator) {
  const context = this.entityData;
  // ask only if running an existing entity without arg option --force or --regenerate
  const isForce = this.options.force || context.regenerate;
  context.updateEntity = 'regenerate'; // default if skipping questions by --force
  if (isForce || !context.useConfigurationFile) {
    return undefined;
  }
  const answers = await this.prompt([
    {
      type: 'list',
      name: 'updateEntity',
      message:
        'Do you want to update the entity? This will replace the existing files for this entity, all your custom code will be overwritten',
      choices: [
        {
          value: 'regenerate',
          name: 'Yes, re generate the entity',
        },
        {
          value: 'add',
          name: 'Yes, add more fields and relationships',
        },
        {
          value: 'remove',
          name: 'Yes, remove fields and relationships',
        },
        {
          value: 'none',
          name: 'No, exit',
        },
      ],
      default: 0,
    },
  ]);
  context.updateEntity = answers.updateEntity;
  if (context.updateEntity === 'none') {
    throw new Error(chalk.green('Aborting entity update, no changes were made.'));
  }
});

export function askForFields(this: EntityGenerator) {
  const context = this.entityData;
  // don't prompt if data is imported from a file
  if (this.options.defaults || (context.useConfigurationFile && context.updateEntity !== 'add')) {
    return undefined;
  }

  if (context.updateEntity === 'add') {
    logFieldsAndRelationships.call(this);
  }

  return askForField.call(this);
}

export function askForFieldsToRemove(this: EntityGenerator) {
  const context = this.entityData;
  // prompt only if data is imported from a file
  if (!context.useConfigurationFile || context.updateEntity !== 'remove' || this.entityConfig.fields.length === 0) {
    return undefined;
  }

  return this.prompt([
    {
      type: 'checkbox',
      name: 'fieldsToRemove',
      message: 'Please choose the fields you want to remove',
      choices: () =>
        this.entityConfig.fields.map(field => {
          return { name: field.fieldName, value: field.fieldName };
        }),
    },
    {
      when: response => response.fieldsToRemove.length !== 0,
      type: 'confirm',
      name: 'confirmRemove',
      message: 'Are you sure to remove these fields?',
      default: true,
    },
  ]).then(props => {
    if (props.confirmRemove) {
      this.log.log(chalk.red(`\nRemoving fields: ${props.fieldsToRemove}\n`));
      const fields = this.entityConfig.fields;
      for (let i = fields.length - 1; i >= 0; i -= 1) {
        const field = this.entityConfig.fields[i];
        if (props.fieldsToRemove.filter((val: string) => val === field.fieldName).length > 0) {
          fields.splice(i, 1);
        }
      }
      this.entityConfig.fields = fields;
    }
  });
}

export const askForRelationships = function askForRelationships(this: EntityGenerator, ...args: any[]) {
  const context = this.entityData;
  // don't prompt if data is imported from a file
  if (context.useConfigurationFile && context.updateEntity !== 'add') {
    return undefined;
  }
  if (context.databaseType === CASSANDRA) {
    return undefined;
  }

  return askForRelationship.call(this, ...args);
};

export function askForRelationsToRemove(this: EntityGenerator) {
  const context = this.entityData;
  // prompt only if data is imported from a file
  if (!context.useConfigurationFile || context.updateEntity !== 'remove' || this.entityConfig.relationships.length === 0) {
    return undefined;
  }
  if (context.databaseType === CASSANDRA) {
    return undefined;
  }

  return this.prompt([
    {
      type: 'checkbox',
      name: 'relsToRemove',
      message: 'Please choose the relationships you want to remove',
      choices: () =>
        this.entityConfig.relationships.map(rel => {
          return {
            name: `${rel.relationshipName}:${rel.relationshipType}`,
            value: `${rel.relationshipName}:${rel.relationshipType}`,
          };
        }),
    },
    {
      when: response => response.relsToRemove.length !== 0,
      type: 'confirm',
      name: 'confirmRemove',
      message: 'Are you sure to remove these relationships?',
      default: true,
    },
  ]).then(props => {
    if (props.confirmRemove) {
      this.log.log(chalk.red(`\nRemoving relationships: ${props.relsToRemove}\n`));
      const relationships = this.entityConfig.relationships;
      for (let i = relationships.length - 1; i >= 0; i -= 1) {
        const rel = relationships[i];
        if ((props.relsToRemove as string[]).filter(val => val === `${rel.relationshipName}:${rel.relationshipType}`).length > 0) {
          relationships.splice(i, 1);
        }
      }
      this.entityConfig.relationships = relationships;
    }
  });
}

export function askForFiltering(this: EntityGenerator) {
  const context = this.entityData;
  // don't prompt if server is skipped, or the backend is not sql, or no service requested
  if (context.useConfigurationFile || context.skipServer || context.databaseType !== 'sql' || this.entityConfig.service === 'no') {
    return undefined;
  }
  return this.prompt([
    {
      type: 'list',
      name: 'filtering',
      message: 'Do you want to add filtering?',
      choices: [
        {
          value: NO_FILTERING,
          name: 'Not needed',
        },
        {
          name: 'Dynamic filtering for the entities with JPA Static metamodel',
          value: JPA_METAMODEL,
        },
      ],
      default: 0,
    },
  ]).then(props => {
    this.entityConfig.jpaMetamodelFiltering = props.filtering === JPA_METAMODEL;
  });
}

export function askForReadOnly(this: EntityGenerator) {
  const context = this.entityData;
  // don't prompt if data is imported from a file
  if (context.useConfigurationFile) {
    return undefined;
  }
  return this.prompt([
    {
      type: 'confirm',
      name: 'readOnly',
      message: 'Is this entity read-only?',
      default: false,
    },
  ]).then(props => {
    this.entityConfig.readOnly = props.readOnly;
  });
}

export function askForDTO(this: EntityGenerator) {
  const context = this.entityData;
  // don't prompt if data is imported from a file or server is skipped or if no service layer
  if (context.useConfigurationFile || context.skipServer || this.entityConfig.service === 'no') {
    return undefined;
  }
  return this.prompt([
    {
      type: 'list',
      name: 'dto',
      message: 'Do you want to use a Data Transfer Object (DTO)?',
      choices: [
        {
          value: NO_MAPPER,
          name: 'No, use the entity directly',
        },
        {
          value: MAPSTRUCT,
          name: 'Yes, generate a DTO with MapStruct',
        },
      ],
      default: 0,
    },
  ]).then(props => {
    this.entityConfig.dto = props.dto;
  });
}

export function askForService(this: EntityGenerator) {
  const context = this.entityData;
  // don't prompt if data is imported from a file or server is skipped
  if (context.useConfigurationFile || context.skipServer) {
    return undefined;
  }
  return this.prompt([
    {
      type: 'list',
      name: 'service',
      message: 'Do you want to use separate service class for your business logic?',
      choices: [
        {
          value: NO_SERVICE,
          name: 'No, the REST controller should use the repository directly',
        },
        {
          value: SERVICE_CLASS,
          name: 'Yes, generate a separate service class',
        },
        {
          value: SERVICE_IMPL,
          name: 'Yes, generate a separate service interface and implementation',
        },
      ],
      default: 0,
    },
  ]).then(props => {
    this.entityConfig.service = props.service;
  });
}

export function askForPagination(this: EntityGenerator) {
  const context = this.entityData;
  // don't prompt if data are imported from a file
  if (context.useConfigurationFile) {
    return undefined;
  }
  if (context.databaseType === CASSANDRA) {
    return undefined;
  }
  return this.prompt([
    {
      type: 'list',
      name: 'pagination',
      message: 'Do you want pagination and sorting on your entity?',
      choices: [
        {
          value: NO_PAGINATION,
          name: 'No',
        },
        {
          value: PAGINATION,
          name: 'Yes, with pagination links and sorting headers',
        },
        {
          value: INFINITE_SCROLL,
          name: 'Yes, with infinite scroll and sorting headers',
        },
      ],
      default: 0,
    },
  ]).then(props => {
    this.entityConfig.pagination = props.pagination;
    this.log.log(chalk.green('\nEverything is configured, generating the entity...\n'));
  });
}

/**
 * ask question for a field creation
 */
async function askForField(this: EntityGenerator) {
  const context = this.entityData;
  this.log.log(chalk.green(`\nGenerating field #${this.entityConfig.fields.length + 1}\n`));
  const databaseType = context.databaseType;
  const clientFramework = context.clientFramework;
  const possibleFiltering = databaseType === SQL && !context.reactive;
  const fieldAddAnswer = await this.prompt([
    {
      type: 'confirm',
      name: 'fieldAdd',
      message: 'Do you want to add a field to your entity?',
      default: true,
    },
  ]);

  if (!fieldAddAnswer.fieldAdd) {
    logFieldsAndRelationships.call(this);
    return;
  }
  const answers = await this.prompt([
    {
      type: 'input',
      name: 'fieldName',
      validate: input => {
        if (!/^([a-zA-Z0-9_]*)$/.test(input)) {
          return 'Your field name cannot contain special characters';
        }
        if (input === '') {
          return 'Your field name cannot be empty';
        }
        if (input.charAt(0) === input.charAt(0).toUpperCase()) {
          return 'Your field name cannot start with an upper case letter';
        }
        if (input === 'id' || getFieldNameUndercored(this.entityConfig.fields).includes(snakeCase(input))) {
          return 'Your field name cannot use an already existing field name';
        }
        if ((clientFramework === undefined || clientFramework === ANGULAR) && isReservedFieldName(input, ANGULAR)) {
          return 'Your field name cannot contain a Java or Angular reserved keyword';
        }
        if ((clientFramework !== undefined || clientFramework === REACT) && isReservedFieldName(input, REACT)) {
          return 'Your field name cannot contain a Java or React reserved keyword';
        }
        // we don't know, if filtering will be used
        if (possibleFiltering && isReservedPaginationWords(input)) {
          return 'Your field name cannot be a value, which is used as a parameter by Spring for pagination';
        }
        return true;
      },
      message: 'What is the name of your field?',
    },
    {
      type: 'list',
      name: 'fieldType',
      message: 'What is the type of your field?',
      choices: () => [
        { value: STRING, name: 'String' },
        { value: INTEGER, name: 'Integer' },
        { value: LONG, name: 'Long' },
        { value: FLOAT, name: 'Float' },
        { value: DOUBLE, name: 'Double' },
        { value: BIG_DECIMAL, name: 'BigDecimal' },
        { value: LOCAL_DATE, name: 'LocalDate' },
        { value: INSTANT, name: 'Instant' },
        { value: ZONED_DATE_TIME, name: 'ZonedDateTime' },
        { value: DURATION, name: 'Duration' },
        { value: BOOLEAN, name: 'Boolean' },
        { value: ENUM, name: 'Enumeration (Java enum type)' },
        { value: UUID, name: 'UUID' },
        { value: LOCAL_TIME, name: 'LocalTime' },
        ...(databaseType === CASSANDRA ? [{ value: BYTE_BUFFER, name: '[BETA] Blob' }] : [{ value: BYTES, name: '[BETA] Blob' }]),
      ],
      default: 0,
    },
    {
      when: response => {
        if (response.fieldType === ENUM) {
          (response as any).fieldIsEnum = true;
          return true;
        }
        (response as any).fieldIsEnum = false;
        return false;
      },
      type: 'input',
      name: 'enumType',
      validate: input => {
        if (input === '') {
          return 'Your class name cannot be empty.';
        }
        if (isReservedTableName(input, 'JAVA')) {
          return 'Your enum name cannot contain a Java reserved keyword';
        }
        if (!/^[A-Za-z0-9_]*$/.test(input)) {
          return 'Your enum name cannot contain special characters (allowed characters: A-Z, a-z, 0-9 and _)';
        }
        if (context.enums?.includes(input)) {
          context.existingEnum = true;
        } else if (context.enums) {
          context.enums.push(input);
        } else {
          context.enums = [input];
        }
        return true;
      },
      message: 'What is the class name of your enumeration?',
    },
    {
      when: response => (response as any).fieldIsEnum,
      type: 'input',
      name: 'fieldValues',
      validate: input => {
        if (input === '' && context.existingEnum) {
          context.existingEnum = false;
          return true;
        }
        if (input === '') {
          return 'You must specify values for your enumeration';
        }
        // Commas allowed so that user can input a list of values split by commas.
        if (!/^[A-Za-z0-9_,]+$/.test(input)) {
          return 'Enum values cannot contain special characters (allowed characters: A-Z, a-z, 0-9 and _)';
        }
        const enums = input.replace(/\s/g, '').split(',');
        if (uniq(enums).length !== enums.length) {
          return `Enum values cannot contain duplicates (typed values: ${input})`;
        }
        for (let i = 0; i < enums.length; i++) {
          if (/^[0-9].*/.test(enums[i])) {
            return `Enum value "${enums[i]}" cannot start with a number`;
          }
          if (enums[i] === '') {
            return 'Enum value cannot be empty (did you accidentally type "," twice in a row?)';
          }
        }

        return true;
      },
      message: () => {
        if (!context.existingEnum) {
          return 'What are the values of your enumeration (separated by comma, no spaces)?';
        }
        return 'What are the new values of your enumeration (separated by comma, no spaces)?\nThe new values will replace the old ones.\nNothing will be done if there are no new values.';
      },
    },
    {
      when: response => response.fieldType === BYTES || response.fieldType === BYTE_BUFFER,
      type: 'list',
      name: 'fieldTypeBlobContent',
      message: 'What is the content of the Blob field?',
      choices: answers => [
        { value: IMAGE, name: 'An image' },
        { value: ANY, name: 'A binary file' },
        ...(answers.fieldType === BYTES ? [{ value: TEXT, name: 'A CLOB (Text field)' }] : []),
      ],
      default: 0,
    },
    {
      when: response => response.fieldType !== BYTE_BUFFER,
      type: 'confirm',
      name: 'fieldValidate',
      message: 'Do you want to add validation rules to your field?',
      default: false,
    },
    {
      when: response => response.fieldValidate === true,
      type: 'checkbox',
      name: 'fieldValidateRules',
      message: 'Which validation rules do you want to add?',
      choices: response => {
        // Default rules applicable for fieldType 'LocalDate', 'Instant',
        // 'ZonedDateTime', 'Duration', 'UUID', 'Boolean', 'ByteBuffer' and 'Enum'
        const opts = [
          {
            name: 'Required',
            value: REQUIRED,
          },
          {
            name: 'Unique',
            value: UNIQUE,
          },
        ];
        if (response.fieldType === STRING || response.fieldTypeBlobContent === TEXT) {
          return [
            ...opts,
            {
              name: 'Minimum length',
              value: MINLENGTH,
            },
            {
              name: 'Maximum length',
              value: MAXLENGTH,
            },
            {
              name: 'Regular expression pattern',
              value: PATTERN,
            },
          ];
        } else if ([INTEGER, LONG, FLOAT, DOUBLE, BIG_DECIMAL].includes(response.fieldType)) {
          return [
            ...opts,
            {
              name: 'Minimum',
              value: MIN,
            },
            {
              name: 'Maximum',
              value: MAX,
            },
          ];
        }
        return opts;
      },
      default: [REQUIRED],
    },
    {
      when: response => response.fieldValidate === true && response.fieldValidateRules.includes('minlength'),
      type: 'input',
      name: 'fieldValidateRulesMinlength',
      validate: input => (inputIsNumber(input) ? true : 'Minimum length must be a positive number'),
      message: 'What is the minimum length of your field?',
      default: '0',
    },
    {
      when: response => response.fieldValidate === true && response.fieldValidateRules.includes('maxlength'),
      type: 'input',
      name: 'fieldValidateRulesMaxlength',
      validate: input => (inputIsNumber(input) ? true : 'Maximum length must be a positive number'),
      message: 'What is the maximum length of your field?',
      default: '20',
    },
    {
      when: response => response.fieldValidate === true && response.fieldValidateRules.includes('min'),
      type: 'input',
      name: 'fieldValidateRulesMin',
      message: 'What is the minimum of your field?',
      validate: (...args) => {
        // response param does not exist in newer versions of inquirer
        const [input, response] = args as any;
        if ([FLOAT, DOUBLE, BIG_DECIMAL].includes(response.fieldType)) {
          return inputIsSignedDecimalNumber(input) ? true : 'Minimum must be a decimal number';
        }
        return inputIsSignedNumber(input) ? true : 'Minimum must be a number';
      },
      default: '0',
    },
    {
      when: response => response.fieldValidate === true && response.fieldValidateRules.includes('max'),
      type: 'input',
      name: 'fieldValidateRulesMax',
      message: 'What is the maximum of your field?',
      validate: (...args) => {
        // response param does not exist in newer versions of inquirer
        const [input, response] = args as any;
        if ([FLOAT, DOUBLE, BIG_DECIMAL].includes(response.fieldType)) {
          return inputIsSignedDecimalNumber(input) ? true : 'Maximum must be a decimal number';
        }
        return inputIsSignedNumber(input) ? true : 'Maximum must be a number';
      },
      default: '100',
    },
    {
      when: response =>
        response.fieldValidate === true &&
        response.fieldValidateRules.includes(MINBYTES) &&
        response.fieldType === BYTES &&
        response.fieldTypeBlobContent !== TEXT,
      type: 'input',
      name: 'fieldValidateRulesMinbytes',
      message: 'What is the minimum byte size of your field?',
      validate: input => (inputIsNumber(input) ? true : 'Minimum byte size must be a positive number'),
      default: '0',
    },
    {
      when: response =>
        response.fieldValidate === true &&
        response.fieldValidateRules.includes(MAXBYTES) &&
        response.fieldType === BYTES &&
        response.fieldTypeBlobContent !== TEXT,
      type: 'input',
      name: 'fieldValidateRulesMaxbytes',
      message: 'What is the maximum byte size of your field?',
      validate: input => (inputIsNumber(input) ? true : 'Maximum byte size must be a positive number'),
      default: '5000000',
    },
    {
      when: response => response.fieldValidate === true && response.fieldValidateRules.includes('pattern'),
      type: 'input',
      name: 'fieldValidateRulesPattern',
      message: 'What is the regular expression pattern you want to apply on your field?',
      default: '^[a-zA-Z0-9]*$',
    },
  ]);

  if ((answers as any).fieldIsEnum) {
    answers.fieldType = upperFirst(answers.fieldType);
    answers.fieldValues = answers.fieldValues.toUpperCase();
  }

  const field = {
    fieldName: answers.fieldName,
    fieldType: answers.enumType || answers.fieldType,
    fieldTypeBlobContent: answers.fieldTypeBlobContent,
    fieldValues: answers.fieldValues,
    fieldValidateRules: answers.fieldValidateRules,
    fieldValidateRulesMinlength: answers.fieldValidateRulesMinlength,
    fieldValidateRulesMaxlength: answers.fieldValidateRulesMaxlength,
    fieldValidateRulesPattern: answers.fieldValidateRulesPattern,
    fieldValidateRulesMin: answers.fieldValidateRulesMin,
    fieldValidateRulesMax: answers.fieldValidateRulesMax,
    fieldValidateRulesMinbytes: answers.fieldValidateRulesMinbytes,
    fieldValidateRulesMaxbytes: answers.fieldValidateRulesMaxbytes,
  } as any;

  this.entityConfig.fields = this.entityConfig.fields.concat(field);

  logFieldsAndRelationships.call(this);
  await askForField.call(this);
}

/**
 * ask question for a relationship creation
 */
async function askForRelationship(this: EntityGenerator, ...args: any[]) {
  const [{ application }] = args;
  const context = this.entityData;
  const name = context.name;
  this.log.log(chalk.green('\nGenerating relationships to other entities\n'));
  const addRelationshipAnswers = await this.prompt([
    {
      type: 'confirm',
      name: 'relationshipAdd',
      message: 'Do you want to add a relationship to another entity?',
      default: true,
    },
  ]);

  if (!addRelationshipAnswers.relationshipAdd) {
    logFieldsAndRelationships.call(this);
    this.log.log('\n');
    return;
  }

  const answers = await this.prompt([
    {
      type: 'list',
      name: 'otherEntityName',
      message: 'What is the other entity?',
      choices: () => [...this.getExistingEntityNames(), ...(application.generateBuiltInUserEntity ? ['User'] : [])],
    },
    {
      type: 'input',
      name: 'relationshipName',
      validate: input => {
        if (!/^([a-zA-Z0-9_]*)$/.test(input)) {
          return 'Your relationship cannot contain special characters';
        }
        if (input === '') {
          return 'Your relationship cannot be empty';
        }
        if (input.charAt(0) === input.charAt(0).toUpperCase()) {
          return 'Your relationship cannot start with an upper case letter';
        }
        if (input === 'id' || getFieldNameUndercored(this.entityConfig.fields).includes(snakeCase(input))) {
          return 'Your relationship cannot use an already existing field name';
        }
        if (isReservedTableName(input, 'JAVA')) {
          return 'Your relationship cannot contain a Java reserved keyword';
        }
        return true;
      },
      message: 'What is the name of the relationship?',
      default: response => lowerFirst(response.otherEntityName),
    },
    {
      type: 'list',
      name: 'relationshipType',
      message: 'What is the type of the relationship?',
      choices: response => [
        'many-to-one',
        'many-to-many',
        'one-to-one',
        ...(this.isBuiltInUser(response.otherEntityName) ? [] : ['one-to-many']),
      ],
      default: 0,
    },
    {
      when: response => application.databaseType === SQL && response.relationshipType === 'one-to-one',
      type: 'confirm',
      name: 'id',
      message: 'Do you want to use JPA Derived Identifier - @MapsId?',
      default: false,
    },
    {
      when: answers => {
        if (this.isBuiltInUser(answers.otherEntityName)) {
          answers.bidirectional = false;
          return false;
        }

        if (!application.databaseTypeNeo4j && answers.relationshipType !== 'many-to-one') {
          // Relationships requires bidirectional.
          answers.bidirectional = true;
          return false;
        }

        return true;
      },
      type: 'confirm',
      name: 'bidirectional',
      message: 'Do you want to generate a bidirectional relationship',
      default: true,
    },
    {
      when: response => response.bidirectional,
      type: 'input',
      name: 'otherEntityRelationshipName',
      message: 'What is the name of this relationship in the other entity?',
      default: () => lowerFirst(name),
    },
    {
      type: 'input',
      name: 'otherEntityField',
      message: response =>
        `When you display this relationship on client-side, which field from '${response.otherEntityName}' do you want to use? This field will be displayed as a String, so it cannot be a Blob`,
      default: answers => (answers.otherEntityName === 'User' ? 'login' : 'id'),
    },
    {
      when: response =>
        (response.otherEntityName.toLowerCase() !== context.name.toLowerCase() && response.relationshipType === 'many-to-one') ||
        response.relationshipType === 'many-to-many' ||
        response.relationshipType === 'one-to-one',
      type: 'confirm',
      name: 'relationshipValidate',
      message: 'Do you want to add any validation rules to this relationship?',
      default: false,
    },
    {
      when: response => response.relationshipValidate === true,
      type: 'checkbox',
      name: 'relationshipValidateRules',
      message: 'Which validation rules do you want to add?',
      choices: [
        {
          name: 'Required',
          value: REQUIRED,
        },
      ],
      default: [REQUIRED],
    },
  ]);

  const relationship = {
    relationshipSide: 'left',
    relationshipName: answers.relationshipName,
    otherEntityName: lowerFirst(answers.otherEntityName),
    relationshipType: answers.relationshipType,
    relationshipValidateRules: answers.relationshipValidateRules,
    otherEntityField: answers.otherEntityField,
    id: answers.id,
    otherEntityRelationshipName: answers.otherEntityRelationshipName,
  };

  if (this.isBuiltInUser(answers.otherEntityName)) {
    relationship.otherEntityRelationshipName = lowerFirst(name);
  }

  this.entityConfig.relationships = this.entityConfig.relationships.concat(relationship as any);

  await askForRelationship.call(this, ...args);
}

/**
 * Show the entity and it's fields and relationships in console
 */
function logFieldsAndRelationships(this: EntityGenerator) {
  const context = this.entityData;
  if (this.entityConfig.fields.length > 0 || this.entityConfig.relationships.length > 0) {
    this.log.log(chalk.red(chalk.white('\n================= ') + context.name + chalk.white(' =================')));
  }
  if (this.entityConfig.fields.length > 0) {
    this.log.log(chalk.white('Fields'));
    this.entityConfig.fields.forEach(field => {
      const validationDetails: string[] = [];
      const fieldValidate = isArray(field.fieldValidateRules) && field.fieldValidateRules.length >= 1;
      if (fieldValidate === true) {
        if (field.fieldValidateRules!.includes(REQUIRED)) {
          validationDetails.push(REQUIRED);
        }
        if (field.fieldValidateRules!.includes(UNIQUE)) {
          validationDetails.push(UNIQUE);
        }
        if (field.fieldValidateRules!.includes(MINLENGTH)) {
          validationDetails.push(`${MINLENGTH}='${field.fieldValidateRulesMinlength}'`);
        }
        if (field.fieldValidateRules!.includes(MAXLENGTH)) {
          validationDetails.push(`${MAXLENGTH}='${field.fieldValidateRulesMaxlength}'`);
        }
        if (field.fieldValidateRules!.includes(PATTERN)) {
          validationDetails.push(`${PATTERN}='${field.fieldValidateRulesPattern}'`);
        }
        if (field.fieldValidateRules!.includes(MIN)) {
          validationDetails.push(`${MIN}='${field.fieldValidateRulesMin}'`);
        }
        if (field.fieldValidateRules!.includes(MAX)) {
          validationDetails.push(`${MAX}='${field.fieldValidateRulesMax}'`);
        }
        if (field.fieldValidateRules!.includes(MINBYTES)) {
          validationDetails.push(`${MINBYTES}='${field.fieldValidateRulesMinbytes}'`);
        }
        if (field.fieldValidateRules!.includes(MAXBYTES)) {
          validationDetails.push(`${MAXBYTES}='${field.fieldValidateRulesMaxbytes}'`);
        }
      }
      this.log.log(
        chalk.red(field.fieldName) +
          chalk.white(` (${field.fieldType}${field.fieldTypeBlobContent ? ` ${field.fieldTypeBlobContent}` : ''}) `) +
          chalk.cyan(validationDetails.join(' ')),
      );
    });
    this.log.log();
  }
  if (this.entityConfig.relationships.length > 0) {
    this.log.log(chalk.white('Relationships'));
    this.entityConfig.relationships.forEach(relationship => {
      const validationDetails: string[] = [];
      if (relationship.relationshipValidateRules?.includes(REQUIRED)) {
        validationDetails.push(REQUIRED);
      }
      this.log.log(
        `${chalk.red(relationship.relationshipName)} ${chalk.white(`(${upperFirst(relationship.otherEntityName)})`)} ${chalk.cyan(
          relationship.relationshipType,
        )} ${chalk.cyan(validationDetails.join(' '))}`,
      );
    });
    this.log.log();
  }
}
