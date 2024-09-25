import { before, describe, it } from 'esmocha';
import { basicHelpers as helpers, result as runResult } from '../../lib/testing/index.js';

import { CLIENT_MAIN_SRC_DIR } from '../../generators/generator-constants.js';
import { clientFrameworkTypes } from '../../lib/jhipster/index.js';
import VueGenerator from '../../generators/vue/index.js';
import BaseApplicationGenerator from '../../generators/base-application/index.js';

const { VUE } = clientFrameworkTypes;

const mockBlueprintSubGen: any = class extends VueGenerator {
  constructor(args, opts, features) {
    super(args, opts, features);
    if (!this.jhipsterContext) {
      throw new Error("This is a JHipster blueprint and should be used only like 'jhipster --blueprints myblueprint')}");
    }
    this.sbsBlueprint = true;
  }

  get [BaseApplicationGenerator.POST_WRITING]() {
    return this.asPostWritingTaskGroup({
      addCustomMethods() {
        this.addEntityToMenu('routerName', false);
      },
      addToModuleStep() {
        this.addEntityToModule(
          'entityInstance',
          'entityClass',
          'entityName',
          'entityFolderName',
          'entityFileName',
          'entityUrl',
          'microserviceName',
        );
      },
    });
  }
};

describe('needle API Vue: JHipster client generator with blueprint', () => {
  before(() =>
    helpers
      .runJHipster('vue')
      .withOptions({
        build: 'maven',
        auth: 'jwt',
        db: 'mysql',
        blueprint: ['myblueprint'],
      })
      .withGenerators([[mockBlueprintSubGen, { namespace: 'jhipster-myblueprint:vue' }]])
      .withAnswers({
        baseName: 'jhipster',
        clientFramework: VUE,
        enableTranslation: false,
        nativeLanguage: 'en',
        languages: ['fr'],
      }),
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
// prettier-ignore
const entityName = () => import('@/entities/entityFolderName/entityFileName.vue');
// prettier-ignore
const entityNameUpdate = () => import('@/entities/entityFolderName/entityFileName-update.vue');
// prettier-ignore
const entityNameDetails = () => import('@/entities/entityFolderName/entityFileName-details.vue');
`,
    );
  });

  it('menu contains the item in router', () => {
    runResult.assertFileContent(
      `${CLIENT_MAIN_SRC_DIR}app/router/entities.ts`,
      `
    {
      path: 'entityFileName',
      name: 'entityName',
      component: entityName,
      meta: { authorities: [Authority.USER] },
    },
    {
      path: 'entityFileName/new',
      name: 'entityNameCreate',
      component: entityNameUpdate,
      meta: { authorities: [Authority.USER] },
    },
    {
      path: 'entityFileName/:entityInstanceId/edit',
      name: 'entityNameEdit',
      component: entityNameUpdate,
      meta: { authorities: [Authority.USER] },
    },
    {
      path: 'entityFileName/:entityInstanceId/view',
      name: 'entityNameView',
      component: entityNameDetails,
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
