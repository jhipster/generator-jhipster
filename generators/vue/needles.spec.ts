import { before, describe, it } from 'esmocha';
import { basicHelpers as helpers, result as runResult } from '../../lib/testing/index.js';

import { CLIENT_MAIN_SRC_DIR } from '../generator-constants.js';
import { asPostWritingTask } from '../base-application/support/task-type-inference.js';

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
        asPostWritingTask(function ({ application, source }) {
          source.addEntitiesToClient({
            application,
            entities: [
              {
                entityInstance: 'entityInstance',
                entityClass: 'entityClass',
                entityAngularName: 'entityName',
                entityFolderName: 'entityFolderName',
                entityFileName: 'entityFileName',
                entityUrl: 'entityUrl',
                microserviceName: 'microserviceName',
                entityPage: 'routerName',
                entityClassHumanized: 'Router Name',
              } as any,
            ],
          });
          /*
        this.addEntityToMenu('routerName', false);
        this.addEntityToModule(
          'entityInstance',
          'entityClass',
          'entityName',
          'entityFolderName',
          'entityFileName',
          'entityUrl',
          'microserviceName',
        );
        */
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
