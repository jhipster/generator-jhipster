const path = require('path');
const assert = require('yeoman-assert');
const helpers = require('yeoman-test');
const expectedFiles = require('../utils/expected-files');
const ClientGenerator = require('../../generators/client/index.cjs');
const { MYSQL } = require('../../jdl/jhipster/database-types');
const { ANGULAR } = require('../../jdl/jhipster/client-framework-types');
const { JWT } = require('../../jdl/jhipster/authentication-types');
const { MAVEN } = require('../../jdl/jhipster/build-tool-types');

const mockBlueprintSubGen = class extends ClientGenerator {
  constructor(args, opts, features) {
    super(
      args,
      {
        ...opts,
        outputPathCustomizer: paths => (paths ? paths.replace(/^src\/main\/webapp([/$])/, 'src/main/webapp2$1') : undefined),
      },
      features
    );
    const jhContext = (this.jhipsterContext = this.options.jhipsterContext);
    if (!jhContext) {
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
    const phaseFromJHipster = super.writing;
    const customPhaseSteps = {
      addDummyProperty() {
        this.addNpmDependency('dummy-blueprint-property', '2.0');
      },
    };
    return { ...phaseFromJHipster, ...customPhaseSteps };
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

describe('JHipster client generator with blueprint with path customizer', () => {
  const blueprintNames = ['generator-jhipster-myblueprint', 'myblueprint'];

  blueprintNames.forEach(blueprintName => {
    describe(`generate client with blueprint option '${blueprintName}'`, () => {
      before(() =>
        helpers
          .run(path.join(__dirname, '../../generators/client/index.mjs'))
          .withOptions({
            fromCli: true,
            build: MAVEN,
            auth: JWT,
            db: MYSQL,
            skipInstall: true,
            blueprint: blueprintName,
            skipChecks: true,
          })
          .withGenerators([[mockBlueprintSubGen, 'jhipster-myblueprint:client']])
          .withPrompts({
            baseName: 'jhipster',
            clientFramework: ANGULAR,
            enableTranslation: true,
            nativeLanguage: 'en',
            languages: ['en', 'fr'],
          })
      );

      it('creates expected files from jhipster client generator', () => {
        assert.file(
          expectedFiles.client.map(path => {
            path = path.replace(/^src\/main\/webapp([/$])/, 'src/main/webapp2$1');
            assert(!/^src\/main\/webapp([/$])/.test(path));
            return path;
          })
        );
        assert.file(
          expectedFiles.i18nJson.map(path => {
            path = path.replace(/^src\/main\/webapp([/$])/, 'src/main/webapp2$1');
            assert(!/^src\/main\/webapp([/$])/.test(path));
            return path;
          })
        );
        assert.file(
          expectedFiles.i18nAdminJson.map(path => {
            path = path.replace(/^src\/main\/webapp([/$])/, 'src/main/webapp2$1');
            assert(!/^src\/main\/webapp([/$])/.test(path));
            return path;
          })
        );
      });

      it('contains the specific change added by the blueprint', () => {
        assert.fileContent('package.json', /dummy-blueprint-property/);
      });
    });
  });
});
