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

import { before, describe, it } from 'esmocha';

import { basicHelpers as helpers, result as runResult } from '../../lib/testing/index.ts';
import { asPostWritingTask } from '../base-application/support/task-type-inference.ts';
import type { Application as ClientApplication, Entity as ClientEntity } from '../client/index.ts';
import { CLIENT_MAIN_SRC_DIR } from '../generator-constants.ts';

describe('needle API Vue: JHipster client generator with blueprint', () => {
  before(() =>
    helpers
      .runJHipster('vue')
      .withJHipsterConfig({
        clientFramework: 'vue',
        skipServer: true,
        enableTranslation: false,
      })
      .withTask(
        'postWriting',
        asPostWritingTask<ClientEntity, ClientApplication>(function ({ application, source }) {
          source.addEntitiesToClient({
            application,
            entities: [
              {
                entityInstance: 'entityInstance',
                entityAngularName: 'entityName',
                entityFolderName: 'entityFolderName',
                entityFileName: 'entityFileName',
                entityUrl: 'entityUrl',
                microserviceName: 'microserviceName',
                entityPage: 'routerName',
                entityNameHumanized: 'Router Name',
              } as ClientEntity,
            ],
          });
        }),
      ),
  );

  it('menu contains the item and the root', () => {
    runResult.assertFileContent(
      `${CLIENT_MAIN_SRC_DIR}app/entities/entities-menu.vue`,
      `
    <b-dropdown-item to="/routerName">
      <font-awesome-icon icon="asterisk" />
      <span>Router Name</span>
    </b-dropdown-item>
`,
    );
  });

  it('menu contains the item in router import', () => {
    runResult.assertFileContent(
      `${CLIENT_MAIN_SRC_DIR}app/router/entities.ts`,
      `
const entityName = () => import('@/entities/entityFolderName/entityFileName.vue');
const entityNameDetails = () => import('@/entities/entityFolderName/entityFileName-details.vue');
const entityNameUpdate = () => import('@/entities/entityFolderName/entityFileName-update.vue');
`,
    );
  });

  it('menu contains the item in router', () => {
    runResult.assertFileContent(
      `${CLIENT_MAIN_SRC_DIR}app/router/entities.ts`,
      `
    {
      path: 'routerName',
      name: 'entityName',
      component: entityName,
      meta: { authorities: [Authority.USER] },
    },
    {
      path: 'routerName/:entityInstanceId/view',
      name: 'entityNameView',
      component: entityNameDetails,
      meta: { authorities: [Authority.USER] },
    },
    {
      path: 'routerName/new',
      name: 'entityNameCreate',
      component: entityNameUpdate,
      meta: { authorities: [Authority.USER] },
    },
    {
      path: 'routerName/:entityInstanceId/edit',
      name: 'entityNameEdit',
      component: entityNameUpdate,
      meta: { authorities: [Authority.USER] },
    },
`,
    );
  });

  it('menu contains the item in service import', () => {
    runResult.assertFileContent(
      `${CLIENT_MAIN_SRC_DIR}app/entities/entities.component.ts`,
      "import entityNameService from './entityFolderName/entityFileName.service';",
    );
  });

  it('menu contains the item in service', () => {
    runResult.assertFileContent(
      `${CLIENT_MAIN_SRC_DIR}app/entities/entities.component.ts`,
      "provide('entityInstanceService', () => new entityNameService());",
    );
  });
});
