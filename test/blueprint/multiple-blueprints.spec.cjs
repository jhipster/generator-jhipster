/* eslint-disable max-classes-per-file */
const assert = require('yeoman-assert');
const helpers = require('yeoman-test');
const expectedFiles = require('../utils/expected-files.cjs');
const ClientGenerator = require('../../generators/client/index.cjs');
const ServerGenerator = require('../../generators/server/index.cjs');
const { MYSQL, SQL, H2_MEMORY } = require('../../jdl/jhipster/database-types');
const { ANGULAR } = require('../../jdl/jhipster/client-framework-types');
const { JWT } = require('../../jdl/jhipster/authentication-types');
const { EHCACHE } = require('../../jdl/jhipster/cache-types');
const { getGenerator } = require('../support/index.cjs');

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
    const phaseFromJHipster = super.writing;
    const customPhaseSteps = {
      addDummyProperty() {
        this.addNpmDependency('dummy-blueprint-property', '2.0');
      },
    };
    return {
      ...phaseFromJHipster,
      ...customPhaseSteps,
    };
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

describe('JHipster entity generator with multiple blueprints', () => {
  const blueprintNames = [
    'generator-jhipster-my-client-blueprint,generator-jhipster-my-server-blueprint',
    'my-client-blueprint,my-server-blueprint',
  ];

  blueprintNames.forEach(blueprints => {
    describe(`generate entity with multiple blueprints option '${blueprints}'`, () => {
      before(done => {
        helpers
          .run(getGenerator('app'))
          .withOptions({
            fromCli: true,
            skipInstall: true,
            skipChecks: true,
            blueprints,
          })
          .withGenerators([
            [mockClientBlueprintSubGen, 'jhipster-my-client-blueprint:client'],
            [mockServerBlueprintSubGen, 'jhipster-my-server-blueprint:server'],
          ])
          .withPrompts({
            baseName: 'jhipster',
            clientFramework: ANGULAR,
            packageName: 'com.mycompany.myapp',
            packageFolder: 'com/mycompany/myapp',
            serviceDiscoveryType: false,
            authenticationType: JWT,
            cacheProvider: EHCACHE,
            enableHibernateCache: true,
            databaseType: SQL,
            devDatabaseType: H2_MEMORY,
            prodDatabaseType: MYSQL,
            enableTranslation: true,
            nativeLanguage: 'en',
            languages: ['fr'],
          })
          .on('end', done);
      });

      it('creates expected files from jhipster app generator', () => {
        assert.file(expectedFiles.common);
        assert.file(expectedFiles.server);
        assert.file(expectedFiles.maven);
        assert.file(expectedFiles.client);
      });

      it('contains the specific change added by the client blueprint', () => {
        assert.fileContent('package.json', /dummy-blueprint-property/);
      });

      it('contains the specific change added by the server blueprint', () => {
        assert.fileContent('pom.xml', /dummy-blueprint-property/);
      });
    });
  });
});
