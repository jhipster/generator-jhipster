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
import {
  JSONGeneratorJhipsterApplicationtypeContent,
  JSONGeneratorJhipsterAuthenticationContent,
  JSONGeneratorJhipsterCacheProviderContent,
  JSONGeneratorJhipsterClientContent,
  JSONGeneratorJhipsterContent,
  JSONGeneratorJhipsterDatabaseContent,
  JSONGeneratorJhipsterPackageContent,
  JSONGeneratorJhipsterServerContent,
  JSONGeneratorJhipsterTranslationContent,
} from '../../jdl/converters/types.js';
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
): Omit<JSONGeneratorJhipsterContent, 'baseName'> {
  const isCustomOptionString = typeof customOptions === 'string';
  const applicationType = isCustomOptionString ? customOptions : customOptions.applicationType;
  if (applicationType === GATEWAY) {
    return getConfigForApplication(isCustomOptionString ? { applicationType } : { ...customOptions, applicationType: GATEWAY });
  }
  if (applicationType === MICROSERVICE) {
    return getConfigForApplication(isCustomOptionString ? { applicationType } : { ...customOptions, applicationType: MICROSERVICE });
  }
  return getConfigForApplication(isCustomOptionString ? { applicationType } : { ...customOptions, applicationType: MONOLITH });
}

export function getConfigForClientApplication(
  options: Partial<JSONGeneratorJhipsterContent> & JSONGeneratorJhipsterApplicationtypeContent,
): Partial<JSONGeneratorJhipsterContent> & JSONGeneratorJhipsterClientContent & JSONGeneratorJhipsterApplicationtypeContent {
  if (options[SKIP_CLIENT]) {
    options.clientFramework = NO_CLIENT_FRAMEWORK;
  } else {
    options.skipClient = false;
  }
  if (options[OptionNames.MICROFRONTEND] === undefined) {
    options.microfrontend = Boolean(options.microfrontends?.length);
  }
  if (options[CLIENT_FRAMEWORK] === undefined) {
    if (options.applicationType === MONOLITH || options.applicationType === GATEWAY) {
      options.clientFramework ??= ANGULAR;
    } else if (options.applicationType === MICROSERVICE) {
      options.clientFramework ??= NO_CLIENT_FRAMEWORK;
    }
  }
  if (options.withAdminUi === undefined) {
    if ((options.applicationType === MONOLITH || options.applicationType === GATEWAY) && options.clientFramework !== NO_CLIENT_FRAMEWORK) {
      options.withAdminUi ??= true;
    } else {
      options.withAdminUi ??= false;
    }
  }
  if (options[CLIENT_FRAMEWORK] !== NO_CLIENT_FRAMEWORK) {
    if (!options[CLIENT_THEME]) {
      options.clientTheme = OptionValues[CLIENT_THEME] as string;
      options.clientThemeVariant = '';
    } else if (options[CLIENT_THEME] !== OptionValues[CLIENT_THEME] && !options[CLIENT_THEME_VARIANT]) {
      options.clientThemeVariant = 'primary';
    }
  }
  return {
    ...options,
    skipClient: options.skipClient!,
    microfrontend: options.microfrontend!,
    clientFramework: options.clientFramework!,
    withAdminUi: options.withAdminUi!,
  };
}

export function getConfigForAuthenticationType(
  options: Partial<JSONGeneratorJhipsterContent> & JSONGeneratorJhipsterApplicationtypeContent,
): Partial<JSONGeneratorJhipsterContent> & JSONGeneratorJhipsterAuthenticationContent {
  if (options[AUTHENTICATION_TYPE] === undefined) {
    options.authenticationType = JWT;
  }
  if (typeof options[SKIP_USER_MANAGEMENT] !== 'boolean') {
    if (options[AUTHENTICATION_TYPE] === OAUTH2 || options.applicationType === MICROSERVICE) {
      options.skipUserManagement = true;
    } else {
      options.skipUserManagement = OptionValues[SKIP_USER_MANAGEMENT] as boolean;
    }
  }
  return {
    ...options,
    authenticationType: options.authenticationType!,
    skipUserManagement: options.skipUserManagement!,
  };
}

export function getConfigForPackageName(
  options: Partial<JSONGeneratorJhipsterContent> & JSONGeneratorJhipsterApplicationtypeContent,
): Partial<JSONGeneratorJhipsterContent> &
  Omit<JSONGeneratorJhipsterPackageContent, 'baseName'> &
  JSONGeneratorJhipsterApplicationtypeContent {
  if (!options[PACKAGE_NAME] && !options[PACKAGE_FOLDER]) {
    options.packageFolder = OptionValues[PACKAGE_FOLDER] as string;
  }
  if (!options[PACKAGE_NAME] && options[PACKAGE_FOLDER]) {
    options.packageName = options[PACKAGE_FOLDER].replace(/\//g, '.');
  }
  if (!options[PACKAGE_FOLDER] && options[PACKAGE_NAME]) {
    options.packageFolder = options[PACKAGE_NAME].replace(/\./g, '/');
  }
  return {
    ...options,
    packageFolder: options.packageFolder!,
    packageName: options.packageName!,
  };
}

export function getConfigForCacheProvider(
  options: Partial<JSONGeneratorJhipsterContent> & JSONGeneratorJhipsterApplicationtypeContent,
): Partial<JSONGeneratorJhipsterContent> & JSONGeneratorJhipsterCacheProviderContent & JSONGeneratorJhipsterApplicationtypeContent {
  if (options.cacheProvider === undefined) {
    if (options.applicationType === MONOLITH) {
      options.cacheProvider = EHCACHE;
    }
    if (options.applicationType === MICROSERVICE) {
      options.cacheProvider = HAZELCAST;
    }
  }
  if (options[REACTIVE] || options.applicationType === GATEWAY) {
    options.cacheProvider = NO_CACHE_PROVIDER;
  }
  return {
    ...options,
    cacheProvider: options.cacheProvider!,
  };
}

export function getConfigForReactive(
  options: Partial<JSONGeneratorJhipsterContent> & JSONGeneratorJhipsterApplicationtypeContent,
): Partial<JSONGeneratorJhipsterContent> & JSONGeneratorJhipsterApplicationtypeContent {
  if (options[REACTIVE] === undefined) {
    if (options.applicationType === GATEWAY) {
      options.reactive = true;
    } else {
      options.reactive = false;
    }
  }
  return options;
}

export function getConfigForTranslation(
  options: Partial<JSONGeneratorJhipsterContent> & JSONGeneratorJhipsterApplicationtypeContent,
): Partial<JSONGeneratorJhipsterContent> & JSONGeneratorJhipsterTranslationContent & JSONGeneratorJhipsterApplicationtypeContent {
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

export function getConfigForDatabaseType(
  options: Partial<JSONGeneratorJhipsterContent> & JSONGeneratorJhipsterApplicationtypeContent,
): Partial<JSONGeneratorJhipsterContent> & JSONGeneratorJhipsterDatabaseContent & JSONGeneratorJhipsterApplicationtypeContent {
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
  if (options[REACTIVE] || options.applicationType === GATEWAY) {
    options.enableHibernateCache = false;
  }
  if (options[ENABLE_HIBERNATE_CACHE] === undefined) {
    options.enableHibernateCache = true;
  }
  return {
    ...options,
    databaseType: options.databaseType!,
    enableHibernateCache: options.enableHibernateCache!,
  };
}

export function getConfigForApplication(
  customOptions: Partial<JSONGeneratorJhipsterContent> & JSONGeneratorJhipsterApplicationtypeContent,
): Omit<JSONGeneratorJhipsterContent, 'baseName'> {
  const serverOptions = getConfigForServer(customOptions);
  const clientOptions = getConfigForClientApplication(serverOptions);
  const packageNameOptions = getConfigForPackageName(clientOptions);
  const cacheProviderOptions = getConfigForCacheProvider(packageNameOptions);
  const databaseTypeOptions = getConfigForDatabaseType(cacheProviderOptions);
  const reactiveOptions = getConfigForReactive(databaseTypeOptions);
  const translationOptions = getConfigForTranslation(reactiveOptions);
  const authenticationOptions = getConfigForAuthenticationType(translationOptions);
  return {
    ...authenticationOptions,
  };
}

export function getConfigForServer(
  options: Partial<JSONGeneratorJhipsterContent> & JSONGeneratorJhipsterApplicationtypeContent,
): Partial<JSONGeneratorJhipsterContent> & JSONGeneratorJhipsterServerContent & JSONGeneratorJhipsterApplicationtypeContent {
  if (options.serviceDiscoveryType === undefined) {
    if (options.applicationType === MONOLITH) {
      options.serviceDiscoveryType = NO_SERVICE_DISCOVERY;
    } else if (options.applicationType === GATEWAY || options.applicationType === MICROSERVICE) {
      options.serviceDiscoveryType = CONSUL;
    }
  }
  if (options.serverPort === undefined) {
    if (options.applicationType === MICROSERVICE) {
      options.serverPort = 8081;
    } else {
      options.serverPort = OptionValues[SERVER_PORT] as number;
    }
  }
  return {
    ...commonDefaultOptions,
    ...options,
    serverPort: options.serverPort!,
    serviceDiscoveryType: options.serviceDiscoveryType!,
  };
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
