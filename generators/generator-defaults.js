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
const defaultApplicationOptions = require('../jdl/jhipster/default-application-options');
const applicationOptions = require('../jdl/jhipster/application-options');
const { MONOLITH } = require('../jdl/jhipster/application-types');
const binaryOptions = require('../jdl/jhipster/binary-options');

const optionNames = applicationOptions.OptionNames;
const defaultNewApplicationOptions = defaultApplicationOptions.getConfigForApplicationType();
const defaultMonolithOptions = defaultApplicationOptions.getConfigForApplicationType(MONOLITH);

/** Required config for prompts to be skipped */
const appRequiredConfig = {
  applicationType: defaultMonolithOptions[optionNames.APPLICATION_TYPE],
};

const appDefaultConfig = {
  ...appRequiredConfig,
  skipClient: defaultNewApplicationOptions[optionNames.SKIP_CLIENT],
  skipServer: defaultNewApplicationOptions[optionNames.SKIP_SERVER],
  skipUserManagement: defaultMonolithOptions[optionNames.SKIP_USER_MANAGEMENT],
  skipCheckLengthOfIdentifier: false,
  skipFakeData: false,
  jhiPrefix: defaultNewApplicationOptions[optionNames.JHI_PREFIX],
  entitySuffix: defaultNewApplicationOptions[optionNames.ENTITY_SUFFIX],
  dtoSuffix: defaultNewApplicationOptions[optionNames.DTO_SUFFIX],
  get testFrameworks() {
    return [];
  },
  get blueprints() {
    return [];
  },
  get otherModules() {
    return [];
  },
  get pages() {
    return [];
  },
};

/** Required config for prompts to be skipped */
const serverRequiredConfig = {
  packageName: defaultNewApplicationOptions[optionNames.PACKAGE_NAME],
  cacheProvider: defaultNewApplicationOptions[optionNames.CACHE_PROVIDER],
  websocket: defaultNewApplicationOptions[optionNames.WEBSOCKET],
  databaseType: defaultNewApplicationOptions[optionNames.DATABASE_TYPE],
  prodDatabaseType: defaultNewApplicationOptions[optionNames.PROD_DATABASE_TYPE],
  devDatabaseType: defaultNewApplicationOptions[optionNames.DEV_DATABASE_TYPE],
  searchEngine: defaultNewApplicationOptions[optionNames.SEARCH_ENGINE],
  buildTool: defaultNewApplicationOptions[optionNames.BUILD_TOOL],
};

const serverDefaultConfig = {
  ...serverRequiredConfig,
  serverPort: defaultMonolithOptions[optionNames.SERVER_PORT],
  authenticationType: defaultMonolithOptions[optionNames.AUTHENTICATION_TYPE],
  serviceDiscoveryType: defaultMonolithOptions[optionNames.SERVICE_DISCOVERY_TYPE],
  enableHibernateCache: true,
  reactive: defaultNewApplicationOptions[optionNames.REACTIVE],
};

/** Required config for prompts to be skipped */
const clientRequiredConfig = {
  clientFramework: defaultMonolithOptions[optionNames.CLIENT_FRAMEWORK],
};

const clientDefaultConfig = {
  ...clientRequiredConfig,
  clientPackageManager: defaultNewApplicationOptions[optionNames.CLIENT_PACKAGE_MANAGER],
  clientTheme: defaultMonolithOptions[optionNames.CLIENT_THEME],
  clientThemeVariant: defaultMonolithOptions[optionNames.CLIENT_THEME_VARIANT],
  withAdminUi: defaultMonolithOptions[optionNames.WITH_ADMIN_UI],
};

const translationDefaultConfig = {
  enableTranslation: defaultNewApplicationOptions[optionNames.ENABLE_TRANSLATION],
  nativeLanguage: 'en',
  get languages() {
    return ['en', 'fr'];
  },
};

/** Required config for prompts to be skipped, baseName is missing */
const requiredDefaultConfig = {
  ...appRequiredConfig,
  ...serverRequiredConfig,
  ...clientRequiredConfig,
};

const defaultConfig = {
  ...appDefaultConfig,
  ...serverDefaultConfig,
  ...clientDefaultConfig,
  ...translationDefaultConfig,
};

const defaultConfigMicroservice = {
  ...appDefaultConfig,
  ...serverDefaultConfig,
  ...translationDefaultConfig,
};

const entityDefaultConfig = {
  pagination: binaryOptions.DefaultValues[binaryOptions.Options.PAGINATION],
  validation: false,
  dto: binaryOptions.DefaultValues[binaryOptions.Options.DTO],
  service: binaryOptions.DefaultValues[binaryOptions.Options.SERVICE],
  jpaMetamodelFiltering: false,
  readOnly: false,
  embedded: false,
  entityAngularJSSuffix: '',
  fluentMethods: true,
  clientRootFolder: '',
  get fields() {
    return [];
  },
  get relationships() {
    return [];
  },
};

module.exports = {
  appDefaultConfig,
  serverDefaultConfig,
  clientDefaultConfig,
  defaultConfig,
  defaultConfigMicroservice,
  requiredDefaultConfig,
  entityDefaultConfig,
  translationDefaultConfig,
};
