/**
 * Copyright 2013-2025 the original author or authors from the JHipster project.
 *
 * This file is part of the JHipster project, see https://www.jhipster.tech/
 * for more information.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *      https://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */
import type { Source as CommonSource } from '../../../common/types.d.ts';
import { JavaApplicationGenerator } from '../../../java/generator.ts';

export default class CodeQualityGenerator extends JavaApplicationGenerator {
  async beforeQueue() {
    if (!this.fromBlueprint) {
      await this.composeWithBlueprints();
    }

    if (!this.delegateToBlueprint) {
      await this.dependsOnJHipster('jhipster:java:bootstrap');
      await this.dependsOnJHipster('maven');
    }
  }

  get postWriting() {
    return this.asPostWritingTaskGroup({
      checkstyle({ application, source }) {
        const { javaDependencies } = application;
        source.addMavenDefinition!({
          properties: [
            { property: 'checkstyle.version', value: javaDependencies!.checkstyle },
            { property: 'maven-checkstyle-plugin.version', value: javaDependencies!['maven-checkstyle-plugin'] },
            { property: 'nohttp-checkstyle.version', value: javaDependencies!['nohttp-checkstyle'] },
          ],
          plugins: [{ groupId: 'org.apache.maven.plugins', artifactId: 'maven-checkstyle-plugin' }],
          pluginManagement: [
            {
              groupId: 'org.apache.maven.plugins',
              artifactId: 'maven-checkstyle-plugin',
              // eslint-disable-next-line no-template-curly-in-string
              version: '${maven-checkstyle-plugin.version}',
              additionalContent: `
                <dependencies>
                    <dependency>
                        <groupId>com.puppycrawl.tools</groupId>
                        <artifactId>checkstyle</artifactId>
                        <version>\${checkstyle.version}</version>
                    </dependency>
                    <dependency>
                        <groupId>io.spring.nohttp</groupId>
                        <artifactId>nohttp-checkstyle</artifactId>
                        <version>\${nohttp-checkstyle.version}</version>
                    </dependency>
                </dependencies>
                <configuration>
                    <configLocation>checkstyle.xml</configLocation>
                    <includes>pom.xml,README.md</includes>
                    <excludes>.git/**/*,target/**/*,node_modules/**/*</excludes>
                    <sourceDirectories>./</sourceDirectories>
                </configuration>
                <executions>
                    <execution>
                        <goals>
                            <goal>check</goal>
                        </goals>
                    </execution>
                </executions>
`,
            },
          ],
        });
      },
      jacoco({ application, source }) {
        const { javaDependencies } = application;
        source.addMavenDefinition!({
          properties: [{ property: 'jacoco-maven-plugin.version', value: javaDependencies!['jacoco-maven-plugin'] }],
          plugins: [{ groupId: 'org.jacoco', artifactId: 'jacoco-maven-plugin' }],
          pluginManagement: [
            {
              groupId: 'org.jacoco',
              artifactId: 'jacoco-maven-plugin',
              // eslint-disable-next-line no-template-curly-in-string
              version: '${jacoco-maven-plugin.version}',
              additionalContent: `
                <executions>
                    <execution>
                        <id>pre-unit-tests</id>
                        <goals>
                            <goal>prepare-agent</goal>
                        </goals>
                    </execution>
                    <execution>
                        <!-- Ensures that the code coverage report for unit tests is created after unit tests have been run -->
                        <id>post-unit-test</id>
                        <phase>test</phase>
                        <goals>
                            <goal>report</goal>
                        </goals>
                    </execution>
                    <execution>
                        <id>pre-integration-tests</id>
                        <goals>
                            <goal>prepare-agent-integration</goal>
                        </goals>
                    </execution>
                    <execution>
                        <!-- Ensures that the code coverage report for integration tests is created after integration tests have been run -->
                        <id>post-integration-tests</id>
                        <phase>post-integration-test</phase>
                        <goals>
                            <goal>report-integration</goal>
                        </goals>
                    </execution>
                </executions>
`,
            },
          ],
        });

        (source as CommonSource).addSonarProperties?.([
          { key: 'sonar.coverage.jacoco.xmlReportPaths', value: `${application.temporaryDir}site/**/jacoco*.xml` },
          { key: 'sonar.java.codeCoveragePlugin', value: 'jacoco' },
          {
            key: 'sonar.junit.reportPaths',
            value: `${application.temporaryDir}surefire-reports,${application.temporaryDir}failsafe-reports`,
          },
        ]);
      },
      spotless({ application, source }) {
        const { javaDependencies } = application;
        source.addMavenDefinition!({
          properties: [{ property: 'spotless-maven-plugin.version', value: javaDependencies!['spotless-maven-plugin'] }],
          plugins: [{ groupId: 'com.diffplug.spotless', artifactId: 'spotless-maven-plugin' }],
          pluginManagement: [
            {
              groupId: 'com.diffplug.spotless',
              artifactId: 'spotless-maven-plugin',
              // eslint-disable-next-line no-template-curly-in-string
              version: '${spotless-maven-plugin.version}',
              additionalContent: `
                <configuration>
                    <java>
                        <!-- <removeUnusedImports/> -->
                    </java>
                </configuration>
                <executions>
                    <execution>
                        <id>spotless</id>
                        <phase>process-sources</phase>
                        <goals>
                            <goal>apply</goal>
                        </goals>
                    </execution>
                </executions>
`,
            },
          ],
        });
      },
      sonar({ application, source }) {
        const { javaDependencies } = application;
        source.addMavenDefinition!({
          properties: [
            { property: 'properties-maven-plugin.version', value: javaDependencies!['properties-maven-plugin'] },
            { property: 'sonar-maven-plugin.version', value: javaDependencies!['sonar-maven-plugin'] },
          ],
          plugins: [
            { groupId: 'org.codehaus.mojo', artifactId: 'properties-maven-plugin' },
            { groupId: 'org.sonarsource.scanner.maven', artifactId: 'sonar-maven-plugin' },
          ],
          pluginManagement: [
            {
              groupId: 'org.codehaus.mojo',
              artifactId: 'properties-maven-plugin',
              // eslint-disable-next-line no-template-curly-in-string
              version: '${properties-maven-plugin.version}',
              additionalContent: `
                <executions>
                    <execution>
                        <phase>initialize</phase>
                        <goals>
                            <goal>read-project-properties</goal>
                        </goals>
                        <configuration>
                            <files>
                                <file>sonar-project.properties</file>
                            </files>
                        </configuration>
                    </execution>
                </executions>`,
            },
            {
              groupId: 'org.sonarsource.scanner.maven',
              artifactId: 'sonar-maven-plugin',
              // eslint-disable-next-line no-template-curly-in-string
              version: '${sonar-maven-plugin.version}',
            },
          ],
        });
      },
      modernizer({ application, source }) {
        const { javaDependencies, databaseTypeCassandra, packageName } = application;
        source.addMavenDefinition!({
          properties: [{ property: 'modernizer-maven-plugin.version', value: javaDependencies!['modernizer-maven-plugin'] }],
          plugins: [{ groupId: 'org.gaul', artifactId: 'modernizer-maven-plugin' }],
          pluginManagement: [
            {
              groupId: 'org.gaul',
              artifactId: 'modernizer-maven-plugin',
              // eslint-disable-next-line no-template-curly-in-string
              version: '${modernizer-maven-plugin.version}',
              additionalContent: `
                <executions>
                    <execution>
                        <id>modernizer</id>
                        <phase>package</phase>
                        <goals>
                            <goal>modernizer</goal>
                        </goals>
                    </execution>
                </executions>
                <configuration>
                  <javaVersion>\${java.version}</javaVersion>${
                    databaseTypeCassandra
                      ? `
                  <ignoreClassNamePatterns>
                      <ignoreClassNamePattern>${packageName}.domain.PersistentTokenHelper__MapperGenerated</ignoreClassNamePattern>
                      <ignoreClassNamePattern>${packageName}.domain.UserHelper__MapperGenerated</ignoreClassNamePattern>
                  </ignoreClassNamePatterns>`
                      : ''
                  }
                </configuration>`,
            },
          ],
        });
      },
    });
  }

  get [JavaApplicationGenerator.POST_WRITING]() {
    return this.delegateTasksToBlueprint(() => this.postWriting);
  }
}
