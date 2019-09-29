const path = require('path');
const assert = require('yeoman-assert');
const helpers = require('yeoman-test');
const ServerGenerator = require('../../generators/server');

const mockBlueprintSubGen = class extends ServerGenerator {
    constructor(args, opts) {
        super(args, { fromBlueprint: true, ...opts }); // fromBlueprint variable is important

        const jhContext = (this.jhipsterContext = this.options.jhipsterContext);

        if (!jhContext) {
            this.error('This is a JHipster blueprint and should be used only like jhipster --blueprint myblueprint');
        }

        this.configOptions = jhContext.configOptions || {};
        // This sets up options for this sub generator and is being reused from JHipster
        jhContext.setupServerOptions(this, jhContext);
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
            }
        };
        return { ...phaseFromJHipster, ...customPhaseSteps };
    }
};

describe('needle API server gradle: JHipster server generator with blueprint', () => {
    before(done => {
        helpers
            .run(path.join(__dirname, '../../generators/server'))
            .withOptions({
                'from-cli': true,
                skipInstall: true,
                blueprint: 'myblueprint',
                skipChecks: true
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
                buildTool: 'gradle',
                rememberMeKey: '5c37379956bd1242f5636c8cb322c2966ad81277',
                serverSideOptions: []
            })
            .on('end', done);
    });

    it('Assert gradle.properties has the property added', () => {
        assert.fileContent('gradle.properties', 'name=value');
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
