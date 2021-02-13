/**
 * Copyright 2013-2021 the original author or authors from the JHipster project.
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

const { MONOLITH, MICROSERVICE, GATEWAY } = require('./application-types');
const { COUCHBASE, CASSANDRA, MONGODB, NO } = require('./database-types');
const { OptionNames, OptionValues } = require('./application-options');

const {
  APPLICATION_TYPE,
  AUTHENTICATION_TYPE,
  BASE_NAME,
  BUILD_TOOL,
  CACHE_PROVIDER,
  CLIENT_FRAMEWORK,
  CLIENT_PACKAGE_MANAGER,
  CLIENT_THEME,
  CLIENT_THEME_VARIANT,
  WITH_ADMIN_UI,
  DATABASE_TYPE,
  DEV_DATABASE_TYPE,
  DTO_SUFFIX,
  ENABLE_HIBERNATE_CACHE,
  ENABLE_SWAGGER_CODEGEN,
  ENABLE_TRANSLATION,
  ENTITY_SUFFIX,
  JHI_PREFIX,
  LANGUAGES,
  MESSAGE_BROKER,
  PACKAGE_FOLDER,
  PACKAGE_NAME,
  PROD_DATABASE_TYPE,
  REACTIVE,
  SEARCH_ENGINE,
  SERVER_PORT,
  SERVICE_DISCOVERY_TYPE,
  SKIP_CLIENT,
  SKIP_SERVER,
  SKIP_USER_MANAGEMENT,
  TEST_FRAMEWORKS,
  USE_NPM,
  WEBSOCKET,
} = OptionNames;

module.exports = {
  getConfigForMonolithApplication,
  getConfigForGatewayApplication,
  getConfigForMicroserviceApplication,
  getDefaultConfigForNewApplication,
  getConfigForApplicationType,
};

function getConfigForApplicationType(applicationType = undefined, customOptions = {}) {
  if (applicationType === MONOLITH) {
    return getConfigForMonolithApplication(customOptions);
  }
  if (applicationType === GATEWAY) {
    return getConfigForGatewayApplication(customOptions);
  }
  if (applicationType === MICROSERVICE) {
    return getConfigForMicroserviceApplication(customOptions);
  }
  return getDefaultConfigForNewApplication(customOptions);
}

function getConfigForMonolithApplication(customOptions = {}) {
  const options = {
    [AUTHENTICATION_TYPE]: OptionValues[AUTHENTICATION_TYPE].jwt,
    [CACHE_PROVIDER]: OptionValues[CACHE_PROVIDER].ehcache,
    [CLIENT_FRAMEWORK]: OptionValues[CLIENT_FRAMEWORK].angularX,
    [SERVER_PORT]: OptionValues[SERVER_PORT],
    [SERVICE_DISCOVERY_TYPE]: false,
    [SKIP_USER_MANAGEMENT]: OptionValues[SKIP_USER_MANAGEMENT],
    [WITH_ADMIN_UI]: true,
    ...customOptions,
  };
  if (!options[CLIENT_THEME]) {
    options[CLIENT_THEME] = OptionValues[CLIENT_THEME];
    options[CLIENT_THEME_VARIANT] = OptionValues[CLIENT_THEME_VARIANT].none;
  } else if (options[CLIENT_THEME] !== OptionValues[CLIENT_THEME] && !options[CLIENT_THEME_VARIANT]) {
    options[CLIENT_THEME_VARIANT] = OptionValues[CLIENT_THEME_VARIANT].default;
  }
  if (options[AUTHENTICATION_TYPE] === OptionValues[AUTHENTICATION_TYPE].oauth2) {
    options[SKIP_USER_MANAGEMENT] = true;
  }

  return {
    ...options,
    [APPLICATION_TYPE]: MONOLITH,
  };
}

function getConfigForGatewayApplication(customOptions = {}) {
  const options = {
    [AUTHENTICATION_TYPE]: OptionValues[AUTHENTICATION_TYPE].jwt,
    [CLIENT_FRAMEWORK]: OptionValues[CLIENT_FRAMEWORK].angularX,
    [SERVER_PORT]: OptionValues[SERVER_PORT],
    [SERVICE_DISCOVERY_TYPE]: OptionValues[SERVICE_DISCOVERY_TYPE].eureka,
    [SKIP_USER_MANAGEMENT]: OptionValues[SKIP_USER_MANAGEMENT],
    [WITH_ADMIN_UI]: true,
    ...customOptions,
  };
  if (!options[CLIENT_THEME]) {
    options[CLIENT_THEME] = OptionValues[CLIENT_THEME];
    options[CLIENT_THEME_VARIANT] = OptionValues[CLIENT_THEME_VARIANT].none;
  } else if (options[CLIENT_THEME] !== OptionValues[CLIENT_THEME] && !options[CLIENT_THEME_VARIANT]) {
    options[CLIENT_THEME_VARIANT] = OptionValues[CLIENT_THEME_VARIANT].default;
  }
  if (options[AUTHENTICATION_TYPE] === OptionValues[AUTHENTICATION_TYPE].oauth2) {
    options[SKIP_USER_MANAGEMENT] = true;
  }
  if (options[SERVICE_DISCOVERY_TYPE] === false) {
    options[SERVICE_DISCOVERY_TYPE] = OptionValues[SERVICE_DISCOVERY_TYPE].eureka;
  }
  if (options[SERVICE_DISCOVERY_TYPE] === OptionValues[SERVICE_DISCOVERY_TYPE].no) {
    options[SERVICE_DISCOVERY_TYPE] = false;
  }
  options[CACHE_PROVIDER] = OptionValues[CACHE_PROVIDER].no;
  options[ENABLE_HIBERNATE_CACHE] = false;
  return {
    ...options,
    [REACTIVE]: true,
    [APPLICATION_TYPE]: GATEWAY,
  };
}

function getConfigForMicroserviceApplication(customOptions = {}) {
  const DEFAULT_SERVER_PORT = '8081';
  const options = {
    [AUTHENTICATION_TYPE]: OptionValues[AUTHENTICATION_TYPE].jwt,
    [CACHE_PROVIDER]: OptionValues[CACHE_PROVIDER].hazelcast,
    [SERVER_PORT]: DEFAULT_SERVER_PORT,
    [SERVICE_DISCOVERY_TYPE]: OptionValues[SERVICE_DISCOVERY_TYPE].eureka,
    [SKIP_USER_MANAGEMENT]: true,
    ...customOptions,
  };
  delete options[CLIENT_FRAMEWORK];
  delete options[CLIENT_THEME];
  delete options[CLIENT_THEME_VARIANT];
  delete options[SKIP_SERVER];
  delete options[WITH_ADMIN_UI];
  if (typeof options[SKIP_USER_MANAGEMENT] !== 'boolean') {
    options[SKIP_USER_MANAGEMENT] = true;
  }
  if (options[SERVICE_DISCOVERY_TYPE] === false) {
    options[SERVICE_DISCOVERY_TYPE] = OptionValues[SERVICE_DISCOVERY_TYPE].eureka;
  }
  if (options[SERVICE_DISCOVERY_TYPE] === OptionValues[SERVICE_DISCOVERY_TYPE].no) {
    options[SERVICE_DISCOVERY_TYPE] = false;
  }
  return {
    ...options,
    [APPLICATION_TYPE]: MICROSERVICE,
    [SKIP_CLIENT]: true,
  };
}

function getDefaultConfigForNewApplication(customOptions = {}) {
  const options = {
    [BASE_NAME]: OptionValues[BASE_NAME],
    [BUILD_TOOL]: OptionValues[BUILD_TOOL].maven,
    [DATABASE_TYPE]: OptionValues[DATABASE_TYPE].sql,
    [DEV_DATABASE_TYPE]: OptionValues[DEV_DATABASE_TYPE].h2Disk,
    [CACHE_PROVIDER]: OptionValues[CACHE_PROVIDER].ehcache,
    [ENABLE_HIBERNATE_CACHE]: OptionValues[ENABLE_HIBERNATE_CACHE],
    [ENABLE_SWAGGER_CODEGEN]: OptionValues[ENABLE_SWAGGER_CODEGEN],
    [ENABLE_TRANSLATION]: OptionValues[ENABLE_TRANSLATION],
    [JHI_PREFIX]: OptionValues[JHI_PREFIX],
    [LANGUAGES]: OptionValues[LANGUAGES],
    [MESSAGE_BROKER]: OptionValues[MESSAGE_BROKER].false,
    [PROD_DATABASE_TYPE]: OptionValues[PROD_DATABASE_TYPE].postgresql,
    [SEARCH_ENGINE]: OptionValues[SEARCH_ENGINE].false,
    [SKIP_CLIENT]: OptionValues[SKIP_CLIENT],
    [TEST_FRAMEWORKS]: [],
    [WEBSOCKET]: OptionValues[WEBSOCKET].false,
    ...customOptions,
  };
  if (typeof options[SKIP_SERVER] !== 'boolean') {
    options[SKIP_SERVER] = OptionValues[SKIP_SERVER];
  }
  if (!options[PACKAGE_NAME] && !options[PACKAGE_FOLDER]) {
    options[PACKAGE_FOLDER] = OptionValues[PACKAGE_FOLDER];
    options[PACKAGE_NAME] = OptionValues[PACKAGE_NAME];
  }
  if (!options[PACKAGE_NAME] && options[PACKAGE_FOLDER]) {
    options[PACKAGE_NAME] = options[PACKAGE_FOLDER].replace(/\//g, '.');
  }
  if (!options[PACKAGE_FOLDER] && options[PACKAGE_NAME]) {
    options[PACKAGE_FOLDER] = options[PACKAGE_NAME].replace(/\./g, '/');
  }
  if (options[CLIENT_FRAMEWORK] === OptionValues[CLIENT_FRAMEWORK].angular) {
    options[CLIENT_FRAMEWORK] = OptionValues[CLIENT_FRAMEWORK].angularX;
  }
  if (!options[CLIENT_PACKAGE_MANAGER] && OptionValues[USE_NPM]) {
    options[CLIENT_PACKAGE_MANAGER] = OptionValues[CLIENT_PACKAGE_MANAGER].npm;
  }
  if (typeof options[DTO_SUFFIX] === 'boolean' || typeof options[DTO_SUFFIX] !== 'string') {
    options[DTO_SUFFIX] = OptionValues[DTO_SUFFIX];
  }
  if (typeof options[ENTITY_SUFFIX] === 'boolean' || typeof options[ENTITY_SUFFIX] !== 'string') {
    options[ENTITY_SUFFIX] = OptionValues[ENTITY_SUFFIX];
  }
  if ([MONGODB, COUCHBASE, CASSANDRA, NO].includes(options[DATABASE_TYPE])) {
    options[DEV_DATABASE_TYPE] = options[DATABASE_TYPE];
    options[PROD_DATABASE_TYPE] = options[DATABASE_TYPE];
    if (NO !== options[DATABASE_TYPE]) {
      options[ENABLE_HIBERNATE_CACHE] = false;
    }
  }
  if (options[REACTIVE]) {
    options[CACHE_PROVIDER] = OptionValues[CACHE_PROVIDER].no;
  } else {
    options[REACTIVE] = OptionValues[REACTIVE];
  }
  return options;
}
