import helpers from 'yeoman-test';

import assert from 'yeoman-assert';
import ClientGenerator from '../../generators/client/index.mjs';
import { clientFrameworkTypes } from '../../jdl/jhipster/index.mjs';

import { getGenerator } from '../support/index.mjs';
import BaseApplicationGenerator from '../../generators/base-application/index.mjs';
import { CLIENT_MAIN_SRC_DIR } from '../../generators/generator-constants.mjs';
import VueGenerator from '../../generators/vue/index.mjs';

const { VUE } = clientFrameworkTypes;

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const mockBlueprintSubGen: any = class extends VueGenerator {
  constructor(args, opts, features) {
    super(args, opts, features);
    const jhContext = (this.jhipsterContext = this.options.jhipsterContext);
    if (!jhContext) {
      throw new Error("This is a JHipster blueprint and should be used only like 'jhipster --blueprints myblueprint')}");
    }
    this.sbsBlueprint = true;
  }

  get [BaseApplicationGenerator.POST_WRITING]() {
    return {
      addExternalResourcesToRootStep() {
        this.addExternalResourcesToRoot('<link rel="stylesheet" href="content/css/my.css">', 'Comment added by JHipster API');
      },
    };
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

  it('Assert index.html contain the comment and the resource added', () => {
    assert.fileContent(`${CLIENT_MAIN_SRC_DIR}index.html`, '<!-- Comment added by JHipster API -->');
    assert.fileContent(`${CLIENT_MAIN_SRC_DIR}index.html`, '<link rel="stylesheet" href="content/css/my.css" />');
  });
});
