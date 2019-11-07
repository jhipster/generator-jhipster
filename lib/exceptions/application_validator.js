/** Copyright 2013-2019 the original author or authors from the JHipster project.
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
    super('application', ['baseName', 'authenticationType', 'buildTool']);
  }

  validate(jdlApplication) {
    if (!jdlApplication) {
      throw new Error('No application.');
    }
    super.validate(jdlApplication.config);
    checkLanguageOptions(jdlApplication);
    checkForValidValues(jdlApplication);
    checkForInvalidDatabaseCombinations(jdlApplication);
  }
}

module.exports = ApplicationValidator;

function checkLanguageOptions(jdlApplication) {
  const { config } = jdlApplication;
  if (config.enableTranslation && !config.nativeLanguage) {
    throw new Error('No chosen language.');
  }
}

function checkForValidValues(jdlApplication) {
  const nonCustomOptions = stripCustomOptions(jdlApplication);
  Object.keys(nonCustomOptions).forEach(option => {
    const value = nonCustomOptions[option];
    checkForUnknownApplicationOption(option);
    checkForBooleanValue(option, value);
    checkSpecificOptions(option, value);
  });
}

function checkSpecificOptions(option, value) {
  switch (option) {
    case 'clientTheme':
    case 'clientThemeVariant':
      return;
    case 'testFrameworks':
      checkTestFrameworkValues(value);
      break;
    case 'databaseType':
      checkDatabaseTypeValue(value);
      break;
    case 'devDatabaseType':
      checkDevDatabaseTypeValue(value);
      break;
    case 'prodDatabaseType':
      checkProdDatabaseTypeValue(value);
      break;
    default:
      checkForUnknownValue(option, value);
  }
}

function checkForUnknownApplicationOption(option) {
  if (!exists(option)) {
    throw new Error(`Unknown application option '${option}'.`);
  }
}

function checkForBooleanValue(option, value) {
  if (isType(option, 'boolean') && typeof value !== 'boolean') {
    throw new Error(`Expected a boolean value for option '${option}'`);
  }
}

function checkForUnknownValue(option, value) {
  if (!isType(option, 'boolean') && !doesValueExists(option, value)) {
    throw new Error(`Unknown value '${value}' for option '${option}'.`);
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

function checkForInvalidDatabaseCombinations(jdlApplication) {
  const { databaseType, devDatabaseType, prodDatabaseType } = jdlApplication.config;

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

function stripCustomOptions(jdlApplication) {
  const configCopy = { ...jdlApplication.config };
  delete configCopy.baseName;
  delete configCopy.packageName;
  delete configCopy.packageFolder;
  delete configCopy.serverPort;
  delete configCopy.uaaBaseName;
  delete configCopy.blueprint;
  delete configCopy.jhiPrefix;
  delete configCopy.jwtSecretKey;
  delete configCopy.rememberMeKey;
  delete configCopy.languages;
  delete configCopy.nativeLanguage;
  delete configCopy.jhipsterVersion;
  delete configCopy.entitySuffix;
  delete configCopy.dtoSuffix;
  delete configCopy.otherModules;
  return configCopy;
}
