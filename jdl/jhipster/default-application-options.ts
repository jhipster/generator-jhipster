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

import applicationTypes from './application-types.js';
import authenticationTypes from './authentication-types.js';
import databaseTypes from './database-types.js';
import applicationOptions from './application-options.js';
import cacheTypes from './cache-types.js';
import serviceDiscoveryTypes from './service-discovery-types.js';
import clientFrameworkTypes from './client-framework-types.js';
import buildToolTypes from './build-tool-types.js';

const { MONOLITH, MICROSERVICE, GATEWAY } = applicationTypes;
const { EUREKA } = serviceDiscoveryTypes;
const { COUCHBASE, CASSANDRA, MONGODB, NEO4J, SQL, H2_DISK, POSTGRESQL } = databaseTypes;
const NO_DATABASE_TYPE = databaseTypes.NO;
const { OptionNames, OptionValues } = applicationOptions;
const { JWT, OAUTH2 } = authenticationTypes;
const { ANGULAR, NO: NO_CLIENT_FRAMEWORK } = clientFrameworkTypes;
const { EHCACHE, HAZELCAST } = cacheTypes;

const NO_CACHE_PROVIDER = cacheTypes.NO;
const NO_SERVICE_DISCOVERY = serviceDiscoveryTypes.NO;

const { MAVEN } = buildToolTypes;

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
  // TODO: This key is missing, investigate if this is a bug.
  // eslint-disable-next-line @typescript-eslint/ban-ts-comment
  // @ts-expect-error
  USE_NPM,
  WEBSOCKET,
  ENABLE_GRADLE_ENTERPRISE,
  GRADLE_ENTERPRISE_HOST,
} = OptionNames;

const commonDefaultOptions = {
  [AUTHENTICATION_TYPE]: JWT,
  [BUILD_TOOL]: MAVEN,
};

export function getConfigForApplicationType(applicationType = undefined, customOptions = {}) {
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

export function getConfigForMonolithApplication(customOptions: any = {}): any {
  const options = {
    ...commonDefaultOptions,
    [CACHE_PROVIDER]: EHCACHE,
    [CLIENT_FRAMEWORK]: ANGULAR,
    [SERVER_PORT]: OptionValues[SERVER_PORT],
    [SERVICE_DISCOVERY_TYPE]: NO_SERVICE_DISCOVERY,
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
  if (options[AUTHENTICATION_TYPE] === OAUTH2) {
    options[SKIP_USER_MANAGEMENT] = true;
  }
  if (options[SKIP_CLIENT]) {
    options[CLIENT_FRAMEWORK] = NO_CLIENT_FRAMEWORK;
  }
  return {
    ...options,
    [APPLICATION_TYPE]: MONOLITH,
  };
}

export function getConfigForGatewayApplication(customOptions: any = {}): any {
  const options = {
    ...commonDefaultOptions,
    [CLIENT_FRAMEWORK]: ANGULAR,
    [SERVER_PORT]: OptionValues[SERVER_PORT],
    [SERVICE_DISCOVERY_TYPE]: EUREKA,
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
  if (options[AUTHENTICATION_TYPE] === OAUTH2) {
    options[SKIP_USER_MANAGEMENT] = true;
  }
  options[CACHE_PROVIDER] = NO_CACHE_PROVIDER;
  options[ENABLE_HIBERNATE_CACHE] = false;
  return {
    ...options,
    [REACTIVE]: true,
    [APPLICATION_TYPE]: GATEWAY,
  };
}

export function getConfigForMicroserviceApplication(customOptions: any = {}): any {
  const DEFAULT_SERVER_PORT = '8081';
  const options = {
    ...commonDefaultOptions,
    [CACHE_PROVIDER]: HAZELCAST,
    [SERVER_PORT]: DEFAULT_SERVER_PORT,
    [SERVICE_DISCOVERY_TYPE]: EUREKA,
    [SKIP_USER_MANAGEMENT]: true,
    ...customOptions,
  };
  if (options[SKIP_CLIENT] === undefined) {
    options[SKIP_CLIENT] = options[CLIENT_FRAMEWORK] === undefined || options[CLIENT_FRAMEWORK] === NO_CLIENT_FRAMEWORK;
  }
  if (options[SKIP_CLIENT]) {
    options[CLIENT_FRAMEWORK] = NO_CLIENT_FRAMEWORK;
    delete options[SKIP_SERVER];
  }
  delete options[CLIENT_THEME];
  delete options[CLIENT_THEME_VARIANT];
  delete options[WITH_ADMIN_UI];
  if (typeof options[SKIP_USER_MANAGEMENT] !== 'boolean') {
    options[SKIP_USER_MANAGEMENT] = true;
  }
  return {
    ...options,
    [APPLICATION_TYPE]: MICROSERVICE,
  };
}

export function getDefaultConfigForNewApplication(customOptions: any = {}): any {
  const options = {
    ...commonDefaultOptions,
    [BASE_NAME]: OptionValues[BASE_NAME],
    [DATABASE_TYPE]: SQL,
    [DEV_DATABASE_TYPE]: H2_DISK,
    [CACHE_PROVIDER]: EHCACHE,
    [ENABLE_HIBERNATE_CACHE]: OptionValues[ENABLE_HIBERNATE_CACHE],
    [ENABLE_SWAGGER_CODEGEN]: OptionValues[ENABLE_SWAGGER_CODEGEN],
    [ENABLE_TRANSLATION]: OptionValues[ENABLE_TRANSLATION],
    [JHI_PREFIX]: OptionValues[JHI_PREFIX],
    [LANGUAGES]: OptionValues[LANGUAGES],
    [MESSAGE_BROKER]: OptionValues[MESSAGE_BROKER].no,
    [PROD_DATABASE_TYPE]: POSTGRESQL,
    [SEARCH_ENGINE]: OptionValues[SEARCH_ENGINE].no,
    [TEST_FRAMEWORKS]: [],
    [WEBSOCKET]: OptionValues[WEBSOCKET].no,
    [ENABLE_GRADLE_ENTERPRISE]: OptionValues[ENABLE_GRADLE_ENTERPRISE],
    [GRADLE_ENTERPRISE_HOST]: OptionValues[GRADLE_ENTERPRISE_HOST],
    ...customOptions,
  };
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
  if (options[SKIP_CLIENT]) {
    options[CLIENT_FRAMEWORK] = NO_CLIENT_FRAMEWORK;
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
  if ([MONGODB, COUCHBASE, CASSANDRA, NEO4J, NO_DATABASE_TYPE].includes(options[DATABASE_TYPE])) {
    options[DEV_DATABASE_TYPE] = options[DATABASE_TYPE];
    options[PROD_DATABASE_TYPE] = options[DATABASE_TYPE];
    if (NO_DATABASE_TYPE !== options[DATABASE_TYPE]) {
      options[ENABLE_HIBERNATE_CACHE] = false;
    }
  }
  if (options[REACTIVE]) {
    options[CACHE_PROVIDER] = NO_CACHE_PROVIDER;
  } else {
    options[REACTIVE] = OptionValues[REACTIVE];
  }
  return options;
}
