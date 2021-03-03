const path = require('path');
const assert = require('yeoman-assert');
const helpers = require('yeoman-test');

const ClientGenerator = require('../../generators/client');
const constants = require('../../generators/generator-constants');

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
    const phaseFromJHipster = super._writing();
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
  before(done => {
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
      .on('end', done);
  });

  it('menu contains the item and the root', () => {
    assert.fileContent(
      `${CLIENT_MAIN_SRC_DIR}app/core/jhi-navbar/jhi-navbar.vue`,
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
      '// prettier-ignore\n' +
        "const entityName = () => import('@/entities/entityFolderName/entityFileName.vue');\n" +
        '// prettier-ignore\n' +
        "const entityNameUpdate = () => import('@/entities/entityFolderName/entityFileName-update.vue');\n" +
        '// prettier-ignore\n' +
        "const entityNameDetails = () => import('@/entities/entityFolderName/entityFileName-details.vue');"
    );
  });

  it('menu contains the item in router', () => {
    assert.fileContent(
      `${CLIENT_MAIN_SRC_DIR}app/router/entities.ts`,
      '  {\n' +
        "    path: '/entityFileName',\n" +
        "    name: 'entityName',\n" +
        '    component: entityName,\n' +
        '    meta: { authorities: [Authority.USER] },\n' +
        '  },\n' +
        '  {\n' +
        "    path: '/entityFileName/new',\n" +
        "    name: 'entityNameCreate',\n" +
        '    component: entityNameUpdate,\n' +
        '    meta: { authorities: [Authority.USER] },\n' +
        '  },\n' +
        '  {\n' +
        "    path: '/entityFileName/:entityInstanceId/edit',\n" +
        "    name: 'entityNameEdit',\n" +
        '    component: entityNameUpdate,\n' +
        '    meta: { authorities: [Authority.USER] },\n' +
        '  },\n' +
        '  {\n' +
        "    path: '/entityFileName/:entityInstanceId/view',\n" +
        "    name: 'entityNameView',\n" +
        '    component: entityNameDetails,\n' +
        '    meta: { authorities: [Authority.USER] },\n' +
        '  },\n'
    );
  });

  it('menu contains the item in service import', () => {
    assert.fileContent(
      `${CLIENT_MAIN_SRC_DIR}app/main.ts`,
      "import entityNameService from '@/entities/entityFolderName/entityFileName.service';"
    );
  });

  it('menu contains the item in service', () => {
    assert.fileContent(`${CLIENT_MAIN_SRC_DIR}app/main.ts`, 'entityInstanceService: () => new entityNameService(),');
  });
});
