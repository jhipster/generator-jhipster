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

/**
 * The default is to use a file path string. It implies use of the template method.
 * For any other config an object { file:.., method:.., template:.. } can be used
 */

const faker = require('faker');

const constants = require('../generator-constants');

const { stringHashCode } = require('../utils');

const TEST_SRC_DIR = constants.CLIENT_TEST_SRC_DIR;

const cypressFiles = {
    common: [
        {
            condition: generator => generator.cypressTests,
            templates: ['cypress.json'],
        },
    ],
    clientTestFw: [
        {
            condition: generator => generator.cypressTests,
            path: TEST_SRC_DIR,
            templates: [
                'cypress/fixtures/users/user.json',
                'cypress/fixtures/integration-test.png',
                'cypress/plugins/index.ts',
                'cypress/integration/administration/administration.spec.ts',
                'cypress/support/commands.ts',
                'cypress/support/navbar.ts',
                'cypress/support/index.ts',
                'cypress/support/entity.ts',
                'cypress/tsconfig.json',
            ],
        },
        {
            condition: generator => generator.cypressTests && generator.authenticationType !== 'oauth2',
            path: TEST_SRC_DIR,
            templates: ['cypress/integration/account/login-page.spec.ts'],
        },
        {
            condition: generator => generator.cypressTests && generator.authenticationType !== 'oauth2' && generator.databaseType !== 'no',
            path: TEST_SRC_DIR,
            templates: [
                'cypress/integration/account/register-page.spec.ts',
                'cypress/integration/account/settings-page.spec.ts',
                'cypress/integration/account/password-page.spec.ts',
                'cypress/integration/account/reset-password-page.spec.ts',
            ],
        },
        {
            condition: generator => generator.cypressTests && generator.authenticationType === 'oauth2',
            path: TEST_SRC_DIR,
            templates: ['cypress/support/keycloak-oauth2.ts', 'cypress/support/utils.ts'],
        },
    ],
};
module.exports = {
    writeFiles,
};

function writeFiles() {
    return {
        writeFiles() {
            faker.seed(stringHashCode(this.jhipsterConfig.baseName || 'jhipsterSample'));
            this.faker = faker;
            this.writeFilesToDisk(cypressFiles, this, false, this.fetchFromInstalledJHipster('cypress/templates'));
        },
    };
}
