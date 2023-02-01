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
import { stripMargin } from '../../base/support/index.mjs';
import { createNeedleCallback } from '../../base/support/needles.mjs';

export function vueAddPageToRouterImport(generator, { clientSrcDir, pageName, pageFolderName, pageFilename = pageFolderName }) {
  const file = `${clientSrcDir}/app/router/pages.ts`;

  generator.editFile(
    file,
    { ignoreNonExisting: true },
    createNeedleCallback({
      needle: 'jhipster-needle-add-entity-to-router-import',
      contentToAdd: stripMargin(
        `|// prettier-ignore
                |const ${pageName} = () => import('@/pages/${pageFolderName}/${pageFilename}.vue');`
      ),
      ignoreWhitespaces: true,
      autoIndent: false,
    })
  );
}

export function vueAddPageToRouter(generator, { clientSrcDir, pageName, pageFilename }) {
  const file = `${clientSrcDir}/app/router/pages.ts`;

  generator.editFile(
    file,
    { ignoreNonExisting: true },
    createNeedleCallback({
      needle: 'jhipster-needle-add-entity-to-router',
      contentToAdd: stripMargin(
        `|{
                  |    path: '/pages/${pageFilename}',
                  |    name: '${pageName}',
                  |    component: ${pageName},
                  |    meta: { authorities: [Authority.USER] }
                  |  },`
      ),
      ignoreWhitespaces: true,
      autoIndent: false,
    })
  );
}

export function vueAddPageServiceToMainImport(generator, { clientSrcDir, pageName, pageFolderName, pageFilename = pageFolderName }) {
  const file = `${clientSrcDir}/app/main.ts`;

  generator.editFile(
    file,
    { ignoreNonExisting: true },
    createNeedleCallback({
      needle: 'jhipster-needle-add-entity-service-to-main-import',
      contentToAdd: stripMargin(
        // prettier-ignore
        `|import ${pageName}Service from '@/pages/${pageFolderName}/${pageFilename}.service';`
      ),
      ignoreWhitespaces: true,
    })
  );
}

export function vueAddPageServiceToMain(generator, { clientSrcDir, pageName, pageInstance }) {
  const file = `${clientSrcDir}/app/main.ts`;

  generator.editFile(
    file,
    { ignoreNonExisting: true },
    createNeedleCallback({
      needle: 'jhipster-needle-add-entity-service-to-main',
      contentToAdd: stripMargin(`|${pageInstance}Service: () => new ${pageName}Service(),`),
      ignoreWhitespaces: true,
      autoIndent: false,
    })
  );
}
