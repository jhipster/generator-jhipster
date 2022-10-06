import assert from 'yeoman-assert';
import helpers from 'yeoman-test';
import ClientGenerator from '../../generators/client/index.cjs';
import constants from '../../generators/generator-constants.cjs';
import { getGenerator } from '../support/index.mjs';

const CLIENT_MAIN_SRC_DIR = constants.CLIENT_MAIN_SRC_DIR;

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const mockBlueprintSubGen: any = class extends ClientGenerator {
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
      addExternalResourcesToRootStep() {
        this.addExternalResourcesToRoot('<link rel="stylesheet" href="content/css/my.css">', 'Comment added by JHipster API');
      },
    };
    return { ...customPhaseSteps };
  }
};

describe('needle API Client: JHipster client generator with blueprint', () => {
  before(done => {
    helpers
      .run(getGenerator('client'))
      .withOptions({
        fromCli: true,
        defaults: true,
        skipServer: true,
        db: 'postgresql',
        auth: 'jwt',
        blueprint: 'myblueprint',
        skipChecks: true,
      })
      .withGenerators([[mockBlueprintSubGen, 'jhipster-myblueprint:client']])
      .on('end', done);
  });

  it('Assert index.html contain the comment and the resource added', () => {
    assert.fileContent(`${CLIENT_MAIN_SRC_DIR}index.html`, '<!-- Comment added by JHipster API -->');
    assert.fileContent(`${CLIENT_MAIN_SRC_DIR}index.html`, '<link rel="stylesheet" href="content/css/my.css" />');
  });
});
