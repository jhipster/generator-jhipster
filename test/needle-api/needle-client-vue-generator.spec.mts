import assert from 'yeoman-assert';
import helpers from 'yeoman-test';

import constants from '../../generators/generator-constants.cjs';
import { getGenerator } from '../support/index.mjs';
import VueGenerator from '../../generators/vue/index.mjs';
import BaseApplicationGenerator from '../../generators/base-application/index.mjs';

const VUE = constants.SUPPORTED_CLIENT_FRAMEWORKS.VUE;
const CLIENT_MAIN_SRC_DIR = constants.CLIENT_MAIN_SRC_DIR;

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const mockBlueprintSubGen: any = class extends VueGenerator {
  constructor(args, opts, features) {
    super(args, opts, features);
    const jhContext = (this.jhipsterContext = this.options.jhipsterContext);
    if (!jhContext) {
      this.error("This is a JHipster blueprint and should be used only like 'jhipster --blueprints myblueprint')}");
    }
    this.sbsBlueprint = true;
  }

  get [BaseApplicationGenerator.POST_WRITING]() {
    const customPhaseSteps = {
      addCustomMethods() {
        this.addEntityToMenu('routerName', false);
      },
    };
    return { ...customPhaseSteps };
  }
};

describe('needle API Vue: JHipster client generator with blueprint', () => {
  before(() =>
    helpers
      .run(getGenerator('vue'))
      .withOptions({
        build: 'maven',
        auth: 'jwt',
        db: 'mysql',
        skipInstall: true,
        blueprint: 'myblueprint',
        skipChecks: true,
      })
      .withGenerators([[mockBlueprintSubGen, 'jhipster-myblueprint:vue']])
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
});
