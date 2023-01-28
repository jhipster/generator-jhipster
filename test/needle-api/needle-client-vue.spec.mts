import helpers from 'yeoman-test';

import ClientGenerator from '../../generators/client/index.mjs';
import { clientFrameworkTypes } from '../../jdl/jhipster/index.mjs';

import { getGenerator } from '../support/index.mjs';

const { VUE } = clientFrameworkTypes;

// eslint-disable-next-line @typescript-eslint/no-explicit-any
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
      .run(getGenerator('client'))
      .withOptions({
        build: 'maven',
        auth: 'jwt',
        db: 'mysql',
        skipInstall: true,
        blueprint: 'myblueprint',
        skipChecks: true,
      })
      .withMockedGenerators(['jhipster:languages'])
      .withGenerators([[mockBlueprintSubGen, 'jhipster-myblueprint:client']])
      .withPrompts({
        baseName: 'jhipster',
        clientFramework: VUE,
        enableTranslation: false,
        nativeLanguage: 'en',
        languages: ['fr'],
      })
  );
});
