/** Copyright 2013-2018 the original author or authors from the JHipster project.
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

const ApplicationOptions = require('../core/jhipster/application_options');
const { MICROSERVICE, GATEWAY } = require('../core/jhipster/application_types');
const { NO } = require('../core/jhipster/database_types');

let applicationConfig = null;

module.exports = {
  checkApplication
};

/**
 * Checks whether a JDL application is valid. If everything's okay, no exception is thrown.
 * @param jdlApplication the application to check
 */
function checkApplication(jdlApplication) {
  if (!jdlApplication || !jdlApplication.config) {
    throw new Error('An application must be passed to be validated.');
  }
  applicationConfig = jdlApplication.config;
  checkForValidValues();
  checkForNoDatabaseType();
}

function checkForValidValues() {
  const nonCustomOptions = stripCustomOptions();
  Object.keys(nonCustomOptions).forEach(option => {
    const value = nonCustomOptions[option];
    checkForUnknownApplicationOption(option);
    checkForBooleanValue(option, value);
    if (option === 'testFrameworks') {
      checkTestFrameworkValues(value);
      return;
    }
    checkForUnknownValue(option, value);
  });
}

function checkForUnknownApplicationOption(option) {
  if (typeof ApplicationOptions[option] === 'undefined') {
    throw new Error(`Unknown application option '${option}'.`);
  }
}

function checkForBooleanValue(option, value) {
  if (typeof ApplicationOptions[option] === 'boolean' && typeof value !== 'boolean') {
    throw new Error(`Expected a boolean value for option '${option}'`);
  }
}

function checkForUnknownValue(option, value) {
  if (typeof ApplicationOptions[option] !== 'boolean' && typeof ApplicationOptions[option][value] === 'undefined') {
    throw new Error(`Unknown value '${value}' for option '${option}'.`);
  }
}

function checkTestFrameworkValues(values) {
  if (Object.keys(values).length === 0) {
    return;
  }
  values.forEach(value => {
    if (!ApplicationOptions.testFrameworks[value]) {
      throw new Error(`Unknown value '${value}' for option 'testFrameworks'.`);
    }
  });
}

function stripCustomOptions() {
  const configCopy = JSON.parse(JSON.stringify(applicationConfig));
  delete configCopy.baseName;
  delete configCopy.packageName;
  delete configCopy.packageFolder;
  delete configCopy.serverPort;
  delete configCopy.uaaBaseName;
  delete configCopy.blueprint;
  delete configCopy.jhiPrefix;
  delete configCopy.languages;
  delete configCopy.nativeLanguage;
  delete configCopy.jhipsterVersion;
  delete configCopy.entitySuffix;
  delete configCopy.dtoSuffix;
  return configCopy;
}

function checkForNoDatabaseType() {
  const applicationIsAMicroserviceWithoutOauth2 =
    applicationConfig.authenticationType !== ApplicationOptions.authenticationType.oauth2 &&
    applicationConfig.applicationType === MICROSERVICE;
  const applicationAGatewayWithUaa =
    applicationConfig.authenticationType === ApplicationOptions.authenticationType.uaa &&
    applicationConfig.applicationType === GATEWAY;
  if (
    applicationConfig.databaseType === NO &&
    !(applicationIsAMicroserviceWithoutOauth2 || applicationAGatewayWithUaa)
  ) {
    throw new Error(
      'Having no database type is only allowed for microservices without oauth2 authentication type ' +
        'and gateways with UAA authentication type.'
    );
  }
}
