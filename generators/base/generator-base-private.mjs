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
import { rmSync, statSync } from 'fs';
import path from 'path';
import _ from 'lodash';
import Generator from 'yeoman-generator';
import chalk from 'chalk';
import shelljs from 'shelljs';
import semver from 'semver';
import https from 'https';

import { databaseTypes, buildToolTypes, fieldTypes, validations, clientFrameworkTypes } from '../../jdl/jhipster/index.mjs';

import { packageJson } from '../../lib/index.mjs';
import { getJavadoc } from '../utils.mjs';
import { stringify } from '../../utils/index.mjs';
import { fieldIsEnum } from '../../utils/field.mjs';
import { databaseData } from '../sql/support/index.mjs';
import { getDBTypeFromDBValue } from '../server/support/database.mjs';

const { ANGULAR, REACT, VUE } = clientFrameworkTypes;
const dbTypes = fieldTypes;
const {
  Validations: { REQUIRED },
} = validations;

const {
  STRING: TYPE_STRING,
  INTEGER: TYPE_INTEGER,
  LONG: TYPE_LONG,
  BIG_DECIMAL: TYPE_BIG_DECIMAL,
  FLOAT: TYPE_FLOAT,
  DOUBLE: TYPE_DOUBLE,
  UUID: TYPE_UUID,
  BOOLEAN: TYPE_BOOLEAN,
  LOCAL_DATE: TYPE_LOCAL_DATE,
  ZONED_DATE_TIME: TYPE_ZONED_DATE_TIME,
  INSTANT: TYPE_INSTANT,
  DURATION: TYPE_DURATION,
} = dbTypes.CommonDBTypes;

const TYPE_BYTES = dbTypes.RelationalOnlyDBTypes.BYTES;
const TYPE_BYTE_BUFFER = dbTypes.RelationalOnlyDBTypes.BYTE_BUFFER;

const { MONGODB, NEO4J, COUCHBASE, CASSANDRA, SQL } = databaseTypes;

const { MAVEN } = buildToolTypes;

/**
 * @typedef {import('./api.mjs').JHipsterGeneratorOptions} JHipsterGeneratorOptions
 */

/**
 * @typedef {import('./api.mjs').JHipsterGeneratorFeatures} JHipsterGeneratorFeatures
 */

/**
 * This is the Generator base private class.
 * This provides all the private API methods used internally.
 * These methods should not be directly utilized using commonJS require,
 * as these can have breaking changes without a major version bump
 *
 * The method signatures in private API can be changed without a major version change.
 * @class
 * @extends {Generator<JHipsterGeneratorOptions>}
 */
export default class PrivateBase extends Generator {
  /**
   * @param {string | string[]} args
   * @param {JHipsterGeneratorOptions} options
   * @param {JHipsterGeneratorFeatures} features
   */
  constructor(args, options, features) {
    super(args, options, features);
    if (!this.options.sharedData) {
      // Make sure sharedData is loaded.
      // Tests that instantiates the Generator direcly 'options.sharedData' may be missing.
      this.options.sharedData = this.env.sharedOptions.sharedData;
    }
    // expose lodash to templates
    this._ = _;
  }

  /**
   * Add getTaskNames to types
   * @returns {string[]}
   */
  getTaskNames() {
    return super.getTaskNames();
  }

  /**
   * Add features to types
   * @returns {JHipsterGeneratorFeatures}
   */
  get features() {
    return super.features;
  }

  /**
   * @param {JHipsterGeneratorFeatures} features
   */
  set features(features) {
    super.features = features;
  }

  /**
   * Normalizes a command across OS and spawns it (asynchronously).
   *
   * @param {string} command The program to execute.
   * @param {string[]} args A list of arguments to pass to the program.
   * @param {import('child_process').SpawnOptions} [opt] Any cross-spawn options.
   * @returns {import('execa').ExecaChildProcess<string>}
   */
  spawnCommand(command, args, opt) {
    return super.spawnCommand(command, args, opt);
  }

  /* ======================================================================== */
  /* private methods use within generator (not exposed to modules) */
  /* ======================================================================== */

  /**
   * Override yeoman generator's usage function to fine tune --help message.
   */
  usage() {
    return super.usage().replace('yo jhipster:', 'jhipster ');
  }

  /**
   * Remove File
   *
   * @param file
   */
  removeFile(file) {
    file = this.destinationPath(file);
    if (file && shelljs.test('-f', file)) {
      this.log(`Removing the file - ${file}`);
      shelljs.rm(file);
    }
  }

  /**
   * Remove Folder
   *
   * @param folder
   */
  removeFolder(folder) {
    folder = this.destinationPath(folder);
    try {
      if (statSync(folder).isDirectory()) {
        rmSync(folder, { recursive: true });
      }
    } catch (error) {
      this.log(`Could not remove folder ${folder}`);
    }
  }

  /**
   * @private
   * Execute a git mv.
   *
   * @param {string} source
   * @param {string} dest
   * @returns {boolean} true if success; false otherwise
   */
  gitMove(source, dest) {
    source = this.destinationPath(source);
    dest = this.destinationPath(dest);
    if (source && dest && shelljs.test('-f', source)) {
      this.info(`Renaming the file - ${source} to ${dest}`);
      return !shelljs.exec(`git mv -f ${source} ${dest}`).code;
    }
    return true;
  }

  /**
   * @returns default app name
   */
  getDefaultAppName() {
    if (this.options.reproducible) {
      return 'jhipster';
    }
    return /^[a-zA-Z0-9_-]+$/.test(path.basename(process.cwd()))
      ? path.basename(process.cwd()).replace('generator-jhipster-', '')
      : 'jhipster';
  }

  /**
   * @private
   * Format As Class Javadoc
   *
   * @param {string} text - text to format
   * @returns class javadoc
   */
  formatAsClassJavadoc(text) {
    return getJavadoc(text, 0);
  }

  /**
   * @private
   * Format As Field Javadoc
   *
   * @param {string} text - text to format
   * @returns field javadoc
   */
  formatAsFieldJavadoc(text) {
    return getJavadoc(text, 4);
  }

  /**
   * @private
   * Format As Api Description
   *
   * @param {string} text - text to format
   * @returns formatted api description
   */
  formatAsApiDescription(text) {
    if (!text) {
      return text;
    }
    const rows = text.split('\n');
    let description = this.formatLineForJavaStringUse(rows[0]);
    for (let i = 1; i < rows.length; i++) {
      // discard empty rows
      if (rows[i].trim() !== '') {
        // if simple text then put space between row strings
        if (!description.endsWith('>') && !rows[i].startsWith('<')) {
          description += ' ';
        }
        description += this.formatLineForJavaStringUse(rows[i]);
      }
    }
    return description;
  }

  /**
   * @private
   */
  formatLineForJavaStringUse(text) {
    if (!text) {
      return text;
    }
    return text.replace(/"/g, '\\"');
  }

  /**
   * @private
   * Format As Liquibase Remarks
   *
   * @param {string} text - text to format
   * @param {boolean} addRemarksTag - add remarks tag
   * @returns formatted liquibase remarks
   */
  formatAsLiquibaseRemarks(text, addRemarksTag = false) {
    if (!text) {
      return addRemarksTag ? '' : text;
    }
    const rows = text.split('\n');
    let description = rows[0];
    for (let i = 1; i < rows.length; i++) {
      // discard empty rows
      if (rows[i].trim() !== '') {
        // if simple text then put space between row strings
        if (!description.endsWith('>') && !rows[i].startsWith('<')) {
          description += ' ';
        }
        description += rows[i];
      }
    }
    // escape & to &amp;
    description = description.replace(/&/g, '&amp;');
    // escape " to &quot;
    description = description.replace(/"/g, '&quot;');
    // escape ' to &apos;
    description = description.replace(/'/g, '&apos;');
    // escape < to &lt;
    description = description.replace(/</g, '&lt;');
    // escape > to &gt;
    description = description.replace(/>/g, '&gt;');
    return addRemarksTag ? ` remarks="${description}"` : description;
  }

  /**
   * @private
   * Parse creationTimestamp option
   * @returns {number} representing the milliseconds elapsed since January 1, 1970, 00:00:00 UTC
   *                   obtained by parsing the given string representation of the creationTimestamp.
   */
  parseCreationTimestamp(creationTimestampOption = this.options.creationTimestamp) {
    let creationTimestamp;
    if (creationTimestampOption) {
      creationTimestamp = Date.parse(creationTimestampOption);
      if (!creationTimestamp) {
        this.warning(`Error parsing creationTimestamp ${creationTimestampOption}.`);
      } else if (creationTimestamp > new Date().getTime()) {
        throw new Error(`Creation timestamp should not be in the future: ${creationTimestampOption}.`);
      }
    }
    return creationTimestamp;
  }

  /**
   * @private
   * @param {any} input input
   * @returns {boolean} true if input is number; false otherwise
   */
  isNumber(input) {
    return !isNaN(this.filterNumber(input));
  }

  /**
   * @private
   * @param {any} input input
   * @returns {boolean} true if input is a signed number; false otherwise
   */
  isSignedNumber(input) {
    return !isNaN(this.filterNumber(input, true));
  }

  /**
   * @private
   * @param {any} input input
   * @returns {boolean} true if input is a signed decimal number; false otherwise
   */
  isSignedDecimalNumber(input) {
    return !isNaN(this.filterNumber(input, true, true));
  }

  /**
   * @private
   * Filter Number
   *
   * @param {string} input - input to filter
   * @param isSigned - flag indicating whether to check for signed number or not
   * @param isDecimal - flag indicating whether to check for decimal number or not
   * @returns {number} parsed number if valid input; <code>NaN</code> otherwise
   */
  filterNumber(input, isSigned, isDecimal) {
    const signed = isSigned ? '(\\-|\\+)?' : '';
    const decimal = isDecimal ? '(\\.[0-9]+)?' : '';
    const regex = new RegExp(`^${signed}([0-9]+${decimal})$`);

    if (regex.test(input)) return Number(input);

    return NaN;
  }

  /**
   * @private
   * Get Option From Array
   *
   * @param {Array} array - array
   * @param {any} option - options
   * @returns {boolean} true if option is in array and is set to 'true'
   */
  getOptionFromArray(array, option) {
    let optionValue = false;
    array.forEach(value => {
      if (_.includes(value, option)) {
        optionValue = value.split(':')[1];
      }
    });
    optionValue = optionValue === 'true' ? true : optionValue;
    return optionValue;
  }

  /**
   * @private
   * Function to issue a https get request, and process the result
   *
   *  @param {string} url - the url to fetch
   *  @param {function} onSuccess - function, which gets called when the request succeeds, with the body of the response
   *  @param {function} onFail - callback when the get failed.
   */
  httpsGet(url, onSuccess, onFail) {
    https
      .get(url, res => {
        let body = '';
        res.on('data', chunk => {
          body += chunk;
        });
        res.on('end', () => {
          onSuccess(body);
        });
      })
      .on('error', onFail);
  }

  /**
   * @private
   * Strip margin indicated by pipe `|` from a string literal
   *
   *  @param {string} content - the string to process
   */
  stripMargin(content) {
    return content.replace(/^[ ]*\|/gm, '');
  }

  /**
   * Print a debug message.
   *
   * @param {string} msg - message to print
   * @param {string[]} args - arguments to print
   */
  debug(msg, ...args) {
    const formattedMsg = `${chalk.yellow.bold('DEBUG!')} ${msg}`;
    if ((this.configOptions && this.configOptions.isDebugEnabled) || (this.options && this.options.debug)) {
      this.log(formattedMsg);
      args.forEach(arg => this.log(arg));
    }
    if (this._debug && this._debug.enabled) {
      this._debug(formattedMsg);
      args.forEach(arg => this._debug(arg));
    }
  }

  /**
   * @private
   * Check if Node is installed
   */
  checkNode() {
    if (this.skipChecks) return;
    const nodeFromPackageJson = packageJson.engines.node;
    if (!semver.satisfies(process.version, nodeFromPackageJson)) {
      this.warning(
        `Your NodeJS version is too old (${process.version}). You should use at least NodeJS ${chalk.bold(nodeFromPackageJson)}`
      );
    }
    if (!(process.release || {}).lts) {
      this.warning(
        'Your Node version is not LTS (Long Term Support), use it at your own risk! JHipster does not support non-LTS releases, so if you encounter a bug, please use a LTS version first.'
      );
    }
  }

  /**
   * @private
   * Generate Entity Client Field Default Values
   *
   * @param {Array|Object} fields - array of fields
   * @param [clientFramework]
   * @returns {Array} defaultVariablesValues
   */
  generateEntityClientFieldDefaultValues(fields, clientFramework = ANGULAR) {
    const defaultVariablesValues = {};
    fields.forEach(field => {
      const fieldType = field.fieldType;
      const fieldName = field.fieldName;
      if (fieldType === TYPE_BOOLEAN) {
        if (clientFramework === REACT) {
          defaultVariablesValues[fieldName] = `${fieldName}: false,`;
        } else {
          defaultVariablesValues[fieldName] = `this.${fieldName} = this.${fieldName} ?? false;`;
        }
      }
    });
    return defaultVariablesValues;
  }

  /**
   * @private
   * Find key type for Typescript
   *
   * @param {string | object} primaryKey - primary key definition
   * @returns {string} primary key type in Typescript
   */
  getTypescriptKeyType(primaryKey) {
    if (typeof primaryKey === 'object') {
      primaryKey = primaryKey.type;
    }
    if ([TYPE_INTEGER, TYPE_LONG, TYPE_FLOAT, TYPE_DOUBLE, TYPE_BIG_DECIMAL].includes(primaryKey)) {
      return 'number';
    }
    return 'string';
  }

  /**
   * @private
   * Find type for Typescript
   *
   * @param {string} fieldType - field type
   * @returns {string} field type in Typescript
   */
  getTypescriptType(fieldType) {
    if ([TYPE_INTEGER, TYPE_LONG, TYPE_FLOAT, TYPE_DOUBLE, TYPE_BIG_DECIMAL].includes(fieldType)) {
      return 'number';
    }
    if ([TYPE_LOCAL_DATE, TYPE_ZONED_DATE_TIME, TYPE_INSTANT].includes(fieldType)) {
      return 'dayjs.Dayjs';
    }
    if ([TYPE_BOOLEAN].includes(fieldType)) {
      return 'boolean';
    }
    if (fieldIsEnum(fieldType)) {
      return fieldType;
    }
    return 'string';
  }

  /**
   * @private
   * Generate Entity Client Field Declarations
   *
   * @param {string} primaryKey - primary key definition
   * @param {Array|Object} fields - array of fields
   * @param {Array|Object} relationships - array of relationships
   * @param {string} dto - dto
   * @param [customDateType]
   * @param {boolean} embedded - either the actual entity is embedded or not
   * @returns variablesWithTypes: Array
   */
  generateEntityClientFields(primaryKey, fields, relationships, dto, customDateType = 'dayjs.Dayjs', embedded = false) {
    const variablesWithTypes = [];
    if (!embedded && primaryKey) {
      const tsKeyType = this.getTypescriptKeyType(primaryKey);
      if (this.jhipsterConfig.clientFramework === VUE) {
        variablesWithTypes.push(`id?: ${tsKeyType}`);
      }
    }
    fields.forEach(field => {
      const fieldType = field.fieldType;
      const fieldName = field.fieldName;
      const nullable = !field.id && field.nullable;
      let tsType = 'any';
      if (field.fieldIsEnum) {
        tsType = fieldType;
      } else if (fieldType === TYPE_BOOLEAN) {
        tsType = 'boolean';
      } else if ([TYPE_INTEGER, TYPE_LONG, TYPE_FLOAT, TYPE_DOUBLE, TYPE_BIG_DECIMAL].includes(fieldType)) {
        tsType = 'number';
      } else if ([TYPE_STRING, TYPE_UUID, TYPE_DURATION, TYPE_BYTES, TYPE_BYTE_BUFFER].includes(fieldType)) {
        tsType = 'string';
        if ([TYPE_BYTES, TYPE_BYTE_BUFFER].includes(fieldType) && field.fieldTypeBlobContent !== 'text') {
          variablesWithTypes.push(`${fieldName}ContentType?: ${nullable ? 'string | null' : 'string'}`);
        }
      } else if ([TYPE_LOCAL_DATE, TYPE_INSTANT, TYPE_ZONED_DATE_TIME].includes(fieldType)) {
        tsType = customDateType;
      }
      if (nullable) {
        tsType += ' | null';
      }
      variablesWithTypes.push(`${fieldName}?: ${tsType}`);
    });

    relationships.forEach(relationship => {
      let fieldType;
      let fieldName;
      const nullable = !relationship.relationshipValidateRules || !relationship.relationshipValidateRules.includes(REQUIRED);
      const relationshipType = relationship.relationshipType;
      if (relationshipType === 'one-to-many' || relationshipType === 'many-to-many') {
        fieldType = `I${relationship.otherEntityAngularName}[]`;
        fieldName = relationship.relationshipFieldNamePlural;
      } else {
        fieldType = `I${relationship.otherEntityAngularName}`;
        fieldName = relationship.relationshipFieldName;
      }
      if (nullable) {
        fieldType += ' | null';
      }
      variablesWithTypes.push(`${fieldName}?: ${fieldType}`);
    });
    return variablesWithTypes;
  }

  /**
   * @private
   * Generate Entity Client Imports
   *
   * @param {Array|Object} relationships - array of relationships
   * @param {string} dto - dto
   * @param {string} clientFramework the client framework, 'angular' or 'react'.
   * @returns typeImports: Map
   */
  generateEntityClientImports(relationships, dto, clientFramework = this.clientFramework) {
    const typeImports = new Map();
    relationships.forEach(relationship => {
      const otherEntityAngularName = relationship.otherEntityAngularName;
      const importType = `I${otherEntityAngularName}`;
      let importPath;
      if (relationship.otherEntity?.builtInUser) {
        importPath = clientFramework === ANGULAR ? 'app/entities/user/user.model' : 'app/shared/model/user.model';
      } else {
        importPath =
          clientFramework === ANGULAR
            ? `app/entities/${relationship.otherEntityClientRootFolder}${relationship.otherEntityFolderName}/${relationship.otherEntityFileName}.model`
            : `app/shared/model/${relationship.otherEntityClientRootFolder}${relationship.otherEntityFileName}.model`;
      }
      typeImports.set(importType, importPath);
    });
    return typeImports;
  }

  /**
   * @private
   * Generate Entity Client Enum Imports
   *
   * @param {Array|Object} fields - array of the entity fields
   * @param {string} clientFramework the client framework, 'angular' or 'react'.
   * @returns typeImports: Map
   */
  generateEntityClientEnumImports(fields, clientFramework = this.clientFramework) {
    const typeImports = new Map();
    const uniqueEnums = {};
    fields.forEach(field => {
      const { enumFileName, fieldType } = field;
      if (field.fieldIsEnum && (!uniqueEnums[fieldType] || (uniqueEnums[fieldType] && field.fieldValues.length !== 0))) {
        const importType = `${fieldType}`;
        const basePath = clientFramework === VUE ? '@' : 'app';
        const modelPath = clientFramework === ANGULAR ? 'entities' : 'shared/model';
        const importPath = `${basePath}/${modelPath}/enumerations/${enumFileName}.model`;
        uniqueEnums[fieldType] = field.fieldType;
        typeImports.set(importType, importPath);
      }
    });
    return typeImports;
  }

  /**
   * @private
   * Get DB type from DB value
   * @param {string} db - db
   */
  getDBTypeFromDBValue(db) {
    return getDBTypeFromDBValue(db);
  }

  /**
   * @private
   * Get build directory used by buildTool
   * @param {string} buildTool - buildTool
   */
  getBuildDirectoryForBuildTool(buildTool) {
    return buildTool === MAVEN ? 'target/' : 'build/';
  }

  /**
   * @private
   * Get resource build directory used by buildTool
   * @param {string} buildTool - buildTool
   */
  getResourceBuildDirectoryForBuildTool(buildTool) {
    return buildTool === MAVEN ? 'target/classes/' : 'build/resources/main/';
  }

  /**
   * @private
   * Generate language objects in array of "'en': { name: 'English' }" format
   * @param {string[]} languages
   * @param clientFramework
   * @returns generated language options
   */
  generateLanguageOptions(languages, clientFramework) {
    const selectedLangs = this.getAllSupportedLanguageOptions().filter(lang => languages.includes(lang.value));
    if (clientFramework === REACT) {
      return selectedLangs.map(lang => `'${lang.value}': { name: '${lang.dispName}'${lang.rtl ? ', rtl: true' : ''} }`);
    }

    return selectedLangs.map(lang => `'${lang.value}': { name: '${lang.dispName}'${lang.rtl ? ', rtl: true' : ''} }`);
  }

  /**
   * @private
   * Check if language should be skipped for locale setting
   * @param {string} language
   */
  skipLanguageForLocale(language) {
    const out = this.getAllSupportedLanguageOptions().filter(lang => language === lang.value);
    return out && out[0] && !!out[0].skipForLocale;
  }

  /**
   * @private
   * Return the method name which converts the filter to specification
   * @param {string} fieldType
   */
  getSpecificationBuilder(fieldType) {
    if (
      [
        TYPE_INTEGER,
        TYPE_LONG,
        TYPE_FLOAT,
        TYPE_DOUBLE,
        TYPE_BIG_DECIMAL,
        TYPE_LOCAL_DATE,
        TYPE_ZONED_DATE_TIME,
        TYPE_INSTANT,
        TYPE_DURATION,
      ].includes(fieldType)
    ) {
      return 'buildRangeSpecification';
    }
    if (fieldType === TYPE_STRING) {
      return 'buildStringSpecification';
    }
    return 'buildSpecification';
  }

  /**
   * @private
   * @param {string} fieldType
   * @returns {boolean} true if type is filterable; false otherwise.
   */
  isFilterableType(fieldType) {
    return ![TYPE_BYTES, TYPE_BYTE_BUFFER].includes(fieldType);
  }

  /**
   * @private
   * Rebuild client for Angular
   */
  rebuildClient() {
    const done = this.async();
    this.log(`\n${chalk.bold.green('Running `webapp:build` to update client app\n')}`);
    this.spawnCommand(this.clientPackageManager, ['run', 'webapp:build']).on('close', () => {
      done();
    });
  }

  /**
   * @private
   * Generate a primary key, according to the type
   *
   * @param {any} primaryKey - primary key definition
   * @param {number} index - the index of the primary key, currently it's possible to generate 2 values, index = 0 - first key (default), otherwise second key
   * @param {boolean} [wrapped=true] - wrapped values for required types.
   */
  generateTestEntityId(primaryKey, index = 0, wrapped = true) {
    if (typeof primaryKey === 'object') {
      primaryKey = primaryKey.type;
    }
    let value;
    if (primaryKey === TYPE_STRING) {
      value = index === 0 ? 'ABC' : 'CBA';
    } else if (primaryKey === TYPE_UUID) {
      value = index === 0 ? '9fec3727-3421-4967-b213-ba36557ca194' : '1361f429-3817-4123-8ee3-fdf8943310b2';
    } else {
      value = index === 0 ? 123 : 456;
    }
    if (wrapped && [TYPE_UUID, TYPE_STRING].includes(primaryKey)) {
      return `'${value}'`;
    }
    return value;
  }

  /**
   * @private
   * Generate a test entity, according to the type
   *
   * @param {any} primaryKey - primary key definition.
   * @param {number} [index] - index of the primary key sample, pass undefined for a random key.
   */
  generateTestEntityPrimaryKey(primaryKey, index) {
    return JSON.stringify(
      this.generateTestEntity(
        primaryKey.fields.map(f => f.reference),
        index
      )
    );
  }

  /**
   * @private
   * Generate a test entity, according to the references
   *
   * @param references
   * @param additionalFields
   * @return {String} test sample
   */
  generateTypescriptTestEntity(references, additionalFields = {}) {
    const entries = references
      .map(reference => {
        if (reference.field) {
          const field = reference.field;
          const { fieldIsEnum, fieldType, fieldTypeTimed, fieldTypeLocalDate, fieldWithContentType, fieldName, contentTypeFieldName } =
            field;

          const fakeData = field.generateFakeData('ts');
          if (fieldWithContentType) {
            return [
              [fieldName, fakeData],
              [contentTypeFieldName, "'unknown'"],
            ];
          }
          if (fieldIsEnum) {
            return [[fieldName, `${fieldType}[${fakeData}]`]];
          }
          if (fieldTypeTimed || fieldTypeLocalDate) {
            return [[fieldName, `dayjs(${fakeData})`]];
          }
          return [[fieldName, fakeData]];
        }
        return [[reference.name, this.generateTestEntityId(reference.type, 'random', false)]];
      })
      .flat();
    return `{
  ${[...entries, ...Object.entries(additionalFields)].map(([key, value]) => `${key}: ${value}`).join(',\n  ')}
}`;
  }

  /**
   * @private
   * Generate a test entity, according to the type
   *
   * @param references
   * @param {number} [index] - index of the primary key sample, pass undefined for a random key.
   */
  generateTestEntity(references, index = 'random') {
    const random = index === 'random';
    const entries = references
      .map(reference => {
        if (random && reference.field) {
          const field = reference.field;
          const fakeData = field.generateFakeData('json-serializable');
          if (reference.field.fieldWithContentType) {
            return [
              [reference.name, fakeData],
              [field.contentTypeFieldName, 'unknown'],
            ];
          }
          return [[reference.name, fakeData]];
        }
        return [[reference.name, this.generateTestEntityId(reference.type, index, false)]];
      })
      .flat();
    return Object.fromEntries(entries);
  }

  /**
   * @private
   * Return the primary key data type based on DB
   *
   * @param {any} databaseType - the database type
   */
  getPkType(databaseType) {
    if (this.jhipsterConfig.pkType) {
      return this.jhipsterConfig.pkType;
    }
    if ([MONGODB, NEO4J, COUCHBASE].includes(databaseType)) {
      return TYPE_STRING;
    }
    if (databaseType === CASSANDRA) {
      return TYPE_UUID;
    }
    return TYPE_LONG;
  }

  /**
   * @private
   */
  getDBCExtraOption(databaseType) {
    const databaseDataForType = databaseData[databaseType];
    const { extraOptions = '' } = databaseDataForType;
    return extraOptions;
  }

  /**
   * @private
   * Returns the primary key value based on the primary key type, DB and default value
   *
   * @param {string} primaryKey - the primary key type
   * @param {string} databaseType - the database type
   * @param {string} defaultValue - default value
   * @returns {string} java primary key value
   */
  getPrimaryKeyValue(primaryKey, databaseType = this.jhipsterConfig.databaseType, defaultValue = 1) {
    if (typeof primaryKey === 'object' && primaryKey.composite) {
      return `new ${primaryKey.type}(${primaryKey.references
        .map(ref => this.getPrimaryKeyValue(ref.type, databaseType, defaultValue))
        .join(', ')})`;
    }
    const primaryKeyType = typeof primaryKey === 'string' ? primaryKey : primaryKey.type;
    if (primaryKeyType === TYPE_STRING) {
      if (databaseType === SQL && defaultValue === 0) {
        return this.getJavaValueGeneratorForType(primaryKeyType);
      }
      return `"id${defaultValue}"`;
    }
    if (primaryKeyType === TYPE_UUID) {
      return this.getJavaValueGeneratorForType(primaryKeyType);
    }
    return `${defaultValue}L`;
  }

  /**
   * @private
   */
  getJavaValueGeneratorForType(type) {
    if (type === 'String') {
      return 'UUID.randomUUID().toString()';
    }
    if (type === 'UUID') {
      return 'UUID.randomUUID()';
    }
    if (type === 'Long') {
      return 'count.incrementAndGet()';
    }
    throw new Error(`Java type ${type} does not have a random generator implemented`);
  }

  /**
   * @private
   * Get a root folder name for entity
   * @param {string} clientRootFolder
   * @param {string} entityFileName
   */
  getEntityFolderName(clientRootFolder, entityFileName) {
    if (clientRootFolder) {
      return `${clientRootFolder}/${entityFileName}`;
    }
    return entityFileName;
  }

  /**
   * @private
   * Get a parent folder path addition for entity
   * @param {string} clientRootFolder
   */
  getEntityParentPathAddition(clientRootFolder) {
    if (!clientRootFolder) {
      return '';
    }
    const relative = path.relative(`/app/entities/${clientRootFolder}/`, '/app/entities/');
    if (relative.includes('app')) {
      // Relative path outside angular base dir.
      const message = `
                "clientRootFolder outside app base dir '${clientRootFolder}'"
            `;
      // Test case doesn't have a environment instance so return 'error'
      if (this.env === undefined) {
        throw new Error(message);
      }
      this.error(message);
    }
    const entityFolderPathAddition = relative.replace(/[/|\\]?..[/|\\]entities/, '').replace('entities', '..');
    if (!entityFolderPathAddition) {
      return '';
    }
    return `${entityFolderPathAddition}/`;
  }

  /**
   * @private
   */
  generateDateTimeFormat(language, index, length) {
    let config = `  '${language}': {\n`;

    config += '    short: {\n';
    config += "      year: 'numeric', month: 'short', day: 'numeric', hour: 'numeric', minute: 'numeric'\n";
    config += '    },\n';
    config += '    medium: {\n';
    config += "      year: 'numeric', month: 'short', day: 'numeric',\n";
    config += "      weekday: 'short', hour: 'numeric', minute: 'numeric'\n";
    config += '    },\n';
    config += '    long: {\n';
    config += "      year: 'numeric', month: 'long', day: 'numeric',\n";
    config += "      weekday: 'long', hour: 'numeric', minute: 'numeric'\n";
    config += '    }\n';
    config += '  }';
    if (index !== length - 1) {
      config += ',';
    }
    config += '\n';
    return config;
  }

  /**
   * @private
   * Convert to Java bean name case
   *
   * Handle the specific case when the second letter is capitalized
   * See http://stackoverflow.com/questions/2948083/naming-convention-for-getters-setters-in-java
   *
   * @param {string} beanName
   * @return {string}
   */
  javaBeanCase(beanName) {
    const secondLetter = beanName.charAt(1);
    if (secondLetter && secondLetter === secondLetter.toUpperCase()) {
      return beanName;
    }
    return _.upperFirst(beanName);
  }

  /**
   * @private
   * Create a java getter of reference.
   *
   * @param {object|string[]} reference
   * @return {string}
   */
  buildJavaGet(reference) {
    let refPath;
    if (typeof refPath === 'string') {
      refPath = [reference];
    } else if (Array.isArray(reference)) {
      refPath = reference;
    } else {
      refPath = [reference.name];
    }
    return refPath.map(partialPath => `get${this.javaBeanCase(partialPath)}()`).join('.');
  }

  /**
   * @private
   * Create a dotted path of reference.
   *
   * @param {object|string[]} reference
   * @return {string}
   */
  buildReferencePath(reference) {
    const refPath = Array.isArray(reference) ? reference : reference.path;
    return refPath.join('.');
  }

  /**
   * @private
   * Create a java getter method of reference.
   *
   * @param {object} reference
   * @param {string} type
   * @return {string}
   */
  buildJavaGetter(reference, type = reference.type) {
    return `${type} get${this.javaBeanCase(reference.name)}()`;
  }

  /**
   * @private
   * Create a java getter method of reference.
   *
   * @param {object} reference
   * @param {string} valueDefinition
   * @return {string}
   */
  buildJavaSetter(reference, valueDefinition = `${reference.type} ${reference.name}`) {
    return `set${this.javaBeanCase(reference.name)}(${valueDefinition})`;
  }

  /**
   * @private
   * Create a java getter method of reference.
   *
   * @param {object} reference
   * @param {string} valueDefinition
   * @return {string}
   */
  buildJavaFluentSetter(reference, valueDefinition = `${reference.type} ${reference.name}`) {
    return `${reference.name}(${valueDefinition})`;
  }

  /**
   * @private
   * Create a angular form path getter method of reference.
   *
   * @param {object} reference
   * @param {string[]} prefix
   * @return {string}
   */
  buildAngularFormPath(reference, prefix = []) {
    const formPath = [...prefix, ...reference.path].join("', '");
    return `'${formPath}'`;
  }

  /**
   * @private
   *
   * Print entity json representation.
   *
   * @param {object} entity
   */
  debugEntity(entity) {
    this.log(stringify(entity));
  }
}
