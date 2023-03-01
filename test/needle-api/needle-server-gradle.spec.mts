import { basicHelpers as helpers, result as runResult } from '../support/index.mjs';
import ServerGenerator from '../../generators/server/index.mjs';
import { getGenerator } from '../support/index.mjs';
import { serviceDiscoveryTypes } from '../../jdl/jhipster/index.mjs';

const NO_SERVICE_DISCOVERY = serviceDiscoveryTypes.NO;

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const mockBlueprintSubGen: any = class extends ServerGenerator {
  constructor(args, opts, features) {
    super(args, opts, features);

    const jhContext = (this.jhipsterContext = this.options.jhipsterContext);

    if (!jhContext) {
      throw new Error('This is a JHipster blueprint and should be used only like jhipster --blueprints myblueprint');
    }

    this.sbsBlueprint = true;
  }

  get [ServerGenerator.POST_WRITING]() {
    const customPhaseSteps = {
      gradleStep() {
        this.addGradleProperty('name', 'value');
        this.addGradlePlugin('group', 'name', 'version');
        this.addGradlePluginToPluginsBlock('id', 'version');
        this.addGradleDependency('scope3', 'group3', 'name3', 'version3');
        this.addGradleDependency('scope4', 'group4', 'name4');
        this.addGradleDependencyInDirectory('.', 'scope5', 'group5', 'name5', 'version5');
        this.addGradleDependencyInDirectory('.', 'scope6', 'group6', 'name6');
        this.applyFromGradleScript('name');
        this.addGradleMavenRepository('url', 'username', 'password');
      },
    };
    return { ...customPhaseSteps };
  }
};

describe('needle API server gradle: JHipster server generator with blueprint', () => {
  before(async () => {
    await helpers
      .run(getGenerator('server'))
      .withOptions({
        blueprint: 'myblueprint',
        clientFramework: 'no',
      })
      .withGenerators([[mockBlueprintSubGen, 'jhipster-myblueprint:server']])
      .withAnswers({
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
        buildTool: 'gradle',
        rememberMeKey: '5c37379956bd1242f5636c8cb322c2966ad81277',
        serverSideOptions: [],
      });
  });

  it('Assert gradle.properties has the property added', () => {
    runResult.assertFileContent('gradle.properties', 'name=value');
  });

  it('Assert gradle.properties has not snake case properties', () => {
    runResult.assertNoFileContent('gradle.properties', /^(?!.*#).*_.*[$|=]/m); // Not comment and contains underscore
  });

  it('Assert gradle.properties has the plugin added', () => {
    runResult.assertFileContent('build.gradle', 'classpath "group:name:version"');
  });

  it('Assert gradle.properties has the PluginToPluginsBlock added', () => {
    runResult.assertFileContent('build.gradle', 'id "id" version "version"');
  });

  it('Assert gradle.properties has the Dependency with version added', () => {
    runResult.assertFileContent('build.gradle', 'scope3 "group3:name3:version3"');
  });

  it('Assert gradle.properties has the Dependency without version added', () => {
    runResult.assertFileContent('build.gradle', 'scope4 "group4:name4"');
  });

  it('Assert gradle.properties has the Dependency in directory with version added', () => {
    runResult.assertFileContent('build.gradle', 'scope5 "group5:name5:version5"');
  });

  it('Assert gradle.properties has the Dependency without version added', () => {
    runResult.assertFileContent('build.gradle', 'scope6 "group6:name6"');
  });

  it('Assert gradle.properties has the apply gradle script added', () => {
    runResult.assertFileContent('build.gradle', "apply from: 'name.gradle'");
  });

  it('Assert gradle.properties has the maven repository added', () => {
    runResult.assertFileContent(
      'build.gradle',
      '    maven {\n' +
        '        url "url"\n' +
        '        credentials {\n' +
        '            username = "username"\n' +
        '            password = "password"\n' +
        '        }\n' +
        '    }'
    );
  });
});
