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

const ANGULAR = constants.SUPPORTED_CLIENT_FRAMEWORKS.ANGULAR;

/** Required config for prompts to be skipped */
const appRequiredConfig = {
    applicationType: 'monolith',
};

const appDefaultConfig = {
    ...appRequiredConfig,
    skipClient: false,
    skipServer: false,
    skipUserManagement: false,
    skipCheckLengthOfIdentifier: false,
    skipFakeData: false,
    jhiPrefix: 'jhi',
    entitySuffix: '',
    dtoSuffix: 'DTO',
    reactive: false,
    clientPackageManager: 'npm',
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
    packageName: 'com.mycompany.myapp',
    cacheProvider: 'ehcache',
    websocket: false,
    databaseType: 'sql',
    prodDatabaseType: 'mysql',
    devDatabaseType: 'h2Disk',
    searchEngine: false,
    buildTool: 'maven',
};

const serverDefaultConfig = {
    ...serverRequiredConfig,
    serverPort: 8080,
    authenticationType: 'jwt',
    serviceDiscoveryType: false,
    enableHibernateCache: true,
};

/** Required config for prompts to be skipped */
const clientRequiredConfig = {
    clientFramework: ANGULAR,
};

const clientDefaultConfig = {
    ...clientRequiredConfig,
    clientTheme: 'none',
    clientThemeVariant: 'primary',
    useSass: true,
};

const translationDefaultConfig = {
    enableTranslation: true,
    nativeLanguage: 'en',
    get languages() {
        return [];
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
    pagination: 'no',
    validation: false,
    dto: 'no',
    service: 'no',
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
