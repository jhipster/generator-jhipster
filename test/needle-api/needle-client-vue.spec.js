const path = require('path');
const assert = require('yeoman-assert');
const helpers = require('yeoman-test');

const ClientGenerator = require('../../src/generators/client');
const constants = require('../../src/generators/generator-constants');

const VUE = constants.SUPPORTED_CLIENT_FRAMEWORKS.VUE;
const CLIENT_MAIN_SRC_DIR = constants.CLIENT_MAIN_SRC_DIR;

const mockBlueprintSubGen = class extends ClientGenerator {
  constructor(args, opts) {
    super(args, { fromBlueprint: true, ...opts }); // fromBlueprint variable is important
    const jhContext = (this.jhipsterContext = this.options.jhipsterContext);
    if (!jhContext) {
      this.error("This is a JHipster blueprint and should be used only like 'jhipster --blueprints myblueprint')}");
    }
  }

  get initializing() {
    return super._initializing();
  }

  get prompting() {
    return super._prompting();
  }

  get configuring() {
    return super._configuring();
  }

  get default() {
    return super._default();
  }

  get writing() {
    return super._writing();
  }

  get postWriting() {
    const phaseFromJHipster = super._postWriting();
    const customPhaseSteps = {
      async composeEntitiesClient() {
        await this.composeWithJHipster('entities-client');
      },
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
    return { ...phaseFromJHipster, ...customPhaseSteps };
  }

  get install() {
    return super._install();
  }

  get end() {
    return super._end();
  }
};

describe('needle API Vue: JHipster client generator with blueprint', () => {
  before(() =>
    helpers
      .run(path.join(__dirname, '../../generators/client'))
      .withOptions({
        fromCli: true,
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
