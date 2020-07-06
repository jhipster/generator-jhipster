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

const appDefaultConfig = {
    applicationType: 'monolith',
    skipClient: false,
    skipServer: false,
    skipUserManagement: false,
    skipCheckLengthOfIdentifier: false,
    skipFakeData: false,
    jhiPrefix: 'jhi',
    entitySuffix: '',
    dtoSuffix: 'DTO',
    reactive: false,
    testFrameworks: [],
    blueprints: [],
    otherModules: [],
    clientPackageManager: 'npm',
};

const serverDefaultConfig = {
    serverPort: 8080,
    packageName: 'com.mycompany.myapp',
    authenticationType: 'jwt',
    cacheProvider: 'ehcache',
    serviceDiscoveryType: false,
    databaseType: 'sql',
    prodDatabaseType: 'mysql',
    devDatabaseType: 'h2Disk',
    websocket: false,
    searchEngine: false,
    buildTool: 'maven',
    enableHibernateCache: true,
};

const clientDefaultConfig = {
    clientFramework: ANGULAR,
    clientTheme: 'none',
    clientThemeVariant: 'primary',
    useSass: true,
};

const translationDefaultConfig = {
    enableTranslation: true,
    nativeLanguage: 'en',
    languages: ['en'],
};

const defaultConfig = {
    ...appDefaultConfig,
    ...serverDefaultConfig,
    ...clientDefaultConfig,
    ...translationDefaultConfig,
};

module.exports = {
    appDefaultConfig,
    serverDefaultConfig,
    clientDefaultConfig,
    defaultConfig,
};
