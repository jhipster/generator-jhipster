/** Copyright 2013-2020 the original author or authors from the JHipster project.
 *
 * This file is part of the JHipster project, see http://www.jhipster.tech/
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

const Validator = require('./validator');
const {
  doesValueExists,
  exists,
  isType,
  devDatabaseType: { h2Disk, h2Memory }
} = require('../core/jhipster/application_options');
const { UAA, MICROSERVICE } = require('../core/jhipster/application_types');
const {
  COUCHBASE,
  CASSANDRA,
  MONGODB,
  MARIADB,
  MSSQL,
  MYSQL,
  ORACLE,
  POSTGRESQL,
  SQL
} = require('../core/jhipster/database_types');

class ApplicationValidator extends Validator {
  constructor() {
    super('application', []);
  }

  validate(jdlApplication) {
    if (!jdlApplication) {
      throw new Error('An application must be passed to be validated.');
    }
    const applicationConfig = jdlApplication.getConfig();
    checkRequiredOptionsAreSet(applicationConfig);
    checkBaseNameAgainstApplicationType(applicationConfig);
    checkLanguageOptions(applicationConfig);
    checkForValidValues(applicationConfig);
    checkForInvalidDatabaseCombinations(applicationConfig);
  }
}

module.exports = ApplicationValidator;

function checkRequiredOptionsAreSet(applicationConfig) {
  if (
    !applicationConfig.hasOption('applicationType') ||
    !applicationConfig.hasOption('authenticationType') ||
    !applicationConfig.hasOption('baseName') ||
    !applicationConfig.hasOption('buildTool')
  ) {
    throw new Error(
      'The application applicationType, authenticationType, baseName and buildTool options are required.'
    );
  }
}

function checkBaseNameAgainstApplicationType(applicationConfig) {
  const applicationBaseName = applicationConfig.getOptionValue('baseName');
  const applicationType = applicationConfig.getOptionValue('applicationType');
  if (applicationBaseName.includes('_') && (applicationType === UAA || applicationType === MICROSERVICE)) {
    throw new Error(
      "An application name can't contain underscores if the application is a microservice or a UAA application."
    );
  }
}

function checkLanguageOptions(applicationConfig) {
  const presentTranslationOption = applicationConfig.hasOption('enableTranslation');
  if (presentTranslationOption) {
    const translationEnabled = applicationConfig.getOptionValue('enableTranslation');
    const presentNativeLanguage = applicationConfig.hasOption('nativeLanguage');
    if (translationEnabled && !presentNativeLanguage) {
      throw new Error('No chosen language.');
    }
  }
}

function checkForValidValues(applicationConfig) {
  const optionsToIgnore = [
    'baseName',
    'packageName',
    'packageFolder',
    'serverPort',
    'uaaBaseName',
    'blueprint',
    'jhiPrefix',
    'jwtSecretKey',
    'rememberMeKey',
    'languages',
    'nativeLanguage',
    'jhipsterVersion',
    'dtoSuffix',
    'entitySuffix',
    'otherModules',
    'creationTimestamp'
  ];
  applicationConfig.forEachOption(option => {
    if (optionsToIgnore.includes(option.name)) {
      return;
    }
    checkForUnknownApplicationOption(option);
    checkForBooleanValue(option);
    checkSpecificOptions(option);
  });
}

function checkForUnknownApplicationOption(option) {
  if (!exists(option.name)) {
    throw new Error(`Unknown application option '${option.name}'.`);
  }
}

function checkForBooleanValue(option) {
  if (isType(option.name, 'boolean') && typeof option.getValue() !== 'boolean') {
    throw new Error(`Expected a boolean value for option '${option.name}'`);
  }
}

function checkSpecificOptions(option) {
  switch (option.name) {
    case 'clientTheme':
    case 'clientThemeVariant':
      return;
    case 'testFrameworks':
      checkTestFrameworkValues(option.getValue());
      break;
    case 'databaseType':
      checkDatabaseTypeValue(option.getValue());
      break;
    case 'devDatabaseType':
      checkDevDatabaseTypeValue(option.getValue());
      break;
    case 'prodDatabaseType':
      checkProdDatabaseTypeValue(option.getValue());
      break;
    default:
      checkForUnknownValue(option);
  }
}

function checkTestFrameworkValues(values) {
  if (Object.keys(values).length === 0) {
    return;
  }
  values.forEach(value => {
    if (!doesValueExists('testFrameworks', value)) {
      throw new Error(`Unknown value '${value}' for option 'testFrameworks'.`);
    }
  });
}

function checkDatabaseTypeValue(value) {
  if (!doesValueExists('databaseType', value)) {
    throw new Error(`Unknown value '${value}' for option 'databaseType'.`);
  }
}

function checkDevDatabaseTypeValue(value) {
  if (
    !doesValueExists('databaseType', value) &&
    !doesValueExists('devDatabaseType', value) &&
    !doesValueExists('prodDatabaseType', value)
  ) {
    throw new Error(`Unknown value '${value}' for option 'devDatabaseType'.`);
  }
}

function checkProdDatabaseTypeValue(value) {
  if (!doesValueExists('databaseType', value) && !doesValueExists('prodDatabaseType', value)) {
    throw new Error(`Unknown value '${value}' for option 'prodDatabaseType'.`);
  }
}

function checkForUnknownValue(option) {
  if (!isType(option.name, 'boolean') && !doesValueExists(option.name, option.getValue())) {
    throw new Error(`Unknown option value '${option.getValue()}' for option '${option.name}'.`);
  }
}

function checkForInvalidDatabaseCombinations(applicationConfig) {
  const databaseType = applicationConfig.getOptionValue('databaseType');
  const devDatabaseType = applicationConfig.getOptionValue('devDatabaseType');
  const prodDatabaseType = applicationConfig.getOptionValue('prodDatabaseType');

  if (databaseType === SQL) {
    if (![MYSQL, POSTGRESQL, MARIADB, ORACLE, MSSQL].includes(prodDatabaseType)) {
      throw new Error(
        `Only ${formatValueList([
          MYSQL,
          POSTGRESQL,
          MARIADB,
          ORACLE,
          MSSQL
        ])} are allowed as prodDatabaseType values for databaseType 'sql'.`
      );
    }
    if (![h2Memory, h2Disk, prodDatabaseType].includes(devDatabaseType)) {
      throw new Error(
        `Only ${formatValueList([
          h2Memory,
          h2Disk,
          prodDatabaseType
        ])} are allowed as devDatabaseType values for databaseType 'sql'.`
      );
    }
    return;
  }
  if (
    [MONGODB, COUCHBASE, CASSANDRA].includes(databaseType) &&
    (databaseType !== devDatabaseType || databaseType !== prodDatabaseType)
  ) {
    throw new Error(
      `When the databaseType is either ${formatValueList([
        MONGODB,
        COUCHBASE,
        CASSANDRA
      ])}, the devDatabaseType and prodDatabaseType must be the same.`
    );
  }
}

function formatValueList(list) {
  return list.map(item => `'${item}'`).join(', ');
}
