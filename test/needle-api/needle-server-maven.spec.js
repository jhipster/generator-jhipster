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
            mavenStep() {
                this.addMavenDependencyManagement(
                    'groupId',
                    'artifactId',
                    'version',
                    'type',
                    'scope',
                    '            <exclusions>\n' +
                        '                <exclusion>\n' +
                        '                    <groupId>aGroupId</groupId>\n' +
                        '                    <artifactId>anArtifactId</artifactId>\n' +
                        '                </exclusion>\n' +
                        '            </exclusions>'
                );

                this.addMavenRepository('id', 'url');
                this.addMavenPluginRepository('id', 'url');
                this.addMavenDistributionManagement('snapshotsId', 'snapshotsUrl', 'releasesId', 'releasesUrl');
                this.addMavenProperty('name', 'value');
                this.addMavenDependency(
                    'groupId',
                    'artifactId',
                    'version',
                    '            <exclusions>\n' +
                        '                <exclusion>\n' +
                        '                    <groupId>aGroupId</groupId>\n' +
                        '                    <artifactId>anArtifactId</artifactId>\n' +
                        '                </exclusion>\n' +
                        '            </exclusions>'
                );
                this.addMavenDependencyInDirectory(
                    '.',
                    'groupId2',
                    'artifactId2',
                    'version2',
                    '            <exclusions>\n' +
                        '                <exclusion>\n' +
                        '                    <groupId>aGroupId</groupId>\n' +
                        '                    <artifactId>anArtifactId</artifactId>\n' +
                        '                </exclusion>\n' +
                        '            </exclusions>'
                );
                this.addMavenPlugin(
                    'groupId',
                    'artifactId',
                    'version',
                    '            <exclusions>\n' +
                        '                <exclusion>\n' +
                        '                    <groupId>aGroupId</groupId>\n' +
                        '                    <artifactId>anArtifactId</artifactId>\n' +
                        '                </exclusion>\n' +
                        '            </exclusions>'
                );
                this.addMavenAnnotationProcessor(
                    'annotationProcessorGroupId',
                    'annotationProcessorArtifactId',
                    'annotationProcessorVersion'
                );
                this.addMavenProfile('profileId', '            <other>other</other>');
            }
        };
        return { ...phaseFromJHipster, ...customPhaseSteps };
    }
};

describe('needle API server maven: JHipster server generator with blueprint', () => {
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
                buildTool: 'maven',
                rememberMeKey: '5c37379956bd1242f5636c8cb322c2966ad81277',
                serverSideOptions: []
            })
            .on('end', done);
    });

    it('Assert pom.xml has the dependency management added', () => {
        assert.fileContent(
            'pom.xml',
            '            <dependency>\n' +
                '                <groupId>groupId</groupId>\n' +
                '                <artifactId>artifactId</artifactId>\n' +
                '                <version>version</version>\n' +
                '                <type>type</type>\n' +
                '                <scope>scope</scope>\n' +
                '            <exclusions>\n' +
                '                <exclusion>\n' +
                '                    <groupId>aGroupId</groupId>\n' +
                '                    <artifactId>anArtifactId</artifactId>\n' +
                '                </exclusion>\n' +
                '            </exclusions>\n' +
                '             </dependency>'
        );
    });

    it('Assert pom.xml has the repository added', () => {
        assert.fileContent('pom.xml', '        <repository>\n            <id>id</id>\n            <url>url</url>\n        </repository>');
    });

    it('Assert pom.xml has the plugin repository added', () => {
        assert.fileContent(
            'pom.xml',
            '        <pluginRepository>\n            <id>id</id>\n            <url>url</url>\n        </pluginRepository>'
        );
    });

    it('Assert pom.xml has the distributionManagement added', () => {
        assert.fileContent(
            'pom.xml',
            '        <repository>\n' +
                '            <id>releasesId</id>\n' +
                '            <url>releasesUrl</url>\n' +
                '        </repository>'
        );
    });

    it('Assert pom.xml has the property added', () => {
        assert.fileContent('pom.xml', '<name>value</name>');
    });

    it('Assert pom.xml has the dependencyManagement added', () => {
        assert.fileContent('pom.xml', '');
    });

    it('Assert pom.xml has the dependency added', () => {
        assert.fileContent(
            'pom.xml',
            '        <dependency>\n' +
                '            <groupId>groupId</groupId>\n' +
                '            <artifactId>artifactId</artifactId>\n' +
                '            <version>version</version>\n' +
                '            <exclusions>\n' +
                '                <exclusion>\n' +
                '                    <groupId>aGroupId</groupId>\n' +
                '                    <artifactId>anArtifactId</artifactId>\n' +
                '                </exclusion>\n' +
                '            </exclusions>\n' +
                '        </dependency>'
        );
    });

    it('Assert pom.xml has the dependency in directory added', () => {
        assert.fileContent(
            'pom.xml',
            '        <dependency>\n' +
                '            <groupId>groupId2</groupId>\n' +
                '            <artifactId>artifactId2</artifactId>\n' +
                '            <version>version2</version>\n' +
                '            <exclusions>\n' +
                '                <exclusion>\n' +
                '                    <groupId>aGroupId</groupId>\n' +
                '                    <artifactId>anArtifactId</artifactId>\n' +
                '                </exclusion>\n' +
                '            </exclusions>\n' +
                '        </dependency>'
        );
    });

    it('Assert pom.xml has the annotation processor added', () => {
        assert.fileContent(
            'pom.xml',
            '        <path>\n' +
                '            <groupId>annotationProcessorGroupId</groupId>\n' +
                '            <artifactId>annotationProcessorArtifactId</artifactId>\n' +
                '            <version>annotationProcessorVersion</version>\n' +
                '        </path>'
        );
    });

    it('Assert pom.xml has the profile added', () => {
        assert.fileContent(
            'pom.xml',
            '        <profile>\n            <id>profileId</id>\n            <other>other</other>\n        </profile>'
        );
    });
});
