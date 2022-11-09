import assert from 'yeoman-assert';
import helpers from 'yeoman-test';
import expectedFiles from '../utils/expected-files.cjs';
import ClientGenerator from '../../generators/client/index.mjs';
import databaseTypes from '../../jdl/jhipster/database-types';
import clientFrameworkTypes from '../../jdl/jhipster/client-framework-types';
import authenticationTypes from '../../jdl/jhipster/authentication-types';
import buildToolTypes from '../../jdl/jhipster/build-tool-types';
import { getGenerator } from '../support/index.mjs';

const { MYSQL } = databaseTypes;
const { ANGULAR } = clientFrameworkTypes;
const { JWT } = authenticationTypes;
const { MAVEN } = buildToolTypes;

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const mockBlueprintSubGen: any = class extends ClientGenerator {
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
          .run(getGenerator('client'))
          .withOptions({
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
