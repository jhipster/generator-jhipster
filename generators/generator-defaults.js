/**
 * Copyright 2013-2020 the original author or authors from the JHipster project.
 *
 * This file is part of the JHipster project, see https://www.jhipster.tech/
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
const constants = require('./generator-constants');
const defaultApplicationOptions = require('../jdl/jhipster/default-application-options');
const applicationOptions = require('../jdl/jhipster/application-options');
const { MONOLITH } = require('../jdl/jhipster/application-types');
const binaryOptions = require('../jdl/jhipster/binary-options');
const ANGULAR = constants.SUPPORTED_CLIENT_FRAMEWORKS.ANGULAR;

/** Required config for prompts to be skipped */
const appRequiredConfig = {
    applicationType: defaultApplicationOptions.getConfigForApplicationType(MONOLITH)[applicationOptions.OptionNames.APPLICATION_TYPE],
};

const appDefaultConfig = {
    ...appRequiredConfig,
    skipClient: defaultApplicationOptions.getConfigForApplicationType()[applicationOptions.OptionNames.SKIP_CLIENT],
    skipServer: defaultApplicationOptions.getConfigForApplicationType()[applicationOptions.OptionNames.SKIP_SERVER],
    skipUserManagement: defaultApplicationOptions.getConfigForApplicationType(MONOLITH)[applicationOptions.OptionNames.SKIP_USER_MANAGEMENT],
    skipCheckLengthOfIdentifier: false,
    skipFakeData: false,
    withGeneratedFlag: false,
    jhiPrefix: defaultApplicationOptions.getConfigForApplicationType()[applicationOptions.OptionNames.JHI_PREFIX],
    entitySuffix: defaultApplicationOptions.getConfigForApplicationType()[applicationOptions.OptionNames.ENTITY_SUFFIX],
    dtoSuffix: defaultApplicationOptions.getConfigForApplicationType()[applicationOptions.OptionNames.DTO_SUFFIX],
    reactive: defaultApplicationOptions.getConfigForApplicationType()[applicationOptions.OptionNames.REACTIVE],
    clientPackageManager: defaultApplicationOptions.getConfigForApplicationType()[applicationOptions.OptionNames.CLIENT_PACKAGE_MANAGER],
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
    packageName: defaultApplicationOptions.getConfigForApplicationType()[applicationOptions.OptionNames.PACKAGE_NAME],
    cacheProvider: defaultApplicationOptions.getConfigForApplicationType()[applicationOptions.OptionNames.CACHE_PROVIDER],
    websocket: defaultApplicationOptions.getConfigForApplicationType()[applicationOptions.OptionNames.WEBSOCKET],
    databaseType: defaultApplicationOptions.getConfigForApplicationType()[applicationOptions.OptionNames.DATABASE_TYPE],
    prodDatabaseType: defaultApplicationOptions.getConfigForApplicationType()[applicationOptions.OptionNames.PROD_DATABASE_TYPE],
    devDatabaseType: defaultApplicationOptions.getConfigForApplicationType()[applicationOptions.OptionNames.DEV_DATABASE_TYPE],
    searchEngine: defaultApplicationOptions.getConfigForApplicationType()[applicationOptions.OptionNames.SEARCH_ENGINE],
    buildTool: defaultApplicationOptions.getConfigForApplicationType()[applicationOptions.OptionNames.BUILD_TOOL],
};

const serverDefaultConfig = {
    ...serverRequiredConfig,
    serverPort: defaultApplicationOptions.getConfigForApplicationType(MONOLITH)[applicationOptions.OptionNames.SERVER_PORT],
    authenticationType: defaultApplicationOptions.getConfigForApplicationType(MONOLITH)[applicationOptions.OptionNames.AUTHENTICATION_TYPE],
    serviceDiscoveryType: defaultApplicationOptions.getConfigForApplicationType(MONOLITH)[applicationOptions.OptionNames.SERVICE_DISCOVERY_TYPE],
    enableHibernateCache: true,
};

/** Required config for prompts to be skipped */
const clientRequiredConfig = {
    clientFramework: defaultApplicationOptions.getConfigForApplicationType(MONOLITH)[applicationOptions.OptionNames.CLIENT_FRAMEWORK],
};

const clientDefaultConfig = {
    ...clientRequiredConfig,
    clientTheme: defaultApplicationOptions.getConfigForApplicationType(MONOLITH)[applicationOptions.OptionNames.CLIENT_THEME],
    clientThemeVariant: defaultApplicationOptions.getConfigForApplicationType(MONOLITH)[applicationOptions.OptionNames.CLIENT_THEME_VARIANT],
    useSass: defaultApplicationOptions.getConfigForApplicationType(MONOLITH)[applicationOptions.OptionNames.USE_SASS],
};

const translationDefaultConfig = {
    enableTranslation: defaultApplicationOptions.getConfigForApplicationType()[applicationOptions.OptionNames.ENABLE_TRANSLATION],
    nativeLanguage: defaultApplicationOptions.getConfigForApplicationType()[applicationOptions.OptionNames.NATIVE_LANGUAGE],
    get languages() {
        return defaultApplicationOptions.getConfigForApplicationType()[applicationOptions.OptionNames.LANGUAGES];
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
    requiredDefaultConfig,
    entityDefaultConfig,
};
