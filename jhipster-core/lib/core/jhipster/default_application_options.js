/**
 * Copyright 2013-2020 the original author or authors from the JHipster project.
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

const { MONOLITH, MICROSERVICE, GATEWAY, UAA } = require('./application_types');
const { COUCHBASE, CASSANDRA, MONGODB, NO } = require('./database_types');
const { OptionNames, OptionValues } = require('./application_options');

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
  NATIVE_LANGUAGE,
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
  USE_SASS,
  WEBSOCKET
} = OptionNames;

module.exports = {
  getConfigForMonolithApplication,
  getConfigForGatewayApplication,
  getConfigForMicroserviceApplication,
  getConfigForUAAApplication,
  getDefaultConfigForNewApplication
};

function getConfigForMonolithApplication(customOptions = {}) {
  const options = {
    [AUTHENTICATION_TYPE]: OptionValues[AUTHENTICATION_TYPE].jwt,
    [CACHE_PROVIDER]: OptionValues[CACHE_PROVIDER].ehcache,
    [CLIENT_FRAMEWORK]: OptionValues[CLIENT_FRAMEWORK].angularX,
    [SERVER_PORT]: OptionValues[SERVER_PORT],
    [SERVICE_DISCOVERY_TYPE]: false,
    [SKIP_USER_MANAGEMENT]: OptionValues[SKIP_USER_MANAGEMENT],
    ...customOptions
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
  if (typeof options[USE_SASS] !== 'boolean') {
    options[USE_SASS] = true;
  }

  return {
    ...options,
    [APPLICATION_TYPE]: MONOLITH
  };
}

function getConfigForGatewayApplication(customOptions = {}) {
  const options = {
    [AUTHENTICATION_TYPE]: OptionValues[AUTHENTICATION_TYPE].jwt,
    [CACHE_PROVIDER]: OptionValues[CACHE_PROVIDER].ehcache,
    [CLIENT_FRAMEWORK]: OptionValues[CLIENT_FRAMEWORK].angularX,
    [SERVER_PORT]: OptionValues[SERVER_PORT],
    [SERVICE_DISCOVERY_TYPE]: OptionValues[SERVICE_DISCOVERY_TYPE].eureka,
    [SKIP_USER_MANAGEMENT]: OptionValues[SKIP_USER_MANAGEMENT],
    ...customOptions
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
  if (typeof options[USE_SASS] !== 'boolean') {
    options[USE_SASS] = true;
  }
  if (options[SERVICE_DISCOVERY_TYPE] === false) {
    options[SERVICE_DISCOVERY_TYPE] = OptionValues[SERVICE_DISCOVERY_TYPE].eureka;
  }
  if (options[SERVICE_DISCOVERY_TYPE] === OptionValues[SERVICE_DISCOVERY_TYPE].no) {
    options[SERVICE_DISCOVERY_TYPE] = false;
  }
  return {
    ...options,
    [APPLICATION_TYPE]: GATEWAY
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
    ...customOptions
  };
  delete options[CLIENT_FRAMEWORK];
  delete options[CLIENT_THEME];
  delete options[CLIENT_THEME_VARIANT];
  delete options[USE_SASS];
  delete options[SKIP_SERVER];
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
    [SKIP_CLIENT]: true
  };
}

function getConfigForUAAApplication(customOptions = {}) {
  const DEFAULT_SERVER_PORT = '9999';
  const options = {
    [AUTHENTICATION_TYPE]: OptionValues[AUTHENTICATION_TYPE].uaa,
    [CACHE_PROVIDER]: OptionValues[CACHE_PROVIDER].hazelcast,
    [SERVER_PORT]: DEFAULT_SERVER_PORT,
    [SERVICE_DISCOVERY_TYPE]: false,
    ...customOptions
  };
  delete options[CLIENT_FRAMEWORK];
  delete options[CLIENT_THEME];
  delete options[CLIENT_THEME_VARIANT];
  delete options[USE_SASS];
  delete options[SKIP_SERVER];
  return {
    ...options,
    [APPLICATION_TYPE]: UAA,
    [SKIP_CLIENT]: true,
    [SKIP_USER_MANAGEMENT]: false
  };
}

function getDefaultConfigForNewApplication(customOptions = {}) {
  const options = {
    [BASE_NAME]: OptionValues[BASE_NAME],
    [BUILD_TOOL]: OptionValues[BUILD_TOOL].maven,
    [DATABASE_TYPE]: OptionValues[DATABASE_TYPE].sql,
    [DEV_DATABASE_TYPE]: OptionValues[DEV_DATABASE_TYPE].h2Disk,
    [ENABLE_HIBERNATE_CACHE]: OptionValues[ENABLE_HIBERNATE_CACHE],
    [ENABLE_SWAGGER_CODEGEN]: OptionValues[ENABLE_SWAGGER_CODEGEN],
    [ENABLE_TRANSLATION]: OptionValues[ENABLE_TRANSLATION],
    [JHI_PREFIX]: OptionValues[JHI_PREFIX],
    [LANGUAGES]: OptionValues[LANGUAGES],
    [MESSAGE_BROKER]: OptionValues[MESSAGE_BROKER].false,
    [NATIVE_LANGUAGE]: OptionValues[NATIVE_LANGUAGE],
    [PROD_DATABASE_TYPE]: OptionValues[PROD_DATABASE_TYPE].mysql,
    [SEARCH_ENGINE]: OptionValues[SEARCH_ENGINE].false,
    [SKIP_CLIENT]: OptionValues[SKIP_CLIENT],
    [TEST_FRAMEWORKS]: [],
    [WEBSOCKET]: OptionValues[WEBSOCKET].false,
    ...customOptions
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
  if (typeof options[DTO_SUFFIX] === 'boolean') {
    options[DTO_SUFFIX] = 'DTO';
  }
  if (typeof options[ENTITY_SUFFIX] === 'boolean') {
    options[ENTITY_SUFFIX] = '';
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
  }
  return options;
}
