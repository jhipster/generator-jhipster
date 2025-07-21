/**
 * Copyright 2013-2025 the original author or authors from the JHipster project.
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

import type { ConfigAll } from '../types/application-config-all.js';
import { APPLICATION_TYPE_GATEWAY, APPLICATION_TYPE_MICROSERVICE, APPLICATION_TYPE_MONOLITH } from '../core/application-types.ts';
import authenticationTypes from './authentication-types.js';
import databaseTypes from './database-types.js';
import applicationOptions from './application-options.js';
import cacheTypes from './cache-types.js';
import serviceDiscoveryTypes from './service-discovery-types.js';
import clientFrameworkTypes from './client-framework-types.js';
import buildToolTypes from './build-tool-types.js';

const { CONSUL } = serviceDiscoveryTypes;
const { SQL, POSTGRESQL } = databaseTypes;
const { OptionNames, OptionValues } = applicationOptions;
const { JWT, OAUTH2 } = authenticationTypes;
const { ANGULAR, NO: NO_CLIENT_FRAMEWORK } = clientFrameworkTypes;
const { EHCACHE, HAZELCAST } = cacheTypes;

const { NO: NO_CACHE_PROVIDER, MEMCACHED } = cacheTypes;
const NO_SERVICE_DISCOVERY = serviceDiscoveryTypes.NO;

const { MAVEN } = buildToolTypes;

const {
  APPLICATION_TYPE,
  AUTHENTICATION_TYPE,
  BASE_NAME,
  BUILD_TOOL,
  CACHE_PROVIDER,
  CLIENT_FRAMEWORK,
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
  WEBSOCKET,
  ENABLE_GRADLE_DEVELOCITY,
  GRADLE_DEVELOCITY_HOST,
} = OptionNames;

type ApplicationDefaults = Partial<ConfigAll>;

const commonDefaultOptions: ApplicationDefaults = {
  [AUTHENTICATION_TYPE]: JWT,
  [BUILD_TOOL]: MAVEN,
  [DTO_SUFFIX]: OptionValues[DTO_SUFFIX],
  [ENABLE_SWAGGER_CODEGEN]: OptionValues[ENABLE_SWAGGER_CODEGEN],
  [ENABLE_TRANSLATION]: OptionValues[ENABLE_TRANSLATION],
  [ENTITY_SUFFIX]: OptionValues[ENTITY_SUFFIX],
  [JHI_PREFIX]: OptionValues[JHI_PREFIX],
  messageBroker: 'no',
  [SEARCH_ENGINE]: OptionValues[SEARCH_ENGINE].no,
  [WEBSOCKET]: OptionValues[WEBSOCKET].no,
};

export function getConfigWithDefaults(customOptions: ApplicationDefaults = {}): ApplicationDefaults {
  const applicationType = customOptions.applicationType;
  if (applicationType === APPLICATION_TYPE_GATEWAY) {
    return getConfigForGatewayApplication(customOptions);
  }
  if (applicationType === APPLICATION_TYPE_MICROSERVICE) {
    return getConfigForMicroserviceApplication(customOptions);
  }
  return getConfigForMonolithApplication(customOptions);
}

function getConfigForClientApplication(options: ApplicationDefaults = {}): ApplicationDefaults {
  if (options[SKIP_CLIENT]) {
    options[CLIENT_FRAMEWORK] = NO_CLIENT_FRAMEWORK;
  }
  const clientFramework = options[CLIENT_FRAMEWORK];
  if (clientFramework === NO_CLIENT_FRAMEWORK) {
    return options;
  }
  if (options[OptionNames.MICROFRONTEND] === undefined) {
    options[OptionNames.MICROFRONTEND] = Boolean(options[OptionNames.MICROFRONTENDS]?.length);
  }
  if (!options[CLIENT_THEME]) {
    options[CLIENT_THEME] = OptionValues[CLIENT_THEME];
  } else if (options[CLIENT_THEME] !== OptionValues[CLIENT_THEME] && !options[CLIENT_THEME_VARIANT]) {
    options[CLIENT_THEME_VARIANT] = 'primary';
  }
  if (clientFramework === 'vue') {
    options.clientBundler ??= options.microfrontend || options.applicationType === 'microservice' ? 'webpack' : 'vite';
    options.devServerPort ??= options.clientBundler === 'webpack' ? 9060 : 9000;
  } else if (clientFramework === 'react') {
    options.clientBundler ??= 'webpack';
    options.devServerPort ??= 9060;
  } else if (clientFramework === 'angular') {
    options.clientBundler ??= 'webpack';
    options.devServerPort ??= 4200;
  } else {
    options.devServerPort ??= 9060;
  }
  options.devServerPortProxy ??= options.clientBundler === 'webpack' ? 9000 : undefined;

  return options;
}

function getConfigForAuthenticationType(options: ApplicationDefaults = {}): ApplicationDefaults {
  if (typeof options[SKIP_USER_MANAGEMENT] !== 'boolean') {
    if (options[AUTHENTICATION_TYPE] === OAUTH2) {
      options[SKIP_USER_MANAGEMENT] = true;
    } else {
      options[SKIP_USER_MANAGEMENT] = OptionValues[SKIP_USER_MANAGEMENT];
    }
  }
  return options;
}

function getConfigForPackageName(options: ApplicationDefaults = {}): ApplicationDefaults {
  if (!options[PACKAGE_NAME]) {
    if (!options[PACKAGE_FOLDER]) {
      options[PACKAGE_NAME] = OptionValues[PACKAGE_NAME];
    } else {
      options[PACKAGE_NAME] = options[PACKAGE_FOLDER].split('/').filter(Boolean).join('.');
    }
  }
  return options;
}

function getConfigForCacheProvider(options: ApplicationDefaults = {}): ApplicationDefaults {
  if (options[REACTIVE] || options[CACHE_PROVIDER] === undefined) {
    options[CACHE_PROVIDER] = NO_CACHE_PROVIDER;
  }
  options[ENABLE_HIBERNATE_CACHE] ??=
    options[DATABASE_TYPE] === SQL && !options[REACTIVE] && ![NO_CACHE_PROVIDER as string, MEMCACHED].includes(options[CACHE_PROVIDER]);
  return options;
}

function getConfigForReactive(options: ApplicationDefaults = {}): ApplicationDefaults {
  if (options[REACTIVE] === undefined) {
    options[REACTIVE] = false;
  }
  return options;
}

function getConfigForTranslation(options: ApplicationDefaults = {}): ApplicationDefaults {
  if (options[ENABLE_TRANSLATION] === undefined) {
    options[ENABLE_TRANSLATION] = true;
  }
  if (options[NATIVE_LANGUAGE] === undefined) {
    options[NATIVE_LANGUAGE] = 'en';
  }
  if (options[ENABLE_TRANSLATION] && options[LANGUAGES] === undefined) {
    options[LANGUAGES] = [];
  }
  return options;
}

function getConfigForDatabaseType(options: ApplicationDefaults = {}): ApplicationDefaults {
  if (options[DATABASE_TYPE] === undefined) {
    options[DATABASE_TYPE] = SQL;
  }
  if (options[DATABASE_TYPE] === SQL) {
    if (options[PROD_DATABASE_TYPE] === undefined) {
      options[PROD_DATABASE_TYPE] = POSTGRESQL;
    }
    if (options[DEV_DATABASE_TYPE] === undefined) {
      options[DEV_DATABASE_TYPE] = options[PROD_DATABASE_TYPE];
    }
  }
  options.databaseMigration ??= options.databaseType === SQL ? 'liquibase' : 'no';

  return options;
}

function getServerConfigForMonolithApplication(customOptions: ApplicationDefaults = {}): ApplicationDefaults {
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
    [APPLICATION_TYPE]: APPLICATION_TYPE_MONOLITH,
  };
}

export function getConfigForMonolithApplication(customOptions: ApplicationDefaults = {}): ApplicationDefaults {
  let options = getServerConfigForMonolithApplication(customOptions);
  options = getConfigForClientApplication(options);
  options = getConfigForPackageName(options);
  options = getConfigForDatabaseType(options);
  options = getConfigForCacheProvider(options);
  options = getConfigForReactive(options);
  options = getConfigForTranslation(options);
  return getConfigForAuthenticationType(options);
}

function getServerConfigForGatewayApplication(customOptions: ApplicationDefaults = {}): ApplicationDefaults {
  const options = {
    ...commonDefaultOptions,
    [CLIENT_FRAMEWORK]: ANGULAR,
    [SERVER_PORT]: OptionValues[SERVER_PORT],
    [SERVICE_DISCOVERY_TYPE]: CONSUL,
    [WITH_ADMIN_UI]: true,
    ...customOptions,
  };
  options[CACHE_PROVIDER] = NO_CACHE_PROVIDER;
  options[ENABLE_HIBERNATE_CACHE] = false;

  return {
    [REACTIVE]: true,
    ...options,
    [APPLICATION_TYPE]: APPLICATION_TYPE_GATEWAY,
  };
}

export function getConfigForGatewayApplication(customOptions: ApplicationDefaults = {}): ApplicationDefaults {
  let options = getServerConfigForGatewayApplication(customOptions);
  options = getConfigForClientApplication(options);
  options = getConfigForPackageName(options);
  options = getConfigForDatabaseType(options);
  options = getConfigForCacheProvider(options);
  options = getConfigForReactive(options);
  options = getConfigForTranslation(options);
  return getConfigForAuthenticationType(options);
}

function getServerConfigForMicroserviceApplication(customOptions: ApplicationDefaults = {}): ApplicationDefaults {
  const DEFAULT_SERVER_PORT = 8081;
  const options = {
    ...commonDefaultOptions,
    [CACHE_PROVIDER]: HAZELCAST,
    [SERVER_PORT]: DEFAULT_SERVER_PORT,
    [SERVICE_DISCOVERY_TYPE]: CONSUL,
    [SKIP_USER_MANAGEMENT]: true,
    [CLIENT_FRAMEWORK]: NO_CLIENT_FRAMEWORK,
    ...customOptions,
  };

  options[WITH_ADMIN_UI] = false;
  return {
    ...options,
    [APPLICATION_TYPE]: APPLICATION_TYPE_MICROSERVICE,
  };
}

export function getConfigForMicroserviceApplication(customOptions: ApplicationDefaults = {}): ApplicationDefaults {
  let options = getServerConfigForMicroserviceApplication(customOptions);
  options = getConfigForClientApplication(options);
  options = getConfigForPackageName(options);
  options = getConfigForDatabaseType(options);
  options = getConfigForCacheProvider(options);
  options = getConfigForReactive(options);
  options = getConfigForTranslation(options);
  return getConfigForAuthenticationType(options);
}

export function getDefaultConfigForNewApplication(customOptions: ApplicationDefaults = {}): ApplicationDefaults {
  const options = {
    ...commonDefaultOptions,
    [BASE_NAME]: OptionValues[BASE_NAME],
    [LANGUAGES]: OptionValues[LANGUAGES],
    [TEST_FRAMEWORKS]: [],
    [ENABLE_GRADLE_DEVELOCITY]: OptionValues[ENABLE_GRADLE_DEVELOCITY],
    [GRADLE_DEVELOCITY_HOST]: OptionValues[GRADLE_DEVELOCITY_HOST],
    ...customOptions,
  };
  return getConfigWithDefaults(options);
}
