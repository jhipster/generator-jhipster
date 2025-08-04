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
import { asWriteFilesSection, asWritingTask } from '../base-application/support/task-type-inference.ts';

import { clientRootTemplatesBlock, clientSrcTemplatesBlock } from './support/files.ts';
import type { Application as ClientApplication, Entity as ClientEntity } from './types.ts';

export const files = asWriteFilesSection({
  common: [
    {
      templates: ['README.md.jhi.client', '.prettierignore.jhi.client'],
    },
    clientRootTemplatesBlock({
      condition: generator =>
        generator.microfrontend && generator.clientBundlerWebpack && (generator.clientFrameworkVue || generator.clientFrameworkReact),
      templates: ['webpack/webpack.microfrontend.js.jhi'],
    }),
    {
      ...clientSrcTemplatesBlock(),
      templates: [
        'manifest.webapp',
        'content/images/jhipster_family_member_0.svg',
        'content/images/jhipster_family_member_0_head-192.png',
        'content/images/jhipster_family_member_0_head-256.png',
        'content/images/jhipster_family_member_0_head-384.png',
        'content/images/jhipster_family_member_0_head-512.png',
        'content/images/jhipster_family_member_1.svg',
        'content/images/jhipster_family_member_1_head-192.png',
        'content/images/jhipster_family_member_1_head-256.png',
        'content/images/jhipster_family_member_1_head-384.png',
        'content/images/jhipster_family_member_1_head-512.png',
        'content/images/jhipster_family_member_2.svg',
        'content/images/jhipster_family_member_2_head-192.png',
        'content/images/jhipster_family_member_2_head-256.png',
        'content/images/jhipster_family_member_2_head-384.png',
        'content/images/jhipster_family_member_2_head-512.png',
        'content/images/jhipster_family_member_3.svg',
        'content/images/jhipster_family_member_3_head-192.png',
        'content/images/jhipster_family_member_3_head-256.png',
        'content/images/jhipster_family_member_3_head-384.png',
        'content/images/jhipster_family_member_3_head-512.png',
        'content/images/logo-jhipster.png',
        'favicon.ico',
        'content/css/loading.css',
        'WEB-INF/web.xml',
        'robots.txt',
        '404.html',
        'index.html',
      ],
    },
    {
      condition: generator => generator.enableI18nRTL && !generator.clientFrameworkReact && !generator.clientFrameworkAngular,
      ...clientSrcTemplatesBlock(),
      templates: ['content/scss/rtl.scss'],
    },
  ],
  swagger: [
    {
      ...clientSrcTemplatesBlock(),
      templates: ['swagger-ui/index.html'],
    },
  ],
});

export const writeFiles = asWritingTask<ClientEntity, ClientApplication<ClientEntity>>(async function writeFiles({ application }) {
  if (!application.clientFrameworkBuiltIn) {
    return;
  }

  await this.writeFiles({
    sections: files,
    context: application,
  });
});
