const path = require('path');
const assert = require('yeoman-assert');
const helpers = require('yeoman-test');
const expectedFiles = require('../utils/expected-files');
const ClientGenerator = require('../../generators/client');
const { MYSQL } = require('../../jdl/jhipster/database-types');
const { ANGULAR_X } = require('../../jdl/jhipster/client-framework-types');
const { JWT } = require('../../jdl/jhipster/authentication-types');
const { MAVEN } = require('../../jdl/jhipster/build-tool-types');

const mockBlueprintSubGen = class extends ClientGenerator {
  constructor(args, opts) {
    super(args, {
      fromBlueprint: true,
      ...opts,
      outputPathCustomizer: paths => (paths ? paths.replace(/^src\/main\/webapp([/$])/, 'src/main/webapp2$1') : undefined),
    }); // fromBlueprint variable is important
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

describe('JHipster client generator with blueprint with path customizer', () => {
  const blueprintNames = ['generator-jhipster-myblueprint', 'myblueprint'];

  blueprintNames.forEach(blueprintName => {
    describe(`generate client with blueprint option '${blueprintName}'`, () => {
      before(done => {
        helpers
          .run(path.join(__dirname, '../../generators/client'))
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
            clientFramework: ANGULAR_X,
            enableTranslation: true,
            nativeLanguage: 'en',
            languages: ['en', 'fr'],
          })
          .on('end', done);
      });

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
