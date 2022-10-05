const path = require('path');
const assert = require('yeoman-assert');
const helpers = require('yeoman-test');
const ClientGenerator = require('../../generators/client/index.cjs');
const constants = require('../../generators/generator-constants.cjs');

const REACT = constants.SUPPORTED_CLIENT_FRAMEWORKS.REACT;
const CLIENT_MAIN_SRC_DIR = constants.CLIENT_MAIN_SRC_DIR;

const mockBlueprintSubGen = class extends ClientGenerator {
  constructor(args, opts, features) {
    super(args, opts, features);

    const jhContext = (this.jhipsterContext = this.options.jhipsterContext);

    if (!jhContext) {
      this.error('This is a JHipster blueprint and should be used only like jhipster --blueprints myblueprint');
    }

    this.sbsBlueprint = true;
  }

  get [ClientGenerator.POST_WRITING]() {
    const customPhaseSteps = {
      addAppCssStep() {
        // please change this to public API when it will be available see https://github.com/jhipster/generator-jhipster/issues/9234
        this.addAppSCSSStyle('@import without-comment');
        this.addAppSCSSStyle('@import with-comment', 'my comment');
      },
      addEntityToMenuStep() {
        this.addEntityToMenu('routerName', false, REACT, false);
      },
      addEntityToModuleStep() {
        this.addEntityToModule(
          'entityInstance',
          'entityClass',
          'entityName',
          'entityFolderName',
          'entityFileName',
          'entityUrl',
          REACT,
          'microServiceNam'
        );
      },
    };
    return { ...customPhaseSteps };
  }
};

describe('needle API React: JHipster client generator with blueprint', () => {
  let result;

  before(async () => {
    result = await helpers
      .run(path.join(__dirname, '../../generators/client/index.mjs'))
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
        clientFramework: REACT,
        enableTranslation: true,
        nativeLanguage: 'en',
        languages: ['en', 'fr'],
      });
  });

  it('Assert entity is added to menu', () => {
    result.assertFileContent(
      `${CLIENT_MAIN_SRC_DIR}app/entities/menu.tsx`,
      '<MenuItem icon="asterisk" to="/routerName">\n        Router Name\n      </MenuItem>'
    );
  });

  it('Assert entity is added to module', () => {
    const indexModulePath = `${CLIENT_MAIN_SRC_DIR}app/entities/routes.tsx`;
    const indexReducerPath = `${CLIENT_MAIN_SRC_DIR}app/entities/reducers.ts`;

    assert.fileContent(indexModulePath, "import entityName from './entityFolderName';");
    assert.fileContent(indexModulePath, '<Route path="entityFileName/*" element={<entityName />} />');

    assert.fileContent(indexReducerPath, "import entityInstance from 'app/entities/entityFolderName/entityFileName.reducer';");
    assert.fileContent(indexReducerPath, 'entityInstance,');
  });

  it('Assert app.scss is updated', () => {
    assert.fileContent(`${CLIENT_MAIN_SRC_DIR}app/app.scss`, '@import without-comment');
    assert.fileContent(`${CLIENT_MAIN_SRC_DIR}app/app.scss`, '@import with-comment');
    assert.fileContent(
      `${CLIENT_MAIN_SRC_DIR}app/app.scss`,
      '* ==========================================================================\n' +
        'my comment\n' +
        '========================================================================== */\n'
    );
  });
});
