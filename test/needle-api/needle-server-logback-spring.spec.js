const path = require('path');
const assert = require('yeoman-assert');
const helpers = require('yeoman-test');
const ServerGenerator = require('../../generators/server');
const constants = require('../../generators/generator-constants');

const SERVER_MAIN_RES_DIR = constants.SERVER_MAIN_RES_DIR;

const filePath = `${SERVER_MAIN_RES_DIR}logback-spring.xml`;

const mockBlueprintSubGen = class extends ServerGenerator {
  constructor(args, opts, features) {
    super(args, opts, features);

    const jhContext = (this.jhipsterContext = this.options.jhipsterContext);

    if (!jhContext) {
      this.error('This is a JHipster blueprint and should be used only like jhipster --blueprints myblueprint');
    }

    this.sbsBlueprint = true;
  }

  get postWriting() {
    const customPhaseSteps = {
      addlogStep() {
        this.addLoggerForLogbackSpring('org.test.logTest', 'OFF');
      },
    };
    return { ...customPhaseSteps };
  }
};

describe('needle API server log: JHipster server generator with blueprint', () => {
  before(done => {
    helpers
      .run(path.join(__dirname, '../../generators/server'))
      .withOptions({
        fromCli: true,
        skipInstall: true,
        blueprint: 'myblueprint',
        skipChecks: true,
      })
      .withGenerators([[mockBlueprintSubGen, 'jhipster-myblueprint:server']])
      .withPrompts({
        baseName: 'jhipster',
        packageName: 'com.mycompany.myapp',
        packageFolder: 'com/mycompany/myapp',
        serviceDiscoveryType: false,
        authenticationType: 'jwt',
        cacheProvider: 'ehcache',
        enableHibernateCache: true,
        databaseType: 'sql',
        devDatabaseType: 'h2Memory',
        prodDatabaseType: 'mysql',
        enableTranslation: true,
        nativeLanguage: 'en',
        languages: ['fr'],
        buildTool: 'maven',
        rememberMeKey: '5c37379956bd1242f5636c8cb322c2966ad81277',
        serverSideOptions: [],
      })
      .on('end', done);
  });

  it('Assert log is added to logback-spring.xml', () => {
    assert.fileContent(filePath, '<logger name="org.test.logTest" level="OFF"/>');
  });
});
