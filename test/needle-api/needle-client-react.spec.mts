import assert from 'yeoman-assert';
import helpers from 'yeoman-test';
import ClientGenerator from '../../generators/client/index.mjs';
import { CLIENT_MAIN_SRC_DIR } from '../../generators/generator-constants.mjs';
import { clientFrameworkTypes } from '../../jdl/jhipster/index.mjs';
import { getGenerator } from '../support/index.mjs';
import BaseApplicationGenerator from '../../generators/base-application/index.mjs';

const { REACT } = clientFrameworkTypes;

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const mockBlueprintSubGen: any = class extends ClientGenerator {
  constructor(args, opts, features) {
    super(args, opts, features);

    const jhContext = (this.jhipsterContext = this.options.jhipsterContext);

    if (!jhContext) {
      throw new Error('This is a JHipster blueprint and should be used only like jhipster --blueprints myblueprint');
    }

    this.sbsBlueprint = true;
  }

  get [BaseApplicationGenerator.POST_WRITING]() {
    const customPhaseSteps = {
      addAppCssStep() {
        // please change this to public API when it will be available see https://github.com/jhipster/generator-jhipster/issues/9234
        this.addAppSCSSStyle('@import without-comment');
        this.addAppSCSSStyle('@import with-comment', 'my comment');
      },
    };
    return { ...customPhaseSteps };
  }
};

describe('needle API React: JHipster client generator with blueprint', () => {
  let result;

  before(async () => {
    result = await helpers
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
        clientFramework: REACT,
        enableTranslation: true,
        nativeLanguage: 'en',
        languages: ['en', 'fr'],
      });
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
