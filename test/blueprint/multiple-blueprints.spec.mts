/* eslint-disable max-classes-per-file */
import assert from 'yeoman-assert';
import helpers from 'yeoman-test';
import ClientGenerator from '../../generators/client/index.mjs';
import ServerGenerator from '../../generators/server/index.mjs';
import { getGenerator } from '../support/index.mjs';

const mockClientBlueprintSubGen = class extends ClientGenerator {
  constructor(args, opts, features) {
    super(args, opts, features);

    if (!this.options.jhipsterContext) {
      this.error("This is a JHipster blueprint and should be used only like 'jhipster --blueprints myblueprint')}");
    }
  }

  get [ClientGenerator.INITIALIZING]() {
    return super.initializing;
  }

  get [ClientGenerator.PROMPTING]() {
    return super.prompting;
  }

  get [ClientGenerator.CONFIGURING]() {
    return super.configuring;
  }

  get [ClientGenerator.COMPOSING]() {
    return super.composing;
  }

  get [ClientGenerator.LOADING]() {
    return super.loading;
  }

  get [ClientGenerator.PREPARING]() {
    return super.preparing;
  }

  get [ClientGenerator.DEFAULT]() {
    return super.default;
  }

  get [ClientGenerator.WRITING]() {
    return super.writing;
  }

  get [ClientGenerator.POST_WRITING]() {
    return super.postWriting;
  }

  get [ClientGenerator.INSTALL]() {
    return super.install;
  }

  get [ClientGenerator.POST_INSTALL]() {
    return super.postInstall;
  }

  get [ClientGenerator.END]() {
    return super.end;
  }
};

const mockServerBlueprintSubGen = class extends ServerGenerator {
  constructor(args, opts, features) {
    super(args, opts, features);

    if (!this.options.jhipsterContext) {
      this.error("This is a JHipster blueprint and should be used only like 'jhipster --blueprints myblueprint')}");
    }
  }

  get [ServerGenerator.INITIALIZING]() {
    return super.initializing;
  }

  get [ServerGenerator.PROMPTING]() {
    return super.prompting;
  }

  get [ServerGenerator.CONFIGURING]() {
    return super.configuring;
  }

  get [ServerGenerator.COMPOSING]() {
    return super.composing;
  }

  get [ServerGenerator.LOADING]() {
    return super.loading;
  }

  get [ServerGenerator.PREPARING]() {
    return super.preparing;
  }

  get [ServerGenerator.DEFAULT]() {
    return super.default;
  }

  get [ServerGenerator.WRITING]() {
    const phaseFromJHipster = super.writing;
    const customPhaseSteps = {
      addDummyProperty() {
        this.addMavenProperty('dummy-blueprint-property', 'foo');
      },
    };
    return {
      ...phaseFromJHipster,
      ...customPhaseSteps,
    };
  }

  get [ServerGenerator.POST_WRITING]() {
    return super.postWriting;
  }

  get [ServerGenerator.INSTALL]() {
    return super.install;
  }

  get [ServerGenerator.POST_INSTALL]() {
    return super.postInstall;
  }

  get [ServerGenerator.END]() {
    return super.end;
  }
};

describe('generator - with multiple blueprints', () => {
  const blueprintNames = [
    'generator-jhipster-my-client-blueprint,generator-jhipster-my-server-blueprint',
    'my-client-blueprint,my-server-blueprint',
  ];

  blueprintNames.forEach(blueprints => {
    describe(`generate with multiple blueprints option '${blueprints}'`, () => {
      let runResult;

      before(async () => {
        runResult = await helpers
          .run(getGenerator('app'))
          .withOptions({
            skipInstall: true,
            skipChecks: true,
            baseName: 'jhipster',
            blueprints,
          })
          .withGenerators([
            [mockClientBlueprintSubGen, 'jhipster-my-client-blueprint:client'],
            [mockServerBlueprintSubGen, 'jhipster-my-server-blueprint:server'],
          ]);
      });

      it('contains the specific change added by the server blueprint', () => {
        assert.fileContent('pom.xml', /dummy-blueprint-property/);
      });
    });
  });
});
