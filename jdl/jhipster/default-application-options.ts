/**
 * Copyright 2013-2024 the original author or authors from the JHipster project.
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

import { MESSAGE_BROKER_NO } from '../../generators/server/options/index.js';
import { JSONGeneratorJhipsterContent } from '../../jdl/converters/types.js';
import applicationTypes from './application-types.js';
import authenticationTypes from './authentication-types.js';
import databaseTypes from './database-types.js';
import applicationOptions from './application-options.js';
import cacheTypes from './cache-types.js';
import serviceDiscoveryTypes from './service-discovery-types.js';
import clientFrameworkTypes from './client-framework-types.js';
import buildToolTypes from './build-tool-types.js';

const { MONOLITH, MICROSERVICE, GATEWAY } = applicationTypes;
const { CONSUL } = serviceDiscoveryTypes;
const { COUCHBASE, CASSANDRA, MONGODB, NEO4J, SQL, POSTGRESQL } = databaseTypes;
const NO_DATABASE_TYPE = databaseTypes.NO;
const { OptionNames, OptionValues } = applicationOptions;
const { JWT, OAUTH2 } = authenticationTypes;
const { ANGULAR, NO: NO_CLIENT_FRAMEWORK } = clientFrameworkTypes;
const { EHCACHE, HAZELCAST } = cacheTypes;

const NO_CACHE_PROVIDER = cacheTypes.NO;
const NO_SERVICE_DISCOVERY = serviceDiscoveryTypes.NO;

const { MAVEN } = buildToolTypes;

const {
  AUTHENTICATION_TYPE,
  BASE_NAME,
  CLIENT_FRAMEWORK,
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
  NATIVE_LANGUAGE,
  PACKAGE_FOLDER,
  PACKAGE_NAME,
  PROD_DATABASE_TYPE,
  REACTIVE,
  SEARCH_ENGINE,
  SERVER_PORT,
  SKIP_CLIENT,
  SKIP_USER_MANAGEMENT,
  WEBSOCKET,
  ENABLE_GRADLE_ENTERPRISE,
  GRADLE_ENTERPRISE_HOST,
} = OptionNames;

const commonDefaultOptions = {
  authenticationType: JWT as string,
  buildTool: MAVEN as string,
  dtoSuffix: OptionValues[DTO_SUFFIX] as string,
  enableSwaggerCodegen: OptionValues[ENABLE_SWAGGER_CODEGEN] as boolean,
  enableTranslation: OptionValues[ENABLE_TRANSLATION] as boolean,
  entitySuffix: OptionValues[ENTITY_SUFFIX] as string,
  jhiPrefix: OptionValues[JHI_PREFIX] as string,
  messageBroker: MESSAGE_BROKER_NO as string,
  searchEngine: (OptionValues[SEARCH_ENGINE] as Record<string, string>).no,
  websocket: (OptionValues[WEBSOCKET] as Record<string, string>).no,
};

export function getConfigWithDefaults(
  customOptions: string | Partial<JSONGeneratorJhipsterContent> = {},
): Partial<JSONGeneratorJhipsterContent> {
  const isCustomOptionString = typeof customOptions === 'string';
  const applicationType = isCustomOptionString ? customOptions : customOptions.applicationType;
  if (applicationType === GATEWAY) {
    return getConfigForGatewayApplication(isCustomOptionString ? {} : customOptions);
  }
  if (applicationType === MICROSERVICE) {
    return getConfigForMicroserviceApplication(isCustomOptionString ? {} : customOptions);
  }
  return getConfigForMonolithApplication(isCustomOptionString ? {} : customOptions);
}

export function getConfigForClientApplication(options: Partial<JSONGeneratorJhipsterContent> = {}): Partial<JSONGeneratorJhipsterContent> {
  if (options[SKIP_CLIENT]) {
    options.clientFramework = NO_CLIENT_FRAMEWORK;
  }
  if (options[OptionNames.MICROFRONTEND] === undefined) {
    options.microfrontend = Boolean(options.microfrontends?.length);
  }
  const clientFramework = options[CLIENT_FRAMEWORK];
  if (clientFramework !== NO_CLIENT_FRAMEWORK) {
    if (!options[CLIENT_THEME]) {
      options.clientTheme = OptionValues[CLIENT_THEME] as string;
      options.clientThemeVariant = '';
    } else if (options[CLIENT_THEME] !== OptionValues[CLIENT_THEME] && !options[CLIENT_THEME_VARIANT]) {
      options.clientThemeVariant = 'primary';
    }
  }
  return options;
}

export function getConfigForAuthenticationType(options: Partial<JSONGeneratorJhipsterContent> = {}): Partial<JSONGeneratorJhipsterContent> {
  if (typeof options[SKIP_USER_MANAGEMENT] !== 'boolean') {
    if (options[AUTHENTICATION_TYPE] === OAUTH2) {
      options.skipUserManagement = true;
    } else {
      options.skipUserManagement = OptionValues[SKIP_USER_MANAGEMENT] as boolean;
    }
  }
  return options;
}

export function getConfigForPackageName(options: Partial<JSONGeneratorJhipsterContent> = {}): Partial<JSONGeneratorJhipsterContent> {
  if (!options[PACKAGE_NAME] && !options[PACKAGE_FOLDER]) {
    options.packageFolder = OptionValues[PACKAGE_FOLDER] as string;
  }
  if (!options[PACKAGE_NAME] && options[PACKAGE_FOLDER]) {
    options.packageName = options[PACKAGE_FOLDER].replace(/\//g, '.');
  }
  if (!options[PACKAGE_FOLDER] && options[PACKAGE_NAME]) {
    options.packageFolder = options[PACKAGE_NAME].replace(/\./g, '/');
  }
  return options;
}

export function getConfigForCacheProvider(options: Partial<JSONGeneratorJhipsterContent> = {}): Partial<JSONGeneratorJhipsterContent> {
  if (options[REACTIVE]) {
    options.cacheProvider = NO_CACHE_PROVIDER;
  }
  return options;
}

export function getConfigForReactive(options: Partial<JSONGeneratorJhipsterContent> = {}): Partial<JSONGeneratorJhipsterContent> {
  if (options[REACTIVE] === undefined) {
    options.reactive = false;
  }
  return options;
}

export function getConfigForTranslation(options: Partial<JSONGeneratorJhipsterContent> = {}): Partial<JSONGeneratorJhipsterContent> {
  if (options[ENABLE_TRANSLATION] === undefined) {
    options.enableTranslation = true;
  }
  if (options[NATIVE_LANGUAGE] === undefined) {
    options.nativeLanguage = 'en';
  }
  if (options[ENABLE_TRANSLATION] && options[LANGUAGES] === undefined) {
    options.languages = [];
  }
  return options;
}

export function getConfigForDatabaseType(options: Partial<JSONGeneratorJhipsterContent> = {}): Partial<JSONGeneratorJhipsterContent> {
  if (options[DATABASE_TYPE] === undefined) {
    options.databaseType = SQL;
  }
  if (options[DATABASE_TYPE] === SQL) {
    if (options[PROD_DATABASE_TYPE] === undefined) {
      options.prodDatabaseType = POSTGRESQL;
    }
    if (options[DEV_DATABASE_TYPE] === undefined) {
      options.devDatabaseType = options[PROD_DATABASE_TYPE];
    }
  } else if ([MONGODB, COUCHBASE, CASSANDRA, NEO4J, NO_DATABASE_TYPE].includes(options[DATABASE_TYPE])) {
    if (NO_DATABASE_TYPE !== options[DATABASE_TYPE]) {
      options.enableHibernateCache = false;
    }
  }
  if (options[REACTIVE]) {
    options.enableHibernateCache = false;
  }
  if (options[ENABLE_HIBERNATE_CACHE] === undefined) {
    options.enableHibernateCache = true;
  }
  return options;
}

export function getServerConfigForMonolithApplication(
  customOptions: Partial<JSONGeneratorJhipsterContent> = {},
): Partial<JSONGeneratorJhipsterContent> {
  const options = {
    ...commonDefaultOptions,
    cacheProvider: EHCACHE,
    clientFramework: ANGULAR,
    serverPort: OptionValues[SERVER_PORT] as number,
    serviceDiscoveryType: NO_SERVICE_DISCOVERY,
    withAdminUi: true,
    ...customOptions,
  };
  return {
    ...options,
    applicationType: MONOLITH,
  };
}

export function getConfigForMonolithApplication(
  customOptions: Partial<JSONGeneratorJhipsterContent> = {},
): Partial<JSONGeneratorJhipsterContent> {
  let options = getServerConfigForMonolithApplication(customOptions);
  options = getConfigForClientApplication(options);
  options = getConfigForPackageName(options);
  options = getConfigForCacheProvider(options);
  options = getConfigForDatabaseType(options);
  options = getConfigForReactive(options);
  options = getConfigForTranslation(options);
  return getConfigForAuthenticationType(options);
}

export function getServerConfigForGatewayApplication(
  customOptions: Partial<JSONGeneratorJhipsterContent> = {},
): Partial<JSONGeneratorJhipsterContent> {
  const options = {
    ...commonDefaultOptions,
    clientFramework: ANGULAR,
    serverPort: OptionValues[SERVER_PORT] as number,
    serviceDiscoveryType: CONSUL,
    withAdminUi: true,
    ...customOptions,
  };
  options.cacheProvider = NO_CACHE_PROVIDER;
  options.enableHibernateCache = false;

  return {
    reactive: true,
    ...options,
    applicationType: GATEWAY,
  };
}

export function getConfigForGatewayApplication(
  customOptions: Partial<JSONGeneratorJhipsterContent> = {},
): Partial<JSONGeneratorJhipsterContent> {
  let options = getServerConfigForGatewayApplication(customOptions);
  options = getConfigForClientApplication(options);
  options = getConfigForPackageName(options);
  options = getConfigForCacheProvider(options);
  options = getConfigForDatabaseType(options);
  options = getConfigForReactive(options);
  options = getConfigForTranslation(options);
  return getConfigForAuthenticationType(options);
}

export function getServerConfigForMicroserviceApplication(
  customOptions: Partial<JSONGeneratorJhipsterContent> = {},
): Partial<JSONGeneratorJhipsterContent> {
  const DEFAULT_SERVER_PORT = 8081;
  const options = {
    ...commonDefaultOptions,
    cacheProvider: HAZELCAST,
    serverPort: DEFAULT_SERVER_PORT,
    serviceDiscoveryType: CONSUL,
    skipUserManagement: true,
    clientFramework: NO_CLIENT_FRAMEWORK,
    ...customOptions,
  };

  options.withAdminUi = false;
  return {
    ...options,
    applicationType: MICROSERVICE,
  };
}

export function getConfigForMicroserviceApplication(
  customOptions: Partial<JSONGeneratorJhipsterContent> = {},
): Partial<JSONGeneratorJhipsterContent> {
  let options = getServerConfigForMicroserviceApplication(customOptions);
  options = getConfigForClientApplication(options);
  options = getConfigForPackageName(options);
  options = getConfigForCacheProvider(options);
  options = getConfigForDatabaseType(options);
  options = getConfigForReactive(options);
  options = getConfigForTranslation(options);
  return getConfigForAuthenticationType(options);
}

export function getDefaultConfigForNewApplication(
  customOptions: Partial<JSONGeneratorJhipsterContent> = {},
): Partial<JSONGeneratorJhipsterContent> {
  const options = {
    ...commonDefaultOptions,
    baseName: OptionValues[BASE_NAME] as string,
    languages: OptionValues[LANGUAGES] as string[],
    testFrameworks: [],
    enableGradleEnterprise: OptionValues[ENABLE_GRADLE_ENTERPRISE] as boolean,
    gradleEnterpriseHost: OptionValues[GRADLE_ENTERPRISE_HOST] as string,
    ...customOptions,
  };
  return getConfigWithDefaults(options);
}
