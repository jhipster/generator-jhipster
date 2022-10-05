const path = require('path');
const assert = require('yeoman-assert');
const helpers = require('yeoman-test');
const ClientGenerator = require('../../generators/client/index.cjs');
const constants = require('../../generators/generator-constants.cjs');

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
      .run(path.join(__dirname, '../../generators/client/index.mjs'))
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
