const path = require('path');
const assert = require('yeoman-assert');
const helpers = require('yeoman-test');
const expectedFiles = require('../utils/expected-files');
const ClientGenerator = require('../../generators/client');
const constants = require('../../generators/generator-constants');

const ANGULAR = constants.SUPPORTED_CLIENT_FRAMEWORKS.ANGULAR;

const MockedClientGenerator = class MockedClientGenerator extends ClientGenerator {
  constructor(args, opts) {
    super(args, { fromBlueprint: true, ...opts }); // fromBlueprint variable is important
    const jhContext = (this.jhipsterContext = this.options.jhipsterContext);
    if (!jhContext) {
      this.error("This is a JHipster blueprint and should be used only like 'jhipster --blueprints myblueprint')}");
    }
  }

  get initializing() {
    return super._initializing();
  }

  get prompting() {
    return super._prompting();
  }

  get configuring() {
    return super._configuring();
  }

  get default() {
    return super._default();
  }

  get writing() {
    const phaseFromJHipster = super._writing();
    const customPhaseSteps = {
      addDummyProperty() {
        this.addNpmDependency('dummy-blueprint-property', '2.0');
      },
    };
    return { ...phaseFromJHipster, ...customPhaseSteps };
  }

  get install() {
    return super._install();
  }

  get end() {
    return super._end();
  }
};

describe('JHipster client generator with blueprint', () => {
  const blueprintNames = ['generator-jhipster-myblueprint', 'myblueprint'];

  blueprintNames.forEach(blueprintName => {
    describe(`generate client with blueprint option '${blueprintName}'`, () => {
      before(done => {
        helpers
          .run(path.join(__dirname, '../../generators/client'))
          .withOptions({
            fromCli: true,
            build: 'maven',
            auth: 'jwt',
            db: 'mysql',
            skipInstall: true,
            blueprint: blueprintName,
            skipChecks: true,
          })
          .withGenerators([[MockedClientGenerator, 'jhipster-myblueprint:client']])
          .withPrompts({
            baseName: 'jhipster',
            clientFramework: ANGULAR,
            enableTranslation: true,
            nativeLanguage: 'en',
            languages: ['fr', 'en'],
          })
          .on('end', done);
      });

      it('creates expected files from jhipster client generator', () => {
        assert.file(expectedFiles.client);
        assert.file(expectedFiles.i18nJson);
        assert.file(expectedFiles.i18nAdminJson);
      });

      it('contains the specific change added by the blueprint', () => {
        assert.fileContent('package.json', /dummy-blueprint-property/);
      });
    });
  });

  describe('generate client with dummy blueprint overriding everything', () => {
    before(done => {
      helpers
        .run(path.join(__dirname, '../../generators/client'))
        .withOptions({
          fromCli: true,
          skipInstall: true,
          blueprint: 'myblueprint',
          skipChecks: true,
        })
        .withGenerators([[helpers.createDummyGenerator(), 'jhipster-myblueprint:client']])
        .withPrompts({
          baseName: 'jhipster',
          clientFramework: ANGULAR,
          enableTranslation: true,
          nativeLanguage: 'en',
          languages: ['fr', 'en'],
        })
        .on('end', done);
    });

    it("doesn't create any expected files from jhipster client generator", () => {
      assert.noFile(expectedFiles.client);
    });
  });
});
