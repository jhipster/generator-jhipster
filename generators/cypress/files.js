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

/**
 * The default is to use a file path string. It implies use of the template method.
 * For any other config an object { file:.., method:.., template:.. } can be used
 */

const faker = require('@faker-js/faker');

const constants = require('../generator-constants');

const { stringHashCode } = require('../utils');

const TEST_SRC_DIR = constants.CLIENT_TEST_SRC_DIR;

const cypressFiles = {
  common: [
    {
      condition: generator => generator.cypressTests,
      templates: ['cypress.json', 'cypress-audits.json'],
    },
  ],
  clientTestFw: [
    {
      condition: generator => generator.cypressTests,
      path: `${TEST_SRC_DIR}/cypress/`,
      templates: [
        '.eslintrc.json',
        'fixtures/integration-test.png',
        'plugins/index.ts',
        'integration/administration/administration.spec.ts',
        'integration/lighthouse.audits.ts',
        'support/commands.ts',
        'support/navbar.ts',
        'support/index.ts',
        'support/entity.ts',
        'support/management.ts',
        'tsconfig.json',
      ],
    },
    {
      condition: generator => generator.cypressTests && !generator.authenticationTypeOauth2,
      path: `${TEST_SRC_DIR}/cypress/`,
      templates: ['integration/account/login-page.spec.ts'],
    },
    {
      condition: generator => generator.cypressTests && !generator.authenticationTypeOauth2 && !generator.databaseTypeNo,
      path: `${TEST_SRC_DIR}/cypress/`,
      templates: [
        'integration/account/register-page.spec.ts',
        'integration/account/settings-page.spec.ts',
        'integration/account/password-page.spec.ts',
        'integration/account/reset-password-page.spec.ts',
      ],
    },
    {
      condition: generator => generator.cypressTests && generator.authenticationTypeOauth2,
      path: `${TEST_SRC_DIR}/cypress/`,
      templates: ['support/oauth2.ts'],
    },
  ],
};
module.exports = {
  writeFiles,
  files: cypressFiles,
};

function writeFiles() {
  return {
    writeFiles() {
      faker.seed(stringHashCode(this.jhipsterConfig.baseName || 'jhipsterSample'));
      this.faker = faker;
      return this.writeFilesToDisk(cypressFiles);
    },
  };
}
