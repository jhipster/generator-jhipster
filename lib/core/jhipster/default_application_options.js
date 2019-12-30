/**
 * Copyright 2013-2017 the original author or authors from the JHipster project.
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
const { OptionNames, OptionValues } = require('./new_application_options');

const {
  APPLICATION_TYPE,
  AUTHENTICATION_TYPE,
  BASE_NAME,
  BUILD_TOOL,
  CACHE_PROVIDER,
  CLIENT_FRAMEWORK,
  CLIENT_THEME,
  CLIENT_THEME_VARIANT,
  DATABASE_TYPE,
  DEV_DATABASE_TYPE,
  ENABLE_HIBERNATE_CACHE,
  ENABLE_SWAGGER_CODEGEN,
  ENABLE_TRANSLATION,
  JHI_PREFIX,
  LANGUAGES,
  MESSAGE_BROKER,
  NATIVE_LANGUAGE,
  PACKAGE_FOLDER,
  PACKAGE_NAME,
  PROD_DATABASE_TYPE,
  SEARCH_ENGINE,
  SERVER_PORT,
  SERVICE_DISCOVERY_TYPE,
  SKIP_CLIENT,
  SKIP_SERVER,
  SKIP_USER_MANAGEMENT,
  TEST_FRAMEWORKS,
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
    [APPLICATION_TYPE]: GATEWAY
  };
}

function getConfigForMicroserviceApplication(customOptions = {}) {
  const DEFAULT_SERVER_PORT = '8081';
  const options = {
    [AUTHENTICATION_TYPE]: OptionValues[AUTHENTICATION_TYPE].jwt,
    [CACHE_PROVIDER]: OptionValues[CACHE_PROVIDER].hazelcast,
    [SERVER_PORT]: DEFAULT_SERVER_PORT,
    ...customOptions
  };
  delete options[CLIENT_FRAMEWORK];
  delete options[CLIENT_THEME];
  delete options[CLIENT_THEME_VARIANT];
  delete options[USE_SASS];
  // delete options[SKIP_SERVER];
  if (typeof options[SKIP_USER_MANAGEMENT] !== 'boolean') {
    options[SKIP_USER_MANAGEMENT] = true;
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
    ...customOptions
  };
  delete options[CLIENT_FRAMEWORK];
  delete options[CLIENT_THEME];
  delete options[CLIENT_THEME_VARIANT];
  delete options[USE_SASS];
  // delete options[SKIP_SERVER];
  return {
    ...options,
    [APPLICATION_TYPE]: UAA,
    [SKIP_CLIENT]: true,
    [SKIP_USER_MANAGEMENT]: false
  };
}

function getDefaultConfigForNewApplication() {
  return {
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
    [PACKAGE_FOLDER]: OptionValues[PACKAGE_FOLDER],
    [PACKAGE_NAME]: OptionValues[PACKAGE_NAME],
    [PROD_DATABASE_TYPE]: OptionValues[PROD_DATABASE_TYPE].mysql,
    [SEARCH_ENGINE]: OptionValues[SEARCH_ENGINE].false,
    [SERVICE_DISCOVERY_TYPE]: false, // default value for this is treated specially based on application type
    [SKIP_CLIENT]: OptionValues[SKIP_CLIENT],
    [SKIP_SERVER]: OptionValues[SKIP_SERVER],
    [SKIP_USER_MANAGEMENT]: OptionValues[SKIP_USER_MANAGEMENT],
    [TEST_FRAMEWORKS]: [],
    [WEBSOCKET]: OptionValues[WEBSOCKET].false
  };
}
