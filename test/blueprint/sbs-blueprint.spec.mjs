import assert from 'yeoman-assert';
import helpers from 'yeoman-test';
import Generator from 'yeoman-generator';
import expectedFiles from '../utils/expected-files.cjs';
import buildToolTypes from '../../jdl/jhipster/build-tool-types';
import databaseTypes from '../../jdl/jhipster/database-types';
import clientFrameworkTypes from '../../jdl/jhipster/client-framework-types';
import authenticationTypes from '../../jdl/jhipster/authentication-types';
import testSupport from '../support/index.cjs';

const { getGenerator } = testSupport;

const { MYSQL } = databaseTypes;
const { ANGULAR } = clientFrameworkTypes;
const { JWT } = authenticationTypes;
const { MAVEN } = buildToolTypes;

const mockBlueprintSubGen = class extends Generator {
  constructor(args, opts, features) {
    super(args, opts, features);
    const jhContext = (this.jhipsterContext = this.options.jhipsterContext);
    if (!jhContext) {
      this.error("This is a JHipster blueprint and should be used only like 'jhipster --blueprints myblueprint')}");
    }

    this.sbsBlueprint = true;
  }

  get writing() {
    return {
      addDummyProperty() {
        this.jhipsterContext.addNpmDependency('dummy-blueprint-property', '2.0');
      },
    };
  }
};

describe('JHipster client generator with sbs blueprint', () => {
  before(done => {
    helpers
      .run(getGenerator('client'))
      .withOptions({
        fromCli: true,
        build: MAVEN,
        auth: JWT,
        db: MYSQL,
        skipInstall: true,
        blueprint: 'myblueprint',
        skipChecks: true,
      })
      .withGenerators([[mockBlueprintSubGen, 'jhipster-myblueprint:client']])
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
