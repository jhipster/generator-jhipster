import assert from 'yeoman-assert';
import helpers from 'yeoman-test';
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
      this.error('This is a JHipster blueprint and should be used only like jhipster --blueprints myblueprint');
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
        buildTool: 'gradle',
        rememberMeKey: '5c37379956bd1242f5636c8cb322c2966ad81277',
        serverSideOptions: [],
      })
      .on('end', done);
  });

  it('Assert gradle.properties has the property added', () => {
    assert.fileContent('gradle.properties', 'name=value');
  });

  it('Assert gradle.properties has not snake case properties', () => {
    assert.noFileContent('gradle.properties', /^(?!.*#).*_.*[$|=]/m); // Not comment and contains underscore
  });

  it('Assert gradle.properties has the plugin added', () => {
    assert.fileContent('build.gradle', 'classpath "group:name:version"');
  });

  it('Assert gradle.properties has the PluginToPluginsBlock added', () => {
    assert.fileContent('build.gradle', 'id "id" version "version"');
  });

  it('Assert gradle.properties has the Dependency with version added', () => {
    assert.fileContent('build.gradle', 'scope3 "group3:name3:version3"');
  });

  it('Assert gradle.properties has the Dependency without version added', () => {
    assert.fileContent('build.gradle', 'scope4 "group4:name4"');
  });

  it('Assert gradle.properties has the Dependency in directory with version added', () => {
    assert.fileContent('build.gradle', 'scope5 "group5:name5:version5"');
  });

  it('Assert gradle.properties has the Dependency without version added', () => {
    assert.fileContent('build.gradle', 'scope6 "group6:name6"');
  });

  it('Assert gradle.properties has the apply gradle script added', () => {
    assert.fileContent('build.gradle', "apply from: 'name.gradle'");
  });

  it('Assert gradle.properties has the maven repository added', () => {
    assert.fileContent(
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
