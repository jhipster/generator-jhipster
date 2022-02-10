const path = require('path');
const assert = require('yeoman-assert');
const helpers = require('yeoman-test');
const Generator = require('yeoman-generator');
const expectedFiles = require('../utils/expected-files');
const { MYSQL } = require('../../jdl/jhipster/database-types');
const { ANGULAR_X } = require('../../jdl/jhipster/client-framework-types');
const { JWT } = require('../../jdl/jhipster/authentication-types');
const { MAVEN } = require('../../jdl/jhipster/build-tool-types');

const mockBlueprintSubGen = class extends Generator {
  constructor(args, opts) {
    super(args, opts);
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
      .run(path.join(__dirname, '../../generators/client'))
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
        clientFramework: ANGULAR_X,
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
