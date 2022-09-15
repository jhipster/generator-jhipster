/* eslint-disable max-classes-per-file */
const path = require('path');
const assert = require('yeoman-assert');
const helpers = require('yeoman-test');
const expectedFiles = require('../utils/expected-files');
const ClientGenerator = require('../../generators/client');
const ServerGenerator = require('../../generators/server');
const { MYSQL, SQL, H2_MEMORY } = require('../../jdl/jhipster/database-types');
const { ANGULAR } = require('../../jdl/jhipster/client-framework-types');
const { JWT } = require('../../jdl/jhipster/authentication-types');
const { EHCACHE } = require('../../jdl/jhipster/cache-types');

const mockClientBlueprintSubGen = class extends ClientGenerator {
  constructor(args, opts, features) {
    super(args, opts, features);

    if (!this.options.jhipsterContext) {
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

  get composing() {
    return super._composing();
  }

  get loading() {
    return super._loading();
  }

  get preparing() {
    return super._preparing();
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
    return {
      ...phaseFromJHipster,
      ...customPhaseSteps,
    };
  }

  get postWriting() {
    return super._postWriting();
  }

  get install() {
    return super._install();
  }

  get postInstall() {
    return super._postInstall();
  }

  get end() {
    return super._end();
  }
};

const mockServerBlueprintSubGen = class extends ServerGenerator {
  constructor(args, opts, features) {
    super(args, opts, features);

    if (!this.options.jhipsterContext) {
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

  get composing() {
    return super._composing();
  }

  get loading() {
    return super._loading();
  }

  get preparing() {
    return super._preparing();
  }

  get default() {
    return super._default();
  }

  get writing() {
    const phaseFromJHipster = super._writing();
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

  get postWriting() {
    return super._postWriting();
  }

  get install() {
    return super._install();
  }

  get postInstall() {
    return super._postInstall();
  }

  get end() {
    return super._end();
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
          .run(path.join(__dirname, '../../generators/app'))
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
