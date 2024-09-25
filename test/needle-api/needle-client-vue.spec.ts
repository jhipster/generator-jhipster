import { before, describe } from 'esmocha';
import { basicHelpers as helpers } from '../../lib/testing/index.js';

import ClientGenerator from '../../generators/client/index.js';
import { clientFrameworkTypes } from '../../lib/jhipster/index.js';

const { VUE } = clientFrameworkTypes;

const mockBlueprintSubGen: any = class extends ClientGenerator {
  constructor(args, opts, features) {
    super(args, opts, features);
    const jhContext = (this.jhipsterContext = this.options.jhipsterContext);
    if (!jhContext) {
      throw new Error("This is a JHipster blueprint and should be used only like 'jhipster --blueprints myblueprint')}");
    }
    this.sbsBlueprint = true;
  }
};

describe('needle API Vue: JHipster client generator with blueprint', () => {
  before(() =>
    helpers
      .runJHipster('client')
      .withOptions({
        build: 'maven',
        auth: 'jwt',
        db: 'mysql',
        blueprint: ['myblueprint'],
      })
      .withMockedGenerators(['jhipster:languages'])
      .withGenerators([[mockBlueprintSubGen, { namespace: 'jhipster-myblueprint:client' }]])
      .withAnswers({
        baseName: 'jhipster',
        clientFramework: VUE,
        enableTranslation: false,
        nativeLanguage: 'en',
        languages: ['fr'],
      }),
  );
});
