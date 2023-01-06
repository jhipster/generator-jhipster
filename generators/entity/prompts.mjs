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
import chalk from 'chalk';
import fs from 'fs';
import _ from 'lodash';
import {
  reservedKeywords,
  databaseTypes,
  applicationTypes,
  entityOptions,
  fieldTypes,
  validations,
  clientFrameworkTypes,
} from '../../jdl/jhipster/index.mjs';

const { isReservedPaginationWords, isReservedFieldName, isReservedTableName } = reservedKeywords;
const { CASSANDRA, SQL } = databaseTypes;
const { GATEWAY } = applicationTypes;
const { FilteringTypes, MapperTypes, ServiceTypes, PaginationTypes } = entityOptions;
const { ANGULAR, REACT } = clientFrameworkTypes;
const { JPA_METAMODEL } = FilteringTypes;
const NO_FILTERING = FilteringTypes.NO;
const { INFINITE_SCROLL, PAGINATION } = PaginationTypes;
const NO_PAGINATION = PaginationTypes.NO;
const { SERVICE_IMPL, SERVICE_CLASS } = ServiceTypes;
const NO_SERVICE = ServiceTypes.NO;
const { MAPSTRUCT } = MapperTypes;
const NO_MAPPER = MapperTypes.NO;

const NO_DATABASE = databaseTypes.NO;
const { CommonDBTypes, RelationalOnlyDBTypes, BlobTypes } = fieldTypes;

const { BIG_DECIMAL, BOOLEAN, DOUBLE, DURATION, ENUM, FLOAT, INTEGER, INSTANT, LOCAL_DATE, LONG, STRING, UUID, ZONED_DATE_TIME } =
  CommonDBTypes;
const { BYTES, BYTE_BUFFER } = RelationalOnlyDBTypes;
const { ANY, IMAGE, TEXT } = BlobTypes;

const {
  Validations: { PATTERN, MINBYTES, MAXBYTES, MINLENGTH, MAXLENGTH, MIN, MAX, REQUIRED, UNIQUE },
} = validations;

const prompts = {
  askForMicroserviceJson,
  askForUpdate,
  askForFields,
  askForFieldsToRemove,
  askForRelationships,
  askForRelationsToRemove,
  askForDTO,
  askForService,
  askForFiltering,
  askForReadOnly,
  askForPagination,
};

export default prompts;

const getFieldNameUndercored = fields =>
  ['id'].concat(
    fields.map(field => {
      return _.snakeCase(field.fieldName);
    })
  );

function askForMicroserviceJson() {
  const context = this.context;
  if (this.jhipsterConfig.applicationType !== GATEWAY || context.configExisted) {
    return undefined;
  }

  const databaseType = this.jhipsterConfig.databaseType;

  const prompts = [
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
  ];

  return this.prompt(prompts).then(answers => {
    if (answers.microservicePath) {
      this.log(chalk.green(`\nFound the ${context.filename} configuration file, entity can be automatically generated!\n`));
      context.microservicePath = this.entityConfig.microservicePath = answers.microservicePath;
    }
  });
}

function askForUpdate() {
  const context = this.context;
  // ask only if running an existing entity without arg option --force or --regenerate
  const isForce = this.options.force || context.regenerate;
  context.updateEntity = 'regenerate'; // default if skipping questions by --force
  if (isForce || !context.useConfigurationFile) {
    return undefined;
  }
  const prompts = [
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
  ];
  return this.prompt(prompts).then(props => {
    context.updateEntity = props.updateEntity;
    if (context.updateEntity === 'none') {
      throw new Error(chalk.green('Aborting entity update, no changes were made.'));
    }
  });
}

function askForFields() {
  const context = this.context;
  // don't prompt if data is imported from a file
  if (this.options.defaults || (context.useConfigurationFile && context.updateEntity !== 'add')) {
    return undefined;
  }

  if (context.updateEntity === 'add') {
    logFieldsAndRelationships.call(this);
  }

  return askForField.call(this);
}

function askForFieldsToRemove() {
  const context = this.context;
  // prompt only if data is imported from a file
  if (!context.useConfigurationFile || context.updateEntity !== 'remove' || this.entityConfig.fields.length === 0) {
    return undefined;
  }

  const prompts = [
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
  ];
  return this.prompt(prompts).then(props => {
    if (props.confirmRemove) {
      this.log(chalk.red(`\nRemoving fields: ${props.fieldsToRemove}\n`));
      const fields = this.entityConfig.fields;
      for (let i = fields.length - 1; i >= 0; i -= 1) {
        const field = this.entityConfig.fields[i];
        if (props.fieldsToRemove.filter(val => val === field.fieldName).length > 0) {
          fields.splice(i, 1);
        }
      }
      this.entityConfig.fields = fields;
    }
  });
}

function askForRelationships() {
  const context = this.context;
  if (this.options.defaults) {
    return undefined;
  }
  // don't prompt if data is imported from a file
  if (context.useConfigurationFile && context.updateEntity !== 'add') {
    return undefined;
  }
  if (context.databaseType === CASSANDRA) {
    return undefined;
  }

  return askForRelationship.call(this);
}

function askForRelationsToRemove() {
  const context = this.context;
  // prompt only if data is imported from a file
  if (!context.useConfigurationFile || context.updateEntity !== 'remove' || this.entityConfig.relationships.length === 0) {
    return undefined;
  }
  if (context.databaseType === CASSANDRA) {
    return undefined;
  }

  const prompts = [
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
  ];
  return this.prompt(prompts).then(props => {
    if (props.confirmRemove) {
      this.log(chalk.red(`\nRemoving relationships: ${props.relsToRemove}\n`));
      const relationships = this.entityConfig.relationships;
      for (let i = relationships.length - 1; i >= 0; i -= 1) {
        const rel = relationships[i];
        if (props.relsToRemove.filter(val => val === `${rel.relationshipName}:${rel.relationshipType}`).length > 0) {
          relationships.splice(i, 1);
        }
      }
      this.entityConfig.relationships = relationships;
    }
  });
}

function askForFiltering() {
  const context = this.context;
  // don't prompt if server is skipped, or the backend is not sql, or no service requested
  if (context.useConfigurationFile || context.skipServer || context.databaseType !== 'sql' || this.entityConfig.service === 'no') {
    return undefined;
  }
  const prompts = [
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
  ];
  return this.prompt(prompts).then(props => {
    this.entityConfig.jpaMetamodelFiltering = props.filtering === JPA_METAMODEL;
  });
}

function askForReadOnly() {
  const context = this.context;
  // don't prompt if data is imported from a file
  if (context.useConfigurationFile) {
    return undefined;
  }
  const prompts = [
    {
      type: 'confirm',
      name: 'readOnly',
      message: 'Is this entity read-only?',
      default: false,
    },
  ];
  return this.prompt(prompts).then(props => {
    this.entityConfig.readOnly = props.readOnly;
  });
}

function askForDTO() {
  const context = this.context;
  // don't prompt if data is imported from a file or server is skipped or if no service layer
  if (context.useConfigurationFile || context.skipServer || this.entityConfig.service === 'no') {
    return undefined;
  }
  const prompts = [
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
  ];
  return this.prompt(prompts).then(props => {
    this.entityConfig.dto = props.dto;
  });
}

function askForService() {
  const context = this.context;
  // don't prompt if data is imported from a file or server is skipped
  if (context.useConfigurationFile || context.skipServer) {
    return undefined;
  }
  const prompts = [
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
  ];
  return this.prompt(prompts).then(props => {
    this.entityConfig.service = props.service;
  });
}

function askForPagination() {
  const context = this.context;
  // don't prompt if data are imported from a file
  if (context.useConfigurationFile) {
    return undefined;
  }
  if (context.databaseType === CASSANDRA) {
    return undefined;
  }
  const prompts = [
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
  ];
  return this.prompt(prompts).then(props => {
    this.entityConfig.pagination = props.pagination;
    this.log(chalk.green('\nEverything is configured, generating the entity...\n'));
  });
}

/**
 * ask question for a field creation
 */
function askForField() {
  const context = this.context;
  this.log(chalk.green(`\nGenerating field #${this.entityConfig.fields.length + 1}\n`));
  const skipServer = context.skipServer;
  const databaseType = context.databaseType;
  const clientFramework = context.clientFramework;
  const possibleFiltering = databaseType === SQL && !context.reactive;
  const prompts = [
    {
      type: 'confirm',
      name: 'fieldAdd',
      message: 'Do you want to add a field to your entity?',
      default: true,
    },
    {
      when: response => response.fieldAdd === true,
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
        if (input === 'id' || getFieldNameUndercored(this.entityConfig.fields).includes(_.snakeCase(input))) {
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
      when: response => response.fieldAdd === true && (skipServer || ['sql', 'mongodb', 'neo4j', 'couchbase'].includes(databaseType)),
      type: 'list',
      name: 'fieldType',
      message: 'What is the type of your field?',
      choices: [
        {
          value: STRING,
          name: 'String',
        },
        {
          value: INTEGER,
          name: 'Integer',
        },
        {
          value: LONG,
          name: 'Long',
        },
        {
          value: FLOAT,
          name: 'Float',
        },
        {
          value: DOUBLE,
          name: 'Double',
        },
        {
          value: BIG_DECIMAL,
          name: 'BigDecimal',
        },
        {
          value: LOCAL_DATE,
          name: 'LocalDate',
        },
        {
          value: INSTANT,
          name: 'Instant',
        },
        {
          value: ZONED_DATE_TIME,
          name: 'ZonedDateTime',
        },
        {
          value: DURATION,
          name: 'Duration',
        },
        {
          value: BOOLEAN,
          name: 'Boolean',
        },
        {
          value: ENUM,
          name: 'Enumeration (Java enum type)',
        },
        {
          value: UUID,
          name: 'UUID',
        },
        {
          value: BYTES,
          name: '[BETA] Blob',
        },
      ],
      default: 0,
    },
    {
      when: response => {
        if (response.fieldType === ENUM) {
          response.fieldIsEnum = true;
          return true;
        }
        response.fieldIsEnum = false;
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
        if (context.enums && context.enums.includes(input)) {
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
      when: response => response.fieldIsEnum,
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
        if (_.uniq(enums).length !== enums.length) {
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
      message: answers => {
        if (!context.existingEnum) {
          return 'What are the values of your enumeration (separated by comma, no spaces)?';
        }
        return 'What are the new values of your enumeration (separated by comma, no spaces)?\nThe new values will replace the old ones.\nNothing will be done if there are no new values.';
      },
    },
    {
      when: response => response.fieldAdd === true && databaseType === CASSANDRA,
      type: 'list',
      name: 'fieldType',
      message: 'What is the type of your field?',
      choices: [
        {
          value: UUID,
          name: 'UUID',
        },
        {
          value: STRING,
          name: 'String',
        },
        {
          value: INTEGER,
          name: 'Integer',
        },
        {
          value: LONG,
          name: 'Long',
        },
        {
          value: FLOAT,
          name: 'Float',
        },
        {
          value: DOUBLE,
          name: 'Double',
        },
        {
          value: BIG_DECIMAL,
          name: 'BigDecimal',
        },
        {
          value: LOCAL_DATE,
          name: 'LocalDate',
        },
        {
          value: INSTANT,
          name: 'Instant',
        },
        {
          value: ZONED_DATE_TIME,
          name: 'ZonedDateTime',
        },
        {
          value: DURATION,
          name: 'Duration',
        },
        {
          value: ENUM,
          name: 'Enumeration (Java enum type)',
        },
        {
          value: BOOLEAN,
          name: 'Boolean',
        },
        {
          value: BYTE_BUFFER,
          name: '[BETA] blob',
        },
      ],
      default: 0,
    },
    {
      when: response => response.fieldAdd === true && response.fieldType === BYTES,
      type: 'list',
      name: 'fieldTypeBlobContent',
      message: 'What is the content of the Blob field?',
      choices: [
        {
          value: IMAGE,
          name: 'An image',
        },
        {
          value: ANY,
          name: 'A binary file',
        },
        {
          value: TEXT,
          name: 'A CLOB (Text field)',
        },
      ],
      default: 0,
    },
    {
      when: response => response.fieldAdd === true && response.fieldType === BYTE_BUFFER,
      type: 'list',
      name: 'fieldTypeBlobContent',
      message: 'What is the content of the Blob field?',
      choices: [
        {
          value: IMAGE,
          name: 'An image',
        },
        {
          value: ANY,
          name: 'A binary file',
        },
      ],
      default: 0,
    },
    {
      when: response => response.fieldAdd === true && response.fieldType !== BYTE_BUFFER,
      type: 'confirm',
      name: 'fieldValidate',
      message: 'Do you want to add validation rules to your field?',
      default: false,
    },
    {
      when: response => response.fieldAdd === true && response.fieldValidate === true,
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
          opts.push(
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
            }
          );
        } else if ([INTEGER, LONG, FLOAT, DOUBLE, BIG_DECIMAL].includes(response.fieldType)) {
          opts.push(
            {
              name: 'Minimum',
              value: MIN,
            },
            {
              name: 'Maximum',
              value: MAX,
            }
          );
        }
        return opts;
      },
      default: 0,
    },
    {
      when: response => response.fieldAdd === true && response.fieldValidate === true && response.fieldValidateRules.includes('minlength'),
      type: 'input',
      name: 'fieldValidateRulesMinlength',
      validate: input => (this.isNumber(input) ? true : 'Minimum length must be a positive number'),
      message: 'What is the minimum length of your field?',
      default: 0,
    },
    {
      when: response => response.fieldAdd === true && response.fieldValidate === true && response.fieldValidateRules.includes('maxlength'),
      type: 'input',
      name: 'fieldValidateRulesMaxlength',
      validate: input => (this.isNumber(input) ? true : 'Maximum length must be a positive number'),
      message: 'What is the maximum length of your field?',
      default: 20,
    },
    {
      when: response => response.fieldAdd === true && response.fieldValidate === true && response.fieldValidateRules.includes('min'),
      type: 'input',
      name: 'fieldValidateRulesMin',
      message: 'What is the minimum of your field?',
      validate: (input, response) => {
        if ([FLOAT, DOUBLE, BIG_DECIMAL].includes(response.fieldType)) {
          return this.isSignedDecimalNumber(input) ? true : 'Minimum must be a decimal number';
        }
        return this.isSignedNumber(input) ? true : 'Minimum must be a number';
      },
      default: 0,
    },
    {
      when: response => response.fieldAdd === true && response.fieldValidate === true && response.fieldValidateRules.includes('max'),
      type: 'input',
      name: 'fieldValidateRulesMax',
      message: 'What is the maximum of your field?',
      validate: (input, response) => {
        if ([FLOAT, DOUBLE, BIG_DECIMAL].includes(response.fieldType)) {
          return this.isSignedDecimalNumber(input) ? true : 'Maximum must be a decimal number';
        }
        return this.isSignedNumber(input) ? true : 'Maximum must be a number';
      },
      default: 100,
    },
    {
      when: response =>
        response.fieldAdd === true &&
        response.fieldValidate === true &&
        response.fieldValidateRules.includes(MINBYTES) &&
        response.fieldType === BYTES &&
        response.fieldTypeBlobContent !== TEXT,
      type: 'input',
      name: 'fieldValidateRulesMinbytes',
      message: 'What is the minimum byte size of your field?',
      validate: input => (this.isNumber(input) ? true : 'Minimum byte size must be a positive number'),
      default: 0,
    },
    {
      when: response =>
        response.fieldAdd === true &&
        response.fieldValidate === true &&
        response.fieldValidateRules.includes(MAXBYTES) &&
        response.fieldType === BYTES &&
        response.fieldTypeBlobContent !== TEXT,
      type: 'input',
      name: 'fieldValidateRulesMaxbytes',
      message: 'What is the maximum byte size of your field?',
      validate: input => (this.isNumber(input) ? true : 'Maximum byte size must be a positive number'),
      default: 5000000,
    },
    {
      when: response => response.fieldAdd === true && response.fieldValidate === true && response.fieldValidateRules.includes('pattern'),
      type: 'input',
      name: 'fieldValidateRulesPattern',
      message: 'What is the regular expression pattern you want to apply on your field?',
      default: '^[a-zA-Z0-9]*$',
    },
  ];
  return this.prompt(prompts).then(props => {
    if (props.fieldAdd) {
      if (props.fieldIsEnum) {
        props.fieldType = _.upperFirst(props.fieldType);
        props.fieldValues = props.fieldValues.toUpperCase();
      }

      const field = {
        fieldName: props.fieldName,
        fieldType: props.enumType || props.fieldType,
        fieldTypeBlobContent: props.fieldTypeBlobContent,
        fieldValues: props.fieldValues,
        fieldValidateRules: props.fieldValidateRules,
        fieldValidateRulesMinlength: props.fieldValidateRulesMinlength,
        fieldValidateRulesMaxlength: props.fieldValidateRulesMaxlength,
        fieldValidateRulesPattern: props.fieldValidateRulesPattern,
        fieldValidateRulesMin: props.fieldValidateRulesMin,
        fieldValidateRulesMax: props.fieldValidateRulesMax,
        fieldValidateRulesMinbytes: props.fieldValidateRulesMinbytes,
        fieldValidateRulesMaxbytes: props.fieldValidateRulesMaxbytes,
      };

      this.entityConfig.fields = this.entityConfig.fields.concat(field);
    }
    logFieldsAndRelationships.call(this);
    if (props.fieldAdd) {
      return askForField.call(this);
    }
    return undefined;
  });
}

/**
 * ask question for a relationship creation
 */
function askForRelationship() {
  const context = this.context;
  const name = context.name;
  this.log(chalk.green('\nGenerating relationships to other entities\n'));
  const prompts = [
    {
      type: 'confirm',
      name: 'relationshipAdd',
      message: 'Do you want to add a relationship to another entity?',
      default: true,
    },
    {
      when: response => response.relationshipAdd === true,
      type: 'input',
      name: 'otherEntityName',
      validate: input => {
        if (!/^([a-zA-Z0-9_]*)$/.test(input)) {
          return 'Your other entity name cannot contain special characters';
        }
        if (input === '') {
          return 'Your other entity name cannot be empty';
        }
        if (isReservedTableName(input, 'JAVA')) {
          return 'Your other entity name cannot contain a Java reserved keyword';
        }
        if (input.toLowerCase() === 'user' && context.applicationType === 'microservice') {
          return "Your entity cannot have a relationship with User because it's a gateway entity";
        }
        return true;
      },
      message: 'What is the name of the other entity?',
    },
    {
      when: response => response.relationshipAdd === true,
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
        if (input === 'id' || getFieldNameUndercored(this.entityConfig.fields).includes(_.snakeCase(input))) {
          return 'Your relationship cannot use an already existing field name';
        }
        if (isReservedTableName(input, 'JAVA')) {
          return 'Your relationship cannot contain a Java reserved keyword';
        }
        return true;
      },
      message: 'What is the name of the relationship?',
      default: response => _.lowerFirst(response.otherEntityName),
    },
    {
      when: response => response.relationshipAdd === true,
      type: 'list',
      name: 'relationshipType',
      message: 'What is the type of the relationship?',
      choices: response => {
        const opts = [
          {
            value: 'many-to-one',
            name: 'many-to-one',
          },
          {
            value: 'many-to-many',
            name: 'many-to-many',
          },
          {
            value: 'one-to-one',
            name: 'one-to-one',
          },
        ];
        if (!this.isBuiltInUser(response.otherEntityName)) {
          opts.unshift({
            value: 'one-to-many',
            name: 'one-to-many',
          });
        }
        return opts;
      },
      default: 0,
    },
    {
      when: response =>
        response.relationshipAdd === true &&
        response.otherEntityName.toLowerCase() !== 'user' &&
        (response.relationshipType === 'many-to-many' || response.relationshipType === 'one-to-one'),
      type: 'confirm',
      name: 'ownerSide',
      message: 'Is this entity the owner of the relationship?',
      default: false,
    },
    {
      when: response =>
        context.databaseType === SQL &&
        response.relationshipAdd === true &&
        response.relationshipType === 'one-to-one' &&
        (response.ownerSide === true || response.otherEntityName.toLowerCase() === 'user'),
      type: 'confirm',
      name: 'id',
      message: 'Do you want to use JPA Derived Identifier - @MapsId?',
      default: false,
    },
    {
      when: response =>
        response.relationshipAdd === true &&
        (response.relationshipType === 'one-to-many' ||
          ((response.relationshipType === 'many-to-many' || response.relationshipType === 'one-to-one') &&
            !this.isBuiltInUser(response.otherEntityName))),
      type: 'input',
      name: 'otherEntityRelationshipName',
      message: 'What is the name of this relationship in the other entity?',
      default: response => _.lowerFirst(name),
    },
    {
      when: response =>
        response.relationshipAdd === true &&
        response.otherEntityName.toLowerCase() !== 'user' &&
        (response.relationshipType === 'many-to-one' ||
          (response.relationshipType === 'many-to-many' && response.ownerSide === true) ||
          (response.relationshipType === 'one-to-one' && response.ownerSide === true)),
      type: 'input',
      name: 'otherEntityField',
      message: response =>
        `When you display this relationship on client-side, which field from '${response.otherEntityName}' do you want to use? This field will be displayed as a String, so it cannot be a Blob`,
      default: 'id',
    },
    {
      when: response =>
        response.relationshipAdd === true &&
        response.otherEntityName.toLowerCase() !== context.name.toLowerCase() &&
        (response.relationshipType === 'many-to-one' ||
          (response.relationshipType === 'many-to-many' &&
            (response.ownerSide === true || response.otherEntityName.toLowerCase() === 'user')) ||
          (response.relationshipType === 'one-to-one' &&
            (response.ownerSide === true || response.otherEntityName.toLowerCase() === 'user'))),
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
      default: 0,
    },
  ];
  return this.prompt(prompts).then(props => {
    if (props.relationshipAdd) {
      const relationship = {
        relationshipName: props.relationshipName,
        otherEntityName: _.lowerFirst(props.otherEntityName),
        relationshipType: props.relationshipType,
        relationshipValidateRules: props.relationshipValidateRules,
        otherEntityField: props.otherEntityField,
        ownerSide: props.ownerSide,
        id: props.id,
        otherEntityRelationshipName: props.otherEntityRelationshipName,
      };

      if (props.otherEntityName.toLowerCase() === 'user') {
        relationship.ownerSide = true;
        relationship.otherEntityField = 'login';
        relationship.otherEntityRelationshipName = _.lowerFirst(name);
      }

      this.entityConfig.relationships = this.entityConfig.relationships.concat(relationship);
    }
    logFieldsAndRelationships.call(this);
    if (props.relationshipAdd) {
      return askForRelationship.call(this);
    }
    this.log('\n');
    return undefined;
  });
}

/**
 * Show the entity and it's fields and relationships in console
 */
function logFieldsAndRelationships() {
  const context = this.context;
  if (this.entityConfig.fields.length > 0 || this.entityConfig.relationships.length > 0) {
    this.log(chalk.red(chalk.white('\n================= ') + context.name + chalk.white(' =================')));
  }
  if (this.entityConfig.fields.length > 0) {
    this.log(chalk.white('Fields'));
    this.entityConfig.fields.forEach(field => {
      const validationDetails = [];
      const fieldValidate = _.isArray(field.fieldValidateRules) && field.fieldValidateRules.length >= 1;
      if (fieldValidate === true) {
        if (field.fieldValidateRules.includes(REQUIRED)) {
          validationDetails.push(REQUIRED);
        }
        if (field.fieldValidateRules.includes(UNIQUE)) {
          validationDetails.push(UNIQUE);
        }
        if (field.fieldValidateRules.includes(MINLENGTH)) {
          validationDetails.push(`${MINLENGTH}='${field.fieldValidateRulesMinlength}'`);
        }
        if (field.fieldValidateRules.includes(MAXLENGTH)) {
          validationDetails.push(`${MAXLENGTH}='${field.fieldValidateRulesMaxlength}'`);
        }
        if (field.fieldValidateRules.includes(PATTERN)) {
          validationDetails.push(`${PATTERN}='${field.fieldValidateRulesPattern}'`);
        }
        if (field.fieldValidateRules.includes(MIN)) {
          validationDetails.push(`${MIN}='${field.fieldValidateRulesMin}'`);
        }
        if (field.fieldValidateRules.includes(MAX)) {
          validationDetails.push(`${MAX}='${field.fieldValidateRulesMax}'`);
        }
        if (field.fieldValidateRules.includes(MINBYTES)) {
          validationDetails.push(`${MINBYTES}='${field.fieldValidateRulesMinbytes}'`);
        }
        if (field.fieldValidateRules.includes(MAXBYTES)) {
          validationDetails.push(`${MAXBYTES}='${field.fieldValidateRulesMaxbytes}'`);
        }
      }
      this.log(
        chalk.red(field.fieldName) +
          chalk.white(` (${field.fieldType}${field.fieldTypeBlobContent ? ` ${field.fieldTypeBlobContent}` : ''}) `) +
          chalk.cyan(validationDetails.join(' '))
      );
    });
    this.log();
  }
  if (this.entityConfig.relationships.length > 0) {
    this.log(chalk.white('Relationships'));
    this.entityConfig.relationships.forEach(relationship => {
      const validationDetails = [];
      if (relationship.relationshipValidateRules && relationship.relationshipValidateRules.includes(REQUIRED)) {
        validationDetails.push(REQUIRED);
      }
      this.log(
        `${chalk.red(relationship.relationshipName)} ${chalk.white(`(${_.upperFirst(relationship.otherEntityName)})`)} ${chalk.cyan(
          relationship.relationshipType
        )} ${chalk.cyan(validationDetails.join(' '))}`
      );
    });
    this.log();
  }
}
