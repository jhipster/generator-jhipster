import assert from 'yeoman-assert';
import helpers from 'yeoman-test';

import ClientGenerator from '../../generators/client/index.mjs';
import { CLIENT_MAIN_SRC_DIR } from '../../generators/generator-constants.mjs';
import { clientFrameworkTypes } from '../../jdl/jhipster/index.mjs';

import { getGenerator } from '../support/index.mjs';

const { VUE } = clientFrameworkTypes;

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const mockBlueprintSubGen: any = class extends ClientGenerator {
  constructor(args, opts, features) {
    super(args, opts, features);
    const jhContext = (this.jhipsterContext = this.options.jhipsterContext);
    if (!jhContext) {
      this.error("This is a JHipster blueprint and should be used only like 'jhipster --blueprints myblueprint')}");
    }
    this.sbsBlueprint = true;
  }

  get [ClientGenerator.POST_WRITING]() {
    const customPhaseSteps = {
      addCustomMethods() {
        this.addEntityToMenu('routerName', false, VUE);
      },
      addToModuleStep() {
        this.addEntityToModule(
          'entityInstance',
          'entityClass',
          'entityName',
          'entityFolderName',
          'entityFileName',
          'entityUrl',
          VUE,
          'microserviceName'
        );
      },
    };
    return { ...customPhaseSteps };
  }
};

describe('needle API Vue: JHipster client generator with blueprint', () => {
  before(() =>
    helpers
      .run(getGenerator('client'))
      .withOptions({
        build: 'maven',
        auth: 'jwt',
        db: 'mysql',
        skipInstall: true,
        blueprint: 'myblueprint',
        skipChecks: true,
      })
      .withGenerators([[mockBlueprintSubGen, 'jhipster-myblueprint:client']])
      .withPrompts({
        baseName: 'jhipster',
        clientFramework: VUE,
        enableTranslation: false,
        nativeLanguage: 'en',
        languages: ['fr'],
      })
  );

  it('menu contains the item and the root', () => {
    assert.fileContent(
      `${CLIENT_MAIN_SRC_DIR}app/entities/entities-menu.vue`,
      `
    <b-dropdown-item to="/routerName">
      <font-awesome-icon icon="asterisk" />
      <span>Router Name</span>
    </b-dropdown-item>
`
    );
  });

  it('menu contains the item in router import', () => {
    assert.fileContent(
      `${CLIENT_MAIN_SRC_DIR}app/router/entities.ts`,
      `
// prettier-ignore
const entityName = () => import('@/entities/entityFolderName/entityFileName.vue');
// prettier-ignore
const entityNameUpdate = () => import('@/entities/entityFolderName/entityFileName-update.vue');
// prettier-ignore
const entityNameDetails = () => import('@/entities/entityFolderName/entityFileName-details.vue');
`
    );
  });

  it('menu contains the item in router', () => {
    assert.fileContent(
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
`
    );
  });

  it('menu contains the item in service import', () => {
    assert.fileContent(
      `${CLIENT_MAIN_SRC_DIR}app/entities/entities.component.ts`,
      "import entityNameService from './entityFolderName/entityFileName.service';"
    );
  });

  it('menu contains the item in service', () => {
    assert.fileContent(
      `${CLIENT_MAIN_SRC_DIR}app/entities/entities.component.ts`,
      "@Provide('entityInstanceService') private entityInstanceService = () => new entityNameService();"
    );
  });
});
