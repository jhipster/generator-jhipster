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
  NATIVE_LANGUAGE,
  PACKAGE_FOLDER,
  PACKAGE_NAME,
  PROD_DATABASE_TYPE,
  REACTIVE,
  SEARCH_ENGINE,
  SERVER_PORT,
  SERVICE_DISCOVERY_TYPE,
  SKIP_CLIENT,
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
  [DTO_SUFFIX]: OptionValues[DTO_SUFFIX],
  [ENABLE_SWAGGER_CODEGEN]: OptionValues[ENABLE_SWAGGER_CODEGEN],
  [ENABLE_TRANSLATION]: OptionValues[ENABLE_TRANSLATION],
  [ENTITY_SUFFIX]: OptionValues[ENTITY_SUFFIX],
  [JHI_PREFIX]: OptionValues[JHI_PREFIX],
  [MESSAGE_BROKER]: OptionValues[MESSAGE_BROKER].no,
  [SEARCH_ENGINE]: OptionValues[SEARCH_ENGINE].no,
  [WEBSOCKET]: OptionValues[WEBSOCKET].no,
};

export function getConfigWithDefaults(customOptions: string | Record<string, any> = {}) {
  const applicationType = typeof customOptions === 'string' ? customOptions : customOptions.applicationType;
  if (applicationType === GATEWAY) {
    return getConfigForGatewayApplication(customOptions);
  }
  if (applicationType === MICROSERVICE) {
    return getConfigForMicroserviceApplication(customOptions);
  }
  return getConfigForMonolithApplication(customOptions);
}

export function getConfigForClientApplication(options: any = {}): any {
  if (options[SKIP_CLIENT]) {
    options[CLIENT_FRAMEWORK] = NO_CLIENT_FRAMEWORK;
  }
  const clientFramework = options[CLIENT_FRAMEWORK];
  if (clientFramework !== NO_CLIENT_FRAMEWORK) {
    if (!options[CLIENT_THEME]) {
      options[CLIENT_THEME] = OptionValues[CLIENT_THEME];
      options[CLIENT_THEME_VARIANT] = OptionValues[CLIENT_THEME_VARIANT].none;
    } else if (options[CLIENT_THEME] !== OptionValues[CLIENT_THEME] && !options[CLIENT_THEME_VARIANT]) {
      options[CLIENT_THEME_VARIANT] = OptionValues[CLIENT_THEME_VARIANT].default;
    }
  }
  return options;
}

export function getConfigForAuthenticationType(options: any = {}): any {
  if (typeof options[SKIP_USER_MANAGEMENT] !== 'boolean') {
    if (options[AUTHENTICATION_TYPE] === OAUTH2) {
      options[SKIP_USER_MANAGEMENT] = true;
    } else {
      options[SKIP_USER_MANAGEMENT] = OptionValues[SKIP_USER_MANAGEMENT];
    }
  }
  return options;
}

export function getConfigForPackageName(options: any = {}): any {
  if (!options[PACKAGE_NAME] && !options[PACKAGE_FOLDER]) {
    options[PACKAGE_FOLDER] = OptionValues[PACKAGE_FOLDER];
  }
  if (!options[PACKAGE_NAME] && options[PACKAGE_FOLDER]) {
    options[PACKAGE_NAME] = options[PACKAGE_FOLDER].replace(/\//g, '.');
  }
  if (!options[PACKAGE_FOLDER] && options[PACKAGE_NAME]) {
    options[PACKAGE_FOLDER] = options[PACKAGE_NAME].replace(/\./g, '/');
  }
  return options;
}

export function getConfigForCacheProvider(options: any = {}): any {
  if (options[REACTIVE]) {
    options[CACHE_PROVIDER] = NO_CACHE_PROVIDER;
  }
  return options;
}

export function getConfigForReactive(options: any = {}): any {
  if (options[REACTIVE] === undefined) {
    options[REACTIVE] = false;
  }
  return options;
}

export function getConfigForTranslation(options: any = {}): any {
  if (options[ENABLE_TRANSLATION] === undefined) {
    options[ENABLE_TRANSLATION] = true;
  }
  if (options[NATIVE_LANGUAGE] === undefined) {
    options[NATIVE_LANGUAGE] = 'en';
  }
  if (options[ENABLE_TRANSLATION] && options[LANGUAGES] === undefined) {
    options[LANGUAGES] = ['en', 'fr'];
  }
  return options;
}

export function getConfigForDatabaseType(options: any = {}): any {
  if (options[DATABASE_TYPE] === undefined) {
    options[DATABASE_TYPE] = SQL;
  }
  if (options[DATABASE_TYPE] === SQL) {
    if (options[PROD_DATABASE_TYPE] === undefined) {
      options[PROD_DATABASE_TYPE] = POSTGRESQL;
    }
    if (options[DEV_DATABASE_TYPE] === undefined) {
      options[DEV_DATABASE_TYPE] = H2_DISK;
    }
  } else if ([MONGODB, COUCHBASE, CASSANDRA, NEO4J, NO_DATABASE_TYPE].includes(options[DATABASE_TYPE])) {
    options[DEV_DATABASE_TYPE] = options[DATABASE_TYPE];
    options[PROD_DATABASE_TYPE] = options[DATABASE_TYPE];
    if (NO_DATABASE_TYPE !== options[DATABASE_TYPE]) {
      options[ENABLE_HIBERNATE_CACHE] = false;
    }
  }
  if (options[REACTIVE]) {
    options[ENABLE_HIBERNATE_CACHE] = false;
  }
  if (options[ENABLE_HIBERNATE_CACHE] === undefined) {
    options[ENABLE_HIBERNATE_CACHE] = true;
  }
  return options;
}

export function getServerConfigForMonolithApplication(customOptions: any = {}): any {
  const options = {
    ...commonDefaultOptions,
    [CACHE_PROVIDER]: EHCACHE,
    [CLIENT_FRAMEWORK]: ANGULAR,
    [SERVER_PORT]: OptionValues[SERVER_PORT],
    [SERVICE_DISCOVERY_TYPE]: NO_SERVICE_DISCOVERY,
    [WITH_ADMIN_UI]: true,
    ...customOptions,
  };
  return {
    ...options,
    [APPLICATION_TYPE]: MONOLITH,
  };
}

export function getConfigForMonolithApplication(customOptions: any = {}): any {
  let options = getServerConfigForMonolithApplication(customOptions);
  options = getConfigForClientApplication(options);
  options = getConfigForPackageName(options);
  options = getConfigForCacheProvider(options);
  options = getConfigForDatabaseType(options);
  options = getConfigForReactive(options);
  options = getConfigForTranslation(options);
  return getConfigForAuthenticationType(options);
}

export function getServerConfigForGatewayApplication(customOptions: any = {}): any {
  const options = {
    ...commonDefaultOptions,
    [CLIENT_FRAMEWORK]: ANGULAR,
    [SERVER_PORT]: OptionValues[SERVER_PORT],
    [SERVICE_DISCOVERY_TYPE]: EUREKA,
    [WITH_ADMIN_UI]: true,
    ...customOptions,
  };
  options[CACHE_PROVIDER] = NO_CACHE_PROVIDER;
  options[ENABLE_HIBERNATE_CACHE] = false;

  return {
    ...options,
    [REACTIVE]: true,
    [APPLICATION_TYPE]: GATEWAY,
  };
}

export function getConfigForGatewayApplication(customOptions: any = {}): any {
  let options = getServerConfigForGatewayApplication(customOptions);
  options = getConfigForClientApplication(options);
  options = getConfigForPackageName(options);
  options = getConfigForCacheProvider(options);
  options = getConfigForDatabaseType(options);
  options = getConfigForReactive(options);
  options = getConfigForTranslation(options);
  return getConfigForAuthenticationType(options);
}

export function getServerConfigForMicroserviceApplication(customOptions: any = {}): any {
  const DEFAULT_SERVER_PORT = 8081;
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

  options[WITH_ADMIN_UI] = false;
  return {
    ...options,
    [APPLICATION_TYPE]: MICROSERVICE,
  };
}

export function getConfigForMicroserviceApplication(customOptions: any = {}): any {
  let options = getServerConfigForMicroserviceApplication(customOptions);
  options = getConfigForClientApplication(options);
  options = getConfigForPackageName(options);
  options = getConfigForCacheProvider(options);
  options = getConfigForDatabaseType(options);
  options = getConfigForReactive(options);
  options = getConfigForTranslation(options);
  return getConfigForAuthenticationType(options);
}

export function getDefaultConfigForNewApplication(customOptions: any = {}): any {
  const options = {
    ...commonDefaultOptions,
    [BASE_NAME]: OptionValues[BASE_NAME],
    [LANGUAGES]: OptionValues[LANGUAGES],
    [TEST_FRAMEWORKS]: [],
    [ENABLE_GRADLE_ENTERPRISE]: OptionValues[ENABLE_GRADLE_ENTERPRISE],
    [GRADLE_ENTERPRISE_HOST]: OptionValues[GRADLE_ENTERPRISE_HOST],
    ...customOptions,
  };
  if (!options[CLIENT_PACKAGE_MANAGER] && OptionValues[USE_NPM]) {
    options[CLIENT_PACKAGE_MANAGER] = OptionValues[CLIENT_PACKAGE_MANAGER].npm;
  }
  return getConfigWithDefaults(options);
}
