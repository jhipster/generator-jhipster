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

import ApplicationOptions from '../jhipster/application-options.js';
import ApplicationTypes from '../jhipster/application-types.js';
import DatabaseTypes from '../jhipster/database-types.js';
import BinaryOptionValidator from './binary-option-validator.js';
import UnaryOptionValidator from './unary-option-validator.js';
import Validator from './validator.js';

import BinaryOptions from '../jhipster/binary-options.js';

const { OptionNames, OptionValues, getTypeForOption, doesOptionExist, doesOptionValueExist } = ApplicationOptions;
const { MICROSERVICE } = ApplicationTypes;
const { COUCHBASE, NEO4J, CASSANDRA, MONGODB, MARIADB, MSSQL, MYSQL, ORACLE, POSTGRESQL, SQL } = DatabaseTypes;
const { Options } = BinaryOptions;

export default class ApplicationValidator extends Validator {
  constructor() {
    super('application', []);
  }

  validate(jdlApplication) {
    if (!jdlApplication) {
      throw new Error('An application must be passed to be validated.');
    }
    checkRequiredOptionsAreSet(jdlApplication);
    checkBaseNameAgainstApplicationType(jdlApplication);
    checkForValidValues(jdlApplication);
    checkForInvalidDatabaseCombinations(jdlApplication);
    checkApplicationOptions(jdlApplication);
    checkForReactiveAppWithWebsocket(jdlApplication);
  }
}

function checkRequiredOptionsAreSet(jdlApplication) {
  if (
    !jdlApplication.hasConfigurationOption('applicationType') ||
    !jdlApplication.hasConfigurationOption('authenticationType') ||
    !jdlApplication.hasConfigurationOption('baseName') ||
    !jdlApplication.hasConfigurationOption('buildTool')
  ) {
    throw new Error('The application applicationType, authenticationType, baseName and buildTool options are required.');
  }
}

function checkBaseNameAgainstApplicationType(jdlApplication) {
  const applicationBaseName = jdlApplication.getConfigurationOptionValue('baseName');
  const applicationType = jdlApplication.getConfigurationOptionValue('applicationType');
  if (applicationBaseName.includes('_') && applicationType === MICROSERVICE) {
    throw new Error("An application name can't contain underscores if the application is a microservice.");
  }
}

function checkForValidValues(jdlApplication) {
  const optionsToIgnore = [
    'baseName',
    'packageName',
    'packageFolder',
    'serverPort',
    'blueprint',
    'jhiPrefix',
    'jwtSecretKey',
    'rememberMeKey',
    'languages',
    'microfrontend',
    'nativeLanguage',
    'jhipsterVersion',
    'dtoSuffix',
    'entitySuffix',
    'creationTimestamp',
    'blueprints',
    'gradleEnterpriseHost',
  ];
  jdlApplication.forEachConfigurationOption(option => {
    if (optionsToIgnore.includes(option.name)) {
      return;
    }
    checkForUnknownApplicationOption(option);
    checkForBooleanValue(option);
    checkSpecificOptions(option);
  });
}

function checkForUnknownApplicationOption(option) {
  if (!doesOptionExist(option.name)) {
    throw new Error(`Unknown application option '${option.name}'.`);
  }
}

function checkForBooleanValue(option) {
  if (getTypeForOption(option.name) === 'boolean' && typeof option.getValue() !== 'boolean') {
    throw new Error(`Expected a boolean value for option '${option.name}'`);
  }
}

function checkSpecificOptions(option) {
  switch (option.name) {
    case 'clientTheme':
    case 'clientThemeVariant':
    case 'microfrontends':
      break;
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
    if (!doesOptionValueExist('testFrameworks', value)) {
      throw new Error(`Unknown value '${value}' for option 'testFrameworks'.`);
    }
  });
}

function checkDatabaseTypeValue(value) {
  if (!doesOptionValueExist('databaseType', value)) {
    throw new Error(`Unknown value '${value}' for option 'databaseType'.`);
  }
}

function checkDevDatabaseTypeValue(value) {
  if (
    !doesOptionValueExist('databaseType', value) &&
    !doesOptionValueExist('devDatabaseType', value) &&
    !doesOptionValueExist('prodDatabaseType', value)
  ) {
    throw new Error(`Unknown value '${value}' for option 'devDatabaseType'.`);
  }
}

function checkProdDatabaseTypeValue(value) {
  if (!doesOptionValueExist('databaseType', value) && !doesOptionValueExist('prodDatabaseType', value)) {
    throw new Error(`Unknown value '${value}' for option 'prodDatabaseType'.`);
  }
}

function checkForUnknownValue(option) {
  if (getTypeForOption(option.name) !== 'boolean' && !doesOptionValueExist(option.name, option.getValue())) {
    throw new Error(`Unknown option value '${option.getValue()}' for option '${option.name}'.`);
  }
}

function checkForInvalidDatabaseCombinations(jdlApplication) {
  const databaseType = jdlApplication.getConfigurationOptionValue('databaseType');
  const devDatabaseType = jdlApplication.getConfigurationOptionValue('devDatabaseType');
  const prodDatabaseType = jdlApplication.getConfigurationOptionValue('prodDatabaseType');
  const enabledHibernateCache = jdlApplication.getConfigurationOptionValue('enableHibernateCache');

  if (databaseType === SQL) {
    if (![MYSQL, POSTGRESQL, MARIADB, ORACLE, MSSQL].includes(prodDatabaseType)) {
      throw new Error(
        `Only ${formatValueList([
          MYSQL,
          POSTGRESQL,
          MARIADB,
          ORACLE,
          MSSQL,
        ])} are allowed as prodDatabaseType values for databaseType 'sql'.`
      );
    }
    if (
      ![
        (OptionValues[OptionNames.DEV_DATABASE_TYPE] as any).h2Memory,
        (OptionValues[OptionNames.DEV_DATABASE_TYPE] as any).h2Disk,
        prodDatabaseType,
      ].includes(devDatabaseType)
    ) {
      throw new Error(
        `Only ${formatValueList([
          (OptionValues[OptionNames.DEV_DATABASE_TYPE] as any).h2Memory,
          (OptionValues[OptionNames.DEV_DATABASE_TYPE] as any).h2Disk,
          prodDatabaseType,
        ])} are allowed as devDatabaseType values for databaseType 'sql'.`
      );
    }
    return;
  }
  if ([MONGODB, COUCHBASE, CASSANDRA, NEO4J].includes(databaseType)) {
    if (databaseType !== devDatabaseType || databaseType !== prodDatabaseType) {
      throw new Error(
        `When the databaseType is either ${formatValueList([
          MONGODB,
          COUCHBASE,
          CASSANDRA,
          NEO4J,
        ])}, the devDatabaseType and prodDatabaseType must be the same.`
      );
    }
    if (enabledHibernateCache) {
      throw new Error(`An application having ${databaseType} as database type can't have the hibernate cache enabled.`);
    }
  }
}

function formatValueList(list) {
  return list.map(item => `'${item}'`).join(', ');
}

function checkApplicationOptions(jdlApplication) {
  if (jdlApplication.getOptionQuantity() === 0) {
    return;
  }
  const unaryOptionValidator = new UnaryOptionValidator();
  const binaryOptionValidator = new BinaryOptionValidator();
  jdlApplication.forEachOption(option => {
    if (option.getType() === 'UNARY') {
      unaryOptionValidator.validate(option);
    } else {
      binaryOptionValidator.validate(option);
    }
    checkForPaginationInAppWithCassandra(option, jdlApplication);
  });
}

function checkForPaginationInAppWithCassandra(jdlOption, jdlApplication) {
  if (jdlApplication.getConfigurationOptionValue('databaseType') === CASSANDRA && jdlOption.name === Options.PAGINATION) {
    throw new Error("Pagination isn't allowed when the app uses Cassandra.");
  }
}

function checkForReactiveAppWithWebsocket(jdlApplication) {
  if (jdlApplication.getConfigurationOptionValue('reactive') === true && !!jdlApplication.getConfigurationOptionValue('websocket')) {
    throw new Error("Websockets aren't allowed when the app is reactive.");
  }
}
