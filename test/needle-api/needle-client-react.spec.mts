import { basicHelpers as helpers, result as runResult } from '../support/index.mjs';
import { CLIENT_MAIN_SRC_DIR } from '../../generators/generator-constants.mjs';
import { clientFrameworkTypes } from '../../jdl/jhipster/index.mjs';
import { getGenerator } from '../support/index.mjs';
import BaseApplicationGenerator from '../../generators/base-application/index.mjs';
import ReactGenerator from '../../generators/react/index.mjs';

const { REACT } = clientFrameworkTypes;

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const mockBlueprintSubGen: any = class extends ReactGenerator {
  constructor(args, opts, features) {
    super(args, opts, features);

    if (!this.jhipsterContext) {
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

describe('needle API React: JHipster react generator with blueprint', () => {
  before(async () => {
    await helpers
      .run(getGenerator('react'))
      .withOptions({
        build: 'maven',
        auth: 'jwt',
        db: 'mysql',
        blueprint: 'myblueprint',
      })
      .withGenerators([[mockBlueprintSubGen, { namespace: 'jhipster-myblueprint:react' }]])
      .withAnswers({
        baseName: 'jhipster',
        clientFramework: REACT,
        enableTranslation: true,
        nativeLanguage: 'en',
        languages: ['en', 'fr'],
      });
  });

  it('Assert app.scss is updated', () => {
    runResult.assertFileContent(`${CLIENT_MAIN_SRC_DIR}app/app.scss`, '@import without-comment');
    runResult.assertFileContent(`${CLIENT_MAIN_SRC_DIR}app/app.scss`, '@import with-comment');
    runResult.assertFileContent(
      `${CLIENT_MAIN_SRC_DIR}app/app.scss`,
      '* ==========================================================================\n' +
        'my comment\n' +
        '========================================================================== */\n'
    );
  });
});
