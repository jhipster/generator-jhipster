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

const { GATEWAY, MONOLITH, MICROSERVICE } = require('./application-types');
const {
  CASSANDRA,
  COUCHBASE,
  MARIADB,
  MONGODB,
  MSSQL,
  MYSQL,
  NEO4J,
  ORACLE,
  POSTGRESQL,
  SQL,
  H2_DISK,
  H2_MEMORY,
} = require('./database-types');
const { KAFKA } = require('./message-broker-types');
const messageBrokerTypes = require('./message-broker-types');
const databaseTypes = require('./database-types');

const NO_DATABASE = databaseTypes.NO;
const { JWT, OAUTH2, SESSION } = require('./authentication-types');
const { MAVEN, GRADLE } = require('./build-tool-types');
const { CAFFEINE, EHCACHE, HAZELCAST, INFINISPAN, MEMCACHED, REDIS } = require('./cache-types');
const cacheTypes = require('./cache-types');

const NO_CACHE_PROVIDER = cacheTypes.NO;

const { PROTRACTOR, CYPRESS, CUCUMBER, GATLING } = require('./test-framework-types');
const { ANGULAR_X, ANGULAR, REACT, VUE, SVELTE } = require('./client-framework-types');
const { ELASTICSEARCH } = require('./search-engine-types');
const searchEngines = require('./search-engine-types');

const NO_MESSAGE_BROKER = messageBrokerTypes.NO;
const NO_SEARCH_ENGINE = searchEngines.FALSE;
const COUCHBASE_SEARCH_ENGINE = searchEngines.COUCHBASE;

const { EUREKA, CONSUL } = require('./service-discovery-types');
const serviceDiscovery = require('./service-discovery-types');

const FALSE_SERVICE_DISCOVERY = serviceDiscovery.FALSE;
const NO_SERVICE_DISCOVERY = serviceDiscovery.NO;

const { SPRING_WEBSOCKET } = require('./websocket-types');
const websocketTypes = require('./websocket-types');

const NO_WEBSOCKET = websocketTypes.FALSE;

const ApplicationOptionTypes = {
  STRING: 'string',
  INTEGER: 'integer',
  BOOLEAN: 'boolean',
  LIST: 'list',
};

const optionNames = {
  APPLICATION_TYPE: 'applicationType',
  AUTHENTICATION_TYPE: 'authenticationType',
  BASE_NAME: 'baseName',
  BLUEPRINT: 'blueprint',
  BLUEPRINTS: 'blueprints',
  BUILD_TOOL: 'buildTool',
  CACHE_PROVIDER: 'cacheProvider',
  CLIENT_FRAMEWORK: 'clientFramework',
  CLIENT_PACKAGE_MANAGER: 'clientPackageManager',
  CLIENT_THEME: 'clientTheme',
  CLIENT_THEME_VARIANT: 'clientThemeVariant',
  WITH_ADMIN_UI: 'withAdminUi',
  CREATION_TIMESTAMP: 'creationTimestamp',
  DATABASE_TYPE: 'databaseType',
  DEV_DATABASE_TYPE: 'devDatabaseType',
  DTO_SUFFIX: 'dtoSuffix',
  EMBEDDABLE_LAUNCH_SCRIPT: 'embeddableLaunchScript',
  ENABLE_HIBERNATE_CACHE: 'enableHibernateCache',
  ENABLE_SWAGGER_CODEGEN: 'enableSwaggerCodegen',
  ENABLE_TRANSLATION: 'enableTranslation',
  ENTITY_SUFFIX: 'entitySuffix',
  EXPERIMENTAL: 'experimental',
  I_18_N: 'i18N',
  INSTALL_MODULES: 'installModules',
  JHI_PREFIX: 'jhiPrefix',
  JHIPSTER_VERSION: 'jhipsterVersion',
  JWT_SECRET_KEY: 'jwtSecretKey',
  LANGUAGES: 'languages',
  MESSAGE_BROKER: 'messageBroker',
  NATIVE_LANGUAGE: 'nativeLanguage',
  NPM: 'npm',
  OTHER_MODULES: 'otherModules',
  PACKAGE_NAME: 'packageName',
  PACKAGE_FOLDER: 'packageFolder',
  PROD_DATABASE_TYPE: 'prodDatabaseType',
  REACTIVE: 'reactive',
  REMEMBER_ME_KEY: 'rememberMeKey',
  SEARCH_ENGINE: 'searchEngine',
  SERVER_PORT: 'serverPort',
  SERVICE_DISCOVERY_TYPE: 'serviceDiscoveryType',
  SKIP_CLIENT: 'skipClient',
  SKIP_GIT: 'skipGit',
  SKIP_INSTALL: 'skipInstall',
  SKIP_SERVER: 'skipServer',
  SKIP_USER_MANAGEMENT: 'skipUserManagement',
  TEST_FRAMEWORKS: 'testFrameworks',
  WEBSOCKET: 'websocket',
  WITH_ENTITIES: 'withEntities',
  ENABLE_GRADLE_ENTERPRISE: 'enableGradleEnterprise',
  GRADLE_ENTERPRISE_HOST: 'gradleEnterpriseHost',
};

const optionValues = {
  // TODO refactor it mixes default values (e.g. BaseName=Jhipster) and element list (e.g. application types)
  [optionNames.APPLICATION_TYPE]: {
    [MONOLITH]: MONOLITH,
    [MICROSERVICE]: MICROSERVICE,
    [GATEWAY]: GATEWAY,
  },
  [optionNames.AUTHENTICATION_TYPE]: {
    [JWT]: JWT,
    [OAUTH2]: OAUTH2,
    [SESSION]: SESSION,
  },
  [optionNames.BASE_NAME]: 'jhipster',
  [optionNames.BLUEPRINT]: undefined,
  [optionNames.BLUEPRINTS]: [],
  [optionNames.BUILD_TOOL]: {
    [MAVEN]: MAVEN,
    [GRADLE]: GRADLE,
  },
  [optionNames.CACHE_PROVIDER]: {
    [CAFFEINE]: CAFFEINE,
    [EHCACHE]: EHCACHE,
    [HAZELCAST]: HAZELCAST,
    [INFINISPAN]: INFINISPAN,
    [MEMCACHED]: MEMCACHED,
    [REDIS]: REDIS,
    [NO_CACHE_PROVIDER]: NO_CACHE_PROVIDER,
  },
  [optionNames.CLIENT_FRAMEWORK]: {
    [ANGULAR_X]: ANGULAR_X,
    [ANGULAR]: ANGULAR,
    [REACT]: REACT,
    [VUE]: VUE,
    [SVELTE]: SVELTE,
  },
  [optionNames.CLIENT_PACKAGE_MANAGER]: {
    npm: 'npm',
  },
  [optionNames.CLIENT_THEME]: 'none',
  [optionNames.CLIENT_THEME_VARIANT]: { none: '', default: 'primary' },
  [optionNames.DATABASE_TYPE]: {
    [SQL]: SQL,
    [MONGODB]: MONGODB,
    [CASSANDRA]: CASSANDRA,
    [COUCHBASE]: COUCHBASE,
    [NEO4J]: NEO4J,
    [NO_DATABASE]: NO_DATABASE,
  },
  [optionNames.DEV_DATABASE_TYPE]: {
    // these options + the prod database type
    [H2_DISK]: H2_DISK,
    [H2_MEMORY]: H2_MEMORY,
  },
  [optionNames.DTO_SUFFIX]: 'DTO',
  [optionNames.EMBEDDABLE_LAUNCH_SCRIPT]: true,
  [optionNames.ENABLE_HIBERNATE_CACHE]: true,
  [optionNames.ENABLE_SWAGGER_CODEGEN]: false,
  [optionNames.ENABLE_TRANSLATION]: true,
  [optionNames.ENTITY_SUFFIX]: '',
  [optionNames.EXPERIMENTAL]: false,
  [optionNames.I_18_N]: true,
  [optionNames.INSTALL_MODULES]: false,
  [optionNames.JHI_PREFIX]: 'jhi',
  [optionNames.JHIPSTER_VERSION]: '',
  [optionNames.JWT_SECRET_KEY]: '',
  [optionNames.LANGUAGES]: [],
  [optionNames.MESSAGE_BROKER]: {
    kafka: KAFKA,
    false: NO_MESSAGE_BROKER,
  },
  [optionNames.NPM]: true,
  [optionNames.OTHER_MODULES]: [],
  [optionNames.PACKAGE_FOLDER]: 'com/mycompany/myapp',
  [optionNames.PACKAGE_NAME]: 'com.mycompany.myapp',
  [optionNames.PROD_DATABASE_TYPE]: {
    [MYSQL]: MYSQL,
    [MARIADB]: MARIADB,
    [POSTGRESQL]: POSTGRESQL,
    [ORACLE]: ORACLE,
    [MSSQL]: MSSQL,
    [NO_DATABASE]: NO_DATABASE,
  },
  [optionNames.REACTIVE]: false,
  [optionNames.REMEMBER_ME_KEY]: '',
  [optionNames.SEARCH_ENGINE]: {
    [ELASTICSEARCH]: ELASTICSEARCH,
    [COUCHBASE_SEARCH_ENGINE]: COUCHBASE_SEARCH_ENGINE,
    [NO_SEARCH_ENGINE]: NO_SEARCH_ENGINE,
  },
  [optionNames.SERVER_PORT]: '8080',
  [optionNames.SERVICE_DISCOVERY_TYPE]: {
    [EUREKA]: EUREKA,
    [CONSUL]: CONSUL,
    [NO_SERVICE_DISCOVERY]: NO_SERVICE_DISCOVERY,
    [FALSE_SERVICE_DISCOVERY]: FALSE_SERVICE_DISCOVERY,
  },
  [optionNames.SKIP_CLIENT]: false,
  [optionNames.SKIP_GIT]: false,
  [optionNames.SKIP_INSTALL]: false,
  [optionNames.SKIP_SERVER]: false,
  [optionNames.SKIP_USER_MANAGEMENT]: false,
  [optionNames.TEST_FRAMEWORKS]: {
    [PROTRACTOR]: PROTRACTOR,
    [CYPRESS]: CYPRESS,
    [CUCUMBER]: CUCUMBER,
    [GATLING]: GATLING,
  },
  [optionNames.USE_NPM]: true,
  [optionNames.WEBSOCKET]: {
    [SPRING_WEBSOCKET]: SPRING_WEBSOCKET,
    false: NO_WEBSOCKET,
  },
  [optionNames.WITH_ENTITIES]: false,
  [optionNames.WITH_ADMIN_UI]: true,
  [optionNames.ENABLE_GRADLE_ENTERPRISE]: false,
  [optionNames.GRADLE_ENTERPRISE_HOST]: '',
};

const optionTypes = {
  [optionNames.APPLICATION_TYPE]: { type: ApplicationOptionTypes.STRING },
  [optionNames.AUTHENTICATION_TYPE]: { type: ApplicationOptionTypes.STRING },
  [optionNames.BASE_NAME]: { type: ApplicationOptionTypes.STRING },
  [optionNames.BLUEPRINT]: { type: ApplicationOptionTypes.STRING },
  [optionNames.BLUEPRINTS]: { type: ApplicationOptionTypes.LIST },
  [optionNames.BUILD_TOOL]: { type: ApplicationOptionTypes.STRING },
  [optionNames.CACHE_PROVIDER]: { type: ApplicationOptionTypes.STRING },
  [optionNames.CLIENT_FRAMEWORK]: { type: ApplicationOptionTypes.STRING },
  [optionNames.CLIENT_PACKAGE_MANAGER]: { type: ApplicationOptionTypes.STRING },
  [optionNames.CLIENT_THEME]: { type: ApplicationOptionTypes.STRING },
  [optionNames.CLIENT_THEME_VARIANT]: { type: ApplicationOptionTypes.STRING },
  [optionNames.CREATION_TIMESTAMP]: { type: ApplicationOptionTypes.INTEGER },
  [optionNames.DATABASE_TYPE]: { type: ApplicationOptionTypes.STRING },
  [optionNames.DEV_DATABASE_TYPE]: { type: ApplicationOptionTypes.STRING },
  [optionNames.DTO_SUFFIX]: { type: ApplicationOptionTypes.STRING },
  [optionNames.EMBEDDABLE_LAUNCH_SCRIPT]: { type: ApplicationOptionTypes.BOOLEAN },
  [optionNames.ENABLE_HIBERNATE_CACHE]: { type: ApplicationOptionTypes.BOOLEAN },
  [optionNames.ENABLE_SWAGGER_CODEGEN]: { type: ApplicationOptionTypes.BOOLEAN },
  [optionNames.ENABLE_TRANSLATION]: { type: ApplicationOptionTypes.BOOLEAN },
  [optionNames.ENTITY_SUFFIX]: { type: ApplicationOptionTypes.STRING },
  [optionNames.EXPERIMENTAL]: { type: ApplicationOptionTypes.BOOLEAN },
  [optionNames.I_18_N]: { type: ApplicationOptionTypes.BOOLEAN },
  [optionNames.INSTALL_MODULES]: { type: ApplicationOptionTypes.BOOLEAN },
  [optionNames.JHI_PREFIX]: { type: ApplicationOptionTypes.STRING },
  [optionNames.JHIPSTER_VERSION]: { type: ApplicationOptionTypes.STRING },
  [optionNames.JWT_SECRET_KEY]: { type: ApplicationOptionTypes.STRING },
  [optionNames.LANGUAGES]: { type: ApplicationOptionTypes.LIST },
  [optionNames.MESSAGE_BROKER]: { type: ApplicationOptionTypes.STRING },
  [optionNames.NATIVE_LANGUAGE]: { type: ApplicationOptionTypes.STRING },
  [optionNames.NPM]: { type: ApplicationOptionTypes.BOOLEAN },
  [optionNames.OTHER_MODULES]: { type: ApplicationOptionTypes.LIST },
  [optionNames.PACKAGE_NAME]: { type: ApplicationOptionTypes.STRING },
  [optionNames.PACKAGE_FOLDER]: { type: ApplicationOptionTypes.STRING },
  [optionNames.PROD_DATABASE_TYPE]: { type: ApplicationOptionTypes.STRING },
  [optionNames.REACTIVE]: { type: ApplicationOptionTypes.BOOLEAN },
  [optionNames.REMEMBER_ME_KEY]: { type: ApplicationOptionTypes.STRING },
  [optionNames.SEARCH_ENGINE]: { type: ApplicationOptionTypes.STRING },
  [optionNames.SERVER_PORT]: { type: ApplicationOptionTypes.INTEGER },
  [optionNames.SERVICE_DISCOVERY_TYPE]: { type: ApplicationOptionTypes.STRING },
  [optionNames.SKIP_CLIENT]: { type: ApplicationOptionTypes.BOOLEAN },
  [optionNames.SKIP_GIT]: { type: ApplicationOptionTypes.BOOLEAN },
  [optionNames.SKIP_INSTALL]: { type: ApplicationOptionTypes.BOOLEAN },
  [optionNames.SKIP_SERVER]: { type: ApplicationOptionTypes.BOOLEAN },
  [optionNames.SKIP_USER_MANAGEMENT]: { type: ApplicationOptionTypes.BOOLEAN },
  [optionNames.TEST_FRAMEWORKS]: { type: ApplicationOptionTypes.LIST },
  [optionNames.USE_NPM]: { type: ApplicationOptionTypes.BOOLEAN },
  [optionNames.WEBSOCKET]: { type: ApplicationOptionTypes.STRING },
  [optionNames.WITH_ENTITIES]: { type: ApplicationOptionTypes.BOOLEAN },
  [optionNames.WITH_ADMIN_UI]: { type: ApplicationOptionTypes.BOOLEAN },
  [optionNames.ENABLE_GRADLE_ENTERPRISE]: { type: ApplicationOptionTypes.BOOLEAN },
  [optionNames.GRADLE_ENTERPRISE_HOST]: { type: ApplicationOptionTypes.STRING },
};

const QuotedOptionNames = [
  optionNames.JHIPSTER_VERSION,
  optionNames.REMEMBER_ME_KEY,
  optionNames.JWT_SECRET_KEY,
  optionNames.GRADLE_ENTERPRISE_HOST,
];

module.exports = {
  OptionTypes: ApplicationOptionTypes,
  OptionNames: optionNames,
  OptionValues: optionValues,
  QuotedOptionNames,
  getTypeForOption,
  doesOptionExist,
  doesOptionValueExist,
  shouldTheValueBeQuoted,
};

/**
 * Returns the option's type, one of string, boolean, list or integer.
 * @param {String} optionName - the option's name.
 * @returns {string} the option's type.
 */
function getTypeForOption(optionName) {
  if (!optionName) {
    throw new Error('A name has to be passed to get the option type.');
  }
  if (!optionTypes[optionName]) {
    throw new Error(`Unrecognised application option name: ${optionName}.`);
  }
  return optionTypes[optionName].type;
}

/**
 * Checks whether the option value exists for the passed option name.
 * @param {String} name - the option name.
 * @param {String|Boolean|Number} value - the option value.
 * @returns {Boolean} whether the option value exists for the name.
 */
function doesOptionValueExist(name, value) {
  return doesOptionExist(name) && optionValues[name][value] != null;
}

/**
 * Checks whether the option's exists.
 * @param {String} optionName - the option's name.
 * @returns {Boolean} the option's existence.
 */
function doesOptionExist(optionName) {
  return !!optionName && !!optionTypes[optionName];
}

/**
 * Checks whether the corresponding option has a value that should be quoted in the JDL, like the jhipsterVersion
 * attribute.
 * @param {String} optionName - the name of the option to check.
 * @return {boolean} whether it should be quoted in the JDL.
 */
function shouldTheValueBeQuoted(optionName) {
  if (!optionName) {
    throw new Error('An option name has to be passed to know whether it is quoted.');
  }
  return QuotedOptionNames.includes(optionName);
}
