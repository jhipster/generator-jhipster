import assert from 'yeoman-assert';
import helpers from 'yeoman-test';
import ServerGenerator from '../../generators/server/index.mjs';
import { SERVER_MAIN_RES_DIR } from '../../generators/generator-constants.mjs';
import { getGenerator } from '../support/index.mjs';
import { serviceDiscoveryTypes } from '../../jdl/jhipster/index.mjs';

const NO_SERVICE_DISCOVERY = serviceDiscoveryTypes.NO;
const filePath = `${SERVER_MAIN_RES_DIR}logback-spring.xml`;

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const mockBlueprintSubGen: any = class extends ServerGenerator {
  constructor(args, opts, features) {
    super(args, opts, features);

    const jhContext = (this.jhipsterContext = this.options.jhipsterContext);

    if (!jhContext) {
      this.error('This is a JHipster blueprint and should be used only like jhipster --blueprints myblueprint');
    }

    this.sbsBlueprint = true;
  }

  get [ServerGenerator.POST_WRITING]() {
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
      .run(getGenerator('server'))
      .withOptions({
        skipInstall: true,
        blueprint: 'myblueprint',
        skipChecks: true,
      })
      .withGenerators([[mockBlueprintSubGen, 'jhipster-myblueprint:server']])
      .withPrompts({
        baseName: 'jhipster',
        packageName: 'com.mycompany.myapp',
        packageFolder: 'com/mycompany/myapp',
        serviceDiscoveryType: NO_SERVICE_DISCOVERY,
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
