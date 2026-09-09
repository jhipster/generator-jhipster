/**
 * Copyright 2013-2026 the original author or authors from the JHipster project.
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
import { asWriteFilesSection } from '../base-application/support/task-type-inference.ts';
import { clientRootTemplatesBlock } from '../client/support/index.ts';
import { CLIENT_TEST_SRC_DIR } from '../generator-constants.ts';

const PLAYWRIGHT_TEMPLATE_SOURCE_DIR = `${CLIENT_TEST_SRC_DIR}playwright/`;

export const playwrightFiles = asWriteFilesSection({
  common: [
    {
      templates: ['README.md.jhi.playwright'],
    },
    clientRootTemplatesBlock({
      templates: ['playwright.config.ts'],
    }),
    clientRootTemplatesBlock({
      templates: ['eslint.config.ts.jhi.playwright'],
    }),
  ],
  clientTestFw: [
    {
      path: PLAYWRIGHT_TEMPLATE_SOURCE_DIR,
      renameTo: (ctx, file) => `${ctx.playwrightDir}${file}`,
      templates: ['support/selectors.ts', 'support/login.ts', 'tsconfig.json'],
    },
    {
      condition: generator => !generator.authenticationTypeOauth2,
      path: PLAYWRIGHT_TEMPLATE_SOURCE_DIR,
      renameTo: (ctx, file) => `${ctx.playwrightDir}${file}`,
      templates: ['e2e/account/login-page.spec.ts', 'e2e/account/logout.spec.ts'],
    },
  ],
});
