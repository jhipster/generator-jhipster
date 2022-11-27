import helpers from 'yeoman-test';
import constants from '../../generators/generator-constants.cjs';
import { getGenerator } from '../support/index.mjs';
import ReactGenerator from '../../generators/react/index.mjs';
import BaseApplicationGenerator from '../../generators/base-application/index.mjs';

const REACT = constants.SUPPORTED_CLIENT_FRAMEWORKS.REACT;
const CLIENT_MAIN_SRC_DIR = constants.CLIENT_MAIN_SRC_DIR;

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const mockReactBlueprintSubGen: any = class extends ReactGenerator {
  constructor(args, opts, features) {
    super(args, opts, features);

    const jhContext = (this.jhipsterContext = this.options.jhipsterContext);

    if (!jhContext) {
      this.error('This is a JHipster blueprint and should be used only like jhipster --blueprints myblueprint');
    }

    this.sbsBlueprint = true;
  }

  get [BaseApplicationGenerator.POST_WRITING]() {
    const customPhaseSteps = {
      addEntityToMenuStep() {
        this.addEntityToMenu('routerName', false, false);
      },
    };
    return { ...customPhaseSteps };
  }
};

describe('needle API React: JHipster client generator with blueprint', () => {
  let result;

  before(async () => {
    result = await helpers
      .run(getGenerator('react'))
      .withOptions({
        build: 'maven',
        auth: 'jwt',
        db: 'mysql',
        skipInstall: true,
        blueprint: 'myblueprint',
        skipChecks: true,
      })
      .withGenerators([[mockReactBlueprintSubGen, 'jhipster-myblueprint:react']])
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
});
