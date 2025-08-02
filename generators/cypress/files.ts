/**
 * Copyright 2013-2025 the original author or authors from the JHipster project.
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
import { CLIENT_TEST_SRC_DIR } from '../generator-constants.js';

import { clientRootTemplatesBlock } from '../client/support/index.ts';
import { asWriteFilesSection } from '../base-application/support/task-type-inference.ts';

const CYPRESS_TEMPLATE_SOURCE_DIR = `${CLIENT_TEST_SRC_DIR}cypress/`;

export const cypressFiles = asWriteFilesSection({
  common: [
    {
      templates: ['README.md.jhi.cypress'],
    },
    clientRootTemplatesBlock({
      templates: ['cypress.config.ts'],
    }),
    clientRootTemplatesBlock({
      condition: ctx => Boolean(ctx.eslintConfigFile),
      templates: [{ sourceFile: 'eslint.config.js.jhi.cypress', destinationFile: ctx => `${ctx.eslintConfigFile}.jhi.cypress` }],
    }),
  ],
  clientTestFw: [
    {
      path: CYPRESS_TEMPLATE_SOURCE_DIR,
      renameTo: (ctx, file) => `${ctx.cypressDir}${file}`,
      templates: [
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
      condition: generator => !generator.applicationTypeMicroservice,
      path: CYPRESS_TEMPLATE_SOURCE_DIR,
      renameTo: (ctx, file) => `${ctx.cypressDir}${file}`,
      templates: ['e2e/account/logout.cy.ts'],
    },
    {
      condition: generator => !generator.authenticationTypeOauth2,
      path: CYPRESS_TEMPLATE_SOURCE_DIR,
      renameTo: (ctx, file) => `${ctx.cypressDir}${file}`,
      templates: ['e2e/account/login-page.cy.ts'],
    },
    {
      condition: generator => Boolean(generator.generateUserManagement),
      path: CYPRESS_TEMPLATE_SOURCE_DIR,
      renameTo: (ctx, file) => `${ctx.cypressDir}${file}`,
      templates: [
        'e2e/account/register-page.cy.ts',
        'e2e/account/settings-page.cy.ts',
        'e2e/account/password-page.cy.ts',
        'e2e/account/reset-password-page.cy.ts',
        'support/account.ts',
      ],
    },
    {
      condition: generator => generator.authenticationTypeOauth2,
      path: CYPRESS_TEMPLATE_SOURCE_DIR,
      renameTo: (ctx, file) => `${ctx.cypressDir}${file}`,
      templates: ['support/oauth2.ts'],
    },
  ],
  audit: [
    {
      condition: generator => generator.cypressAudit,
      path: CYPRESS_TEMPLATE_SOURCE_DIR,
      renameTo: (ctx, file) => `${ctx.cypressDir}${file}`,
      templates: ['e2e/lighthouse.audits.ts'],
    },
    clientRootTemplatesBlock({
      condition: generator => generator.cypressAudit,
      templates: ['cypress-audits.config.ts'],
    }),
  ],
  coverage: [
    {
      condition: generator => generator.cypressCoverage,
      path: CYPRESS_TEMPLATE_SOURCE_DIR,
      renameTo: (ctx, file) => `${ctx.cypressDir}${file}`,
      templates: ['plugins/global.d.ts'],
    },
  ],
});

export const cypressEntityFiles = asWriteFilesSection({
  testsCypress: [
    {
      path: CYPRESS_TEMPLATE_SOURCE_DIR,
      renameTo: ctx => `${ctx.cypressDir}e2e/entity/${ctx.entityFileName}.cy.ts`,
      templates: ['e2e/entity/_entity_.cy.ts'],
    },
  ],
});
