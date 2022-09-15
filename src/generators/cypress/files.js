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

const { stringHashCode } = require('../utils');

const cypressFiles = {
  common: [
    {
      templates: ['cypress.config.ts'],
    },
  ],
  clientTestFw: [
    {
      path: generator => generator.cypressFolder,
      templates: [
        '.eslintrc.json',
        'fixtures/integration-test.png',
        'plugins/index.ts',
        'e2e/administration/administration.cy.ts',
        'support/commands.ts',
        'support/navbar.ts',
        'support/index.ts',
        'support/entity.ts',
        'support/management.ts',
        'tsconfig.json',
      ],
    },
    {
      condition: generator => !generator.authenticationTypeOauth2,
      path: generator => generator.cypressFolder,
      templates: ['e2e/account/login-page.cy.ts'],
    },
    {
      condition: generator => !generator.authenticationTypeOauth2 && !generator.databaseTypeNo && !generator.applicationTypeMicroservice,
      path: generator => generator.cypressFolder,
      templates: [
        'e2e/account/register-page.cy.ts',
        'e2e/account/settings-page.cy.ts',
        'e2e/account/password-page.cy.ts',
        'e2e/account/reset-password-page.cy.ts',
      ],
    },
    {
      condition: generator => generator.authenticationTypeOauth2,
      path: generator => generator.cypressFolder,
      templates: ['support/oauth2.ts'],
    },
  ],
  audit: [
    {
      condition: generator => generator.cypressAudit,
      path: generator => generator.cypressFolder,
      templates: ['e2e/lighthouse.audits.ts'],
    },
    {
      condition: generator => generator.cypressAudit,
      templates: ['cypress-audits.config.ts'],
    },
  ],
  coverage: [
    {
      condition: generator => generator.cypressCoverage,
      path: generator => generator.cypressFolder,
      templates: ['plugins/global.d.ts'],
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
      return this.writeFiles({ sections: cypressFiles });
    },
  };
}
