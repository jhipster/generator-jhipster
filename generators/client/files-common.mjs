/**
 * Copyright 2013-2023 the original author or authors from the JHipster project.
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
import { clientSrcBlock } from './utils.mjs';

export const files = {
  common: [
    {
      templates: ['.eslintignore', 'README.md.jhi.client'],
    },
    {
      condition: generator => generator.microfrontend && (generator.clientFrameworkVue || generator.clientFrameworkReact),
      templates: ['webpack/webpack.microfrontend.js.jhi'],
    },
    {
      ...clientSrcBlock,
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
      ...clientSrcBlock,
      templates: ['content/scss/rtl.scss'],
    },
  ],
  swagger: [
    {
      ...clientSrcBlock,
      templates: ['swagger-ui/index.html', 'swagger-ui/dist/images/throbber.gif'],
    },
  ],
};

export async function writeFiles({ application }) {
  await this.writeFiles({
    sections: files,
    context: application,
  });
}
