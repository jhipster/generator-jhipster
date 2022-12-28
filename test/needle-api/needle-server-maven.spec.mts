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

  get [ServerGenerator.WRITING]() {
    const customPhaseSteps = {
      mavenStep() {
        this.addMavenDependencyManagement(
          'dependencyManagementGroupId',
          'dependencyManagementArtifactId',
          'version',
          'type',
          'scope',
          '                <exclusions>\n' +
            '                    <exclusion>\n' +
            '                        <groupId>exclusionGroupId</groupId>\n' +
            '                        <artifactId>exclusionArtifactId</artifactId>\n' +
            '                    </exclusion>\n' +
            '                </exclusions>'
        );

        this.addMavenRepository('repoId', 'repoUrl', '            <name>repoName</name>');
        this.addMavenPluginRepository('pluginRepoId', 'pluginRepoUrl');
        this.addMavenDistributionManagement('snapshotsId', 'snapshotsUrl', 'releasesId', 'releasesUrl');
        this.addMavenProperty('propertyName', 'propertyValue');
        this.addMavenDependency(
          'dependencyGroupId',
          'dependencyArtifactId',
          'version',
          '            <exclusions>\n' +
            '                <exclusion>\n' +
            '                    <groupId>exclusionGroupId</groupId>\n' +
            '                    <artifactId>exclusionArtifactId</artifactId>\n' +
            '                </exclusion>\n' +
            '            </exclusions>'
        );
        this.addMavenDependencyInDirectory(
          '.',
          'directoryDependencyGroupId',
          'directoryDependencyArtifactId',
          'version2',
          '            <exclusions>\n' +
            '                <exclusion>\n' +
            '                    <groupId>exclusionGroupId</groupId>\n' +
            '                    <artifactId>exclusionArtifactId</artifactId>\n' +
            '                </exclusion>\n' +
            '            </exclusions>'
        );
        this.addMavenPlugin(
          'mavenPluginGroupId',
          'mavenPluginArtifactId',
          'version',
          '                <exclusions>\n' +
            '                    <exclusion>\n' +
            '                        <groupId>exclusionGroupId</groupId>\n' +
            '                        <artifactId>exclusionArtifactId</artifactId>\n' +
            '                    </exclusion>\n' +
            '                </exclusions>'
        );
        this.addMavenPluginManagement(
          'mavenPluginManagementGroupId',
          'mavenPluginManagementArtifactId',
          'version',
          '                    <exclusions>\n' +
            '                        <exclusion>\n' +
            '                            <groupId>exclusionGroupId</groupId>\n' +
            '                            <artifactId>exclusionArtifactId</artifactId>\n' +
            '                        </exclusion>\n' +
            '                    </exclusions>'
        );
        this.addMavenAnnotationProcessor('annotationProcessorGroupId', 'annotationProcessorArtifactId', 'annotationProcessorVersion');
        this.addMavenProfile('profileId', '            <other>other</other>');
      },
    };
    return { ...customPhaseSteps };
  }
};

describe('needle API server maven: JHipster server generator with blueprint', () => {
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

  it('Assert pom.xml has the dependency management added', () => {
    assert.fileContent(
      'pom.xml',
      '            <dependency>\n' +
        '                <groupId>dependencyManagementGroupId</groupId>\n' +
        '                <artifactId>dependencyManagementArtifactId</artifactId>\n' +
        '                <version>version</version>\n' +
        '                <type>type</type>\n' +
        '                <scope>scope</scope>\n' +
        '                <exclusions>\n' +
        '                    <exclusion>\n' +
        '                        <groupId>exclusionGroupId</groupId>\n' +
        '                        <artifactId>exclusionArtifactId</artifactId>\n' +
        '                    </exclusion>\n' +
        '                </exclusions>\n' +
        '            </dependency>\n' +
        '            <!-- jhipster-needle-maven-add-dependency-management -->'
    );
  });

  it('Assert pom.xml has the repository added', () => {
    assert.fileContent(
      'pom.xml',
      '        <repository>\n' +
        '            <id>repoId</id>\n' +
        '            <url>repoUrl</url>\n' +
        '            <name>repoName</name>\n' +
        '        </repository>\n' +
        '        <!-- jhipster-needle-maven-repository -->'
    );
  });

  it('Assert pom.xml has the plugin repository added', () => {
    assert.fileContent(
      'pom.xml',
      '        <pluginRepository>\n' +
        '            <id>pluginRepoId</id>\n' +
        '            <url>pluginRepoUrl</url>\n' +
        '        </pluginRepository>\n' +
        '        <!-- jhipster-needle-maven-plugin-repository -->'
    );
  });

  it('Assert pom.xml has the distributionManagement added', () => {
    assert.fileContent(
      'pom.xml',
      '    <distributionManagement>\n' +
        '        <snapshotRepository>\n' +
        '            <id>snapshotsId</id>\n' +
        '            <url>snapshotsUrl</url>\n' +
        '        </snapshotRepository>\n' +
        '        <repository>\n' +
        '            <id>releasesId</id>\n' +
        '            <url>releasesUrl</url>\n' +
        '        </repository>\n' +
        '    </distributionManagement>\n' +
        '    <!-- jhipster-needle-distribution-management -->'
    );
  });

  it('Assert pom.xml has the property added', () => {
    assert.fileContent('pom.xml', '<propertyName>propertyValue</propertyName>');
  });

  it('Assert pom.xml has the dependency added', () => {
    assert.fileContent(
      'pom.xml',
      '        <dependency>\n' +
        '            <groupId>dependencyGroupId</groupId>\n' +
        '            <artifactId>dependencyArtifactId</artifactId>\n' +
        '            <version>version</version>\n' +
        '            <exclusions>\n' +
        '                <exclusion>\n' +
        '                    <groupId>exclusionGroupId</groupId>\n' +
        '                    <artifactId>exclusionArtifactId</artifactId>\n' +
        '                </exclusion>\n' +
        '            </exclusions>\n' +
        '        </dependency>\n' +
        // The needle is not here, since another dependency has been added with addMavenDependencyInDirectory()
        '        <dependency>\n' +
        '            <groupId>directoryDependencyGroupId</groupId>\n' +
        '            <artifactId>directoryDependencyArtifactId</artifactId>'
    );
  });

  it('Assert pom.xml has the dependency in directory added', () => {
    assert.fileContent(
      'pom.xml',
      '        <dependency>\n' +
        '            <groupId>directoryDependencyGroupId</groupId>\n' +
        '            <artifactId>directoryDependencyArtifactId</artifactId>\n' +
        '            <version>version2</version>\n' +
        '            <exclusions>\n' +
        '                <exclusion>\n' +
        '                    <groupId>exclusionGroupId</groupId>\n' +
        '                    <artifactId>exclusionArtifactId</artifactId>\n' +
        '                </exclusion>\n' +
        '            </exclusions>\n' +
        '        </dependency>\n' +
        '        <!-- jhipster-needle-maven-add-dependency -->'
    );
  });

  it('Assert pom.xml has the maven plugin added', () => {
    assert.fileContent(
      'pom.xml',
      '            <plugin>\n' +
        '                <groupId>mavenPluginGroupId</groupId>\n' +
        '                <artifactId>mavenPluginArtifactId</artifactId>\n' +
        '                <version>version</version>\n' +
        '                <exclusions>\n' +
        '                    <exclusion>\n' +
        '                        <groupId>exclusionGroupId</groupId>\n' +
        '                        <artifactId>exclusionArtifactId</artifactId>\n' +
        '                    </exclusion>\n' +
        '                </exclusions>\n' +
        '            </plugin>\n' +
        '            <!-- jhipster-needle-maven-add-plugin -->'
    );
  });

  it('Assert pom.xml has the maven plugin management added', () => {
    assert.fileContent(
      'pom.xml',
      '                <plugin>\n' +
        '                    <groupId>mavenPluginManagementGroupId</groupId>\n' +
        '                    <artifactId>mavenPluginManagementArtifactId</artifactId>\n' +
        '                    <version>version</version>\n' +
        '                    <exclusions>\n' +
        '                        <exclusion>\n' +
        '                            <groupId>exclusionGroupId</groupId>\n' +
        '                            <artifactId>exclusionArtifactId</artifactId>\n' +
        '                        </exclusion>\n' +
        '                    </exclusions>\n' +
        '                </plugin>\n' +
        '                <!-- jhipster-needle-maven-add-plugin-management -->'
    );
  });

  it('Assert pom.xml has the annotation processor added', () => {
    assert.fileContent(
      'pom.xml',
      '                            <path>\n' +
        '                                <groupId>annotationProcessorGroupId</groupId>\n' +
        '                                <artifactId>annotationProcessorArtifactId</artifactId>\n' +
        '                                <version>annotationProcessorVersion</version>\n' +
        '                            </path>\n' +
        '                            <!-- jhipster-needle-maven-add-annotation-processor -->'
    );
  });

  it('Assert pom.xml has the profile added', () => {
    assert.fileContent(
      'pom.xml',
      '        <profile>\n' +
        '            <id>profileId</id>\n' +
        '            <other>other</other>\n' +
        '        </profile>\n' +
        '        <!-- jhipster-needle-maven-add-profile -->'
    );
  });
});
