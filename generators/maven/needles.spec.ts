import { before, describe, expect, it } from 'esmocha';
import { defaultHelpers as helpers, result as runResult } from '../../lib/testing/index.ts';
import { GENERATOR_MAVEN } from '../generator-list.ts';
import { asPostWritingTask } from '../base-application/support/task-type-inference.ts';

const addNeedlesTask = asPostWritingTask(function ({ source }) {
  const inProfile = (this.options as any).profile;
  function asItemOrArray<T>(item: T): T | T[] {
    return inProfile ? [item] : item;
  }
  source.addMavenDependencyManagement?.(
    asItemOrArray({
      inProfile,
      groupId: 'dependencyManagementGroupId',
      artifactId: 'dependencyManagementArtifactId',
      version: 'version',
      type: 'jar',
      scope: 'test',
      additionalContent: `
                <exclusions>
                    <exclusion>
                        <groupId>exclusionGroupId</groupId>
                        <artifactId>exclusionArtifactId</artifactId>
                    </exclusion>
                </exclusions>`,
    }),
  );

  source.addMavenDistributionManagement?.(
    asItemOrArray({
      inProfile,
      snapshotsId: 'snapshotsId',
      snapshotsUrl: 'snapshotsUrl',
      releasesId: 'releasesId',
      releasesUrl: 'releasesUrl',
    }),
  );
  source.addMavenProperty?.(asItemOrArray({ inProfile, property: 'propertyName.dotted', value: 'propertyValue' }));
  source.addMavenDependency?.(
    asItemOrArray({
      inProfile,
      groupId: 'dependencyGroupId',
      artifactId: 'dependencyArtifactId',
      version: 'version',
      additionalContent: `
            <exclusions>
                <exclusion>
                    <groupId>exclusionGroupId</groupId>
                    <artifactId>exclusionArtifactId</artifactId>
                </exclusion>
            </exclusions>`,
    }),
  );
  source.addMavenPlugin?.(
    asItemOrArray({
      inProfile,
      groupId: 'mavenPluginGroupId',
      artifactId: 'mavenPluginArtifactId',
      version: 'version',
      additionalContent: `
                <exclusions>
                    <exclusion>
                        <groupId>exclusionGroupId</groupId>
                        <artifactId>exclusionArtifactId</artifactId>
                    </exclusion>
                </exclusions>`,
    }),
  );
  source.addMavenPluginManagement?.(
    asItemOrArray({
      inProfile,
      groupId: 'mavenPluginManagementGroupId',
      artifactId: 'mavenPluginManagementArtifactId',
      version: 'version',
      additionalContent: `                    <exclusions>
                        <exclusion>
                            <groupId>exclusionGroupId</groupId>
                            <artifactId>exclusionArtifactId</artifactId>
                        </exclusion>
                    </exclusions>`,
    }),
  );
  source.addMavenAnnotationProcessor?.(
    asItemOrArray({
      inProfile,
      groupId: 'annotationProcessorGroupId',
      artifactId: 'annotationProcessorArtifactId',
      version: 'annotationProcessorVersion',
    }),
  );
  source.addMavenProfile?.(asItemOrArray({ id: 'profileId', content: '            <other>other</other>' }));
  source.addMavenRepository?.(
    asItemOrArray({
      id: 'repositoryId',
      url: 'repositoryUrl',
      releasesEnabled: true,
      snapshotsEnabled: false,
    }),
  );
  source.addMavenPluginRepository?.(
    asItemOrArray({
      id: 'repositoryId',
      url: 'repositoryUrl',
    }),
  );
});

describe('generator - maven - needles', () => {
  describe('no profile', () => {
    before(async () => {
      await helpers
        .runJHipster(GENERATOR_MAVEN)
        .withJHipsterConfig({
          clientFramework: 'no',
        })
        .withTask('postWriting', addNeedlesTask);
    });

    it('Assert pom.xml has the dependency management added', () => {
      runResult.assertFileContent(
        'pom.xml',
        `
            <dependency>
                <groupId>dependencyManagementGroupId</groupId>
                <artifactId>dependencyManagementArtifactId</artifactId>
                <version>version</version>
                <type>jar</type>
                <scope>test</scope>
                <exclusions>
                    <exclusion>
                        <groupId>exclusionGroupId</groupId>
                        <artifactId>exclusionArtifactId</artifactId>
                    </exclusion>
                </exclusions>
            </dependency>`,
      );
    });

    it('Assert pom.xml has the distributionManagement added', () => {
      runResult.assertFileContent(
        'pom.xml',
        `    <distributionManagement>
        <snapshotRepository>
            <id>snapshotsId</id>
            <url>snapshotsUrl</url>
        </snapshotRepository>
        <repository>
            <id>releasesId</id>
            <url>releasesUrl</url>
        </repository>
    </distributionManagement>`,
      );
    });

    it('Assert pom.xml has the property added', () => {
      runResult.assertFileContent('pom.xml', '<propertyName.dotted>propertyValue</propertyName.dotted>');
    });

    it('Assert pom.xml has the dependency added', () => {
      runResult.assertFileContent(
        'pom.xml',
        `        <dependency>
            <groupId>dependencyGroupId</groupId>
            <artifactId>dependencyArtifactId</artifactId>
            <version>version</version>
            <exclusions>
                <exclusion>
                    <groupId>exclusionGroupId</groupId>
                    <artifactId>exclusionArtifactId</artifactId>
                </exclusion>
            </exclusions>
        </dependency>`,
      );
    });
    it('Assert pom.xml has the maven plugin added', () => {
      runResult.assertFileContent(
        'pom.xml',
        `            <plugin>
                <groupId>mavenPluginGroupId</groupId>
                <artifactId>mavenPluginArtifactId</artifactId>
                <version>version</version>
                <exclusions>
                    <exclusion>
                        <groupId>exclusionGroupId</groupId>
                        <artifactId>exclusionArtifactId</artifactId>
                    </exclusion>
                </exclusions>
            </plugin>`,
      );
    });

    it('Assert pom.xml has the maven plugin management added', () => {
      runResult.assertFileContent(
        'pom.xml',
        `                <plugin>
                    <groupId>mavenPluginManagementGroupId</groupId>
                    <artifactId>mavenPluginManagementArtifactId</artifactId>
                    <version>version</version>
                    <exclusions>
                        <exclusion>
                            <groupId>exclusionGroupId</groupId>
                            <artifactId>exclusionArtifactId</artifactId>
                        </exclusion>
                    </exclusions>
                </plugin>`,
      );
    });

    it('Assert pom.xml has the annotation processor added', () => {
      runResult.assertFileContent(
        'pom.xml',
        `
                            <path>
                                <groupId>annotationProcessorGroupId</groupId>
                                <artifactId>annotationProcessorArtifactId</artifactId>
                                <version>annotationProcessorVersion</version>
                            </path>`,
      );
    });

    it('Assert pom.xml has the profile added', () => {
      runResult.assertFileContent(
        'pom.xml',
        `
        <profile>
            <id>profileId</id>
            <other>other</other>
        </profile>`,
      );
    });
  });
  describe('prod profile', () => {
    before(async () => {
      await helpers
        .runJHipster(GENERATOR_MAVEN)
        .withJHipsterConfig({
          clientFramework: 'no',
        })
        .withOptions({
          profile: 'prod',
        })
        .withTask('postWriting', addNeedlesTask);
    });

    it('Assert pom.xml has the dependency management added', () => {
      runResult.assertFileContent(
        'pom.xml',
        `
                    <dependency>
                        <groupId>dependencyManagementGroupId</groupId>
                        <artifactId>dependencyManagementArtifactId</artifactId>
                        <version>version</version>
                        <type>jar</type>
                        <scope>test</scope>
                        <exclusions>
                            <exclusion>
                                <groupId>exclusionGroupId</groupId>
                                <artifactId>exclusionArtifactId</artifactId>
                            </exclusion>
                        </exclusions>
                    </dependency>`,
      );
    });

    it('Assert pom.xml has the distributionManagement added', () => {
      runResult.assertFileContent(
        'pom.xml',
        `
            <distributionManagement>
                <snapshotRepository>
                    <id>snapshotsId</id>
                    <url>snapshotsUrl</url>
                </snapshotRepository>
                <repository>
                    <id>releasesId</id>
                    <url>releasesUrl</url>
                </repository>
            </distributionManagement>`,
      );
    });

    it('Assert pom.xml has the property added', () => {
      runResult.assertFileContent('pom.xml', '<propertyName.dotted>propertyValue</propertyName.dotted>');
    });

    it('Assert pom.xml has the dependency added', () => {
      runResult.assertFileContent(
        'pom.xml',
        `
                <dependency>
                    <groupId>dependencyGroupId</groupId>
                    <artifactId>dependencyArtifactId</artifactId>
                    <version>version</version>
                    <exclusions>
                        <exclusion>
                            <groupId>exclusionGroupId</groupId>
                            <artifactId>exclusionArtifactId</artifactId>
                        </exclusion>
                    </exclusions>
                </dependency>`,
      );
    });
    it('Assert pom.xml has the maven plugin added', () => {
      runResult.assertFileContent(
        'pom.xml',
        `            <plugin>
                        <groupId>mavenPluginGroupId</groupId>
                        <artifactId>mavenPluginArtifactId</artifactId>
                        <version>version</version>
                        <exclusions>
                            <exclusion>
                                <groupId>exclusionGroupId</groupId>
                                <artifactId>exclusionArtifactId</artifactId>
                            </exclusion>
                        </exclusions>
                    </plugin>`,
      );
    });

    it('Assert pom.xml has the maven plugin management added', () => {
      runResult.assertFileContent(
        'pom.xml',
        `                <plugin>
                            <groupId>mavenPluginManagementGroupId</groupId>
                            <artifactId>mavenPluginManagementArtifactId</artifactId>
                            <version>version</version>
                            <exclusions>
                                <exclusion>
                                    <groupId>exclusionGroupId</groupId>
                                    <artifactId>exclusionArtifactId</artifactId>
                                </exclusion>
                            </exclusions>
                        </plugin>`,
      );
    });

    it('Assert pom.xml has the annotation processor added', () => {
      runResult.assertFileContent(
        'pom.xml',
        `
                                    <path>
                                        <groupId>annotationProcessorGroupId</groupId>
                                        <artifactId>annotationProcessorArtifactId</artifactId>
                                        <version>annotationProcessorVersion</version>
                                    </path>`,
      );
    });

    it('should match generated pom', () => {
      expect(runResult.getSnapshot('**/pom.xml')).toMatchSnapshot();
    });
  });
});
