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
import { JavaApplicationGenerator } from '../java/generator.ts';

import cleanupTask from './cleanup.ts';
import writeTask from './files.ts';

export default class CucumberGenerator extends JavaApplicationGenerator {
  async beforeQueue() {
    if (!this.fromBlueprint) {
      await this.composeWithBlueprints();
    }

    if (!this.delegateToBlueprint) {
      await this.dependsOnJHipster('jhipster:java:build-tool');
    }
  }

  get preparing() {
    return this.asPreparingTaskGroup({
      preparing({ application }) {
        application.javaIntegrationTestExclude.push('**/*CucumberIT*');
      },
    });
  }

  get [JavaApplicationGenerator.PREPARING]() {
    return this.delegateTasksToBlueprint(() => this.preparing);
  }

  get writing() {
    return this.asWritingTaskGroup({
      cleanupTask,
      writeTask,
    });
  }

  get [JavaApplicationGenerator.WRITING]() {
    return this.delegateTasksToBlueprint(() => this.writing);
  }

  get postWriting() {
    return this.asPostWritingTaskGroup({
      junitPlatform({ application, source }) {
        source.editJUnitPlatformProperties?.([
          { key: 'cucumber.publish.enabled', value: 'true' },
          { key: 'cucumber.plugin', value: `pretty, html:${application.temporaryDir}cucumber-reports/Cucumber.html` },
        ]);
      },
      addDependencies({ application, source }) {
        const { javaDependencies, gradleBuildSrc } = application;
        source.addJavaDefinitions?.(
          { gradleFile: `${gradleBuildSrc}src/main/groovy/jhipster.cucumber-conventions.gradle` },
          {
            dependencies: [
              {
                groupId: 'io.cucumber',
                artifactId: 'cucumber-bom',
                version: javaDependencies!['cucumber-bom'],
                type: 'pom',
                scope: 'import',
              },
              { groupId: 'io.cucumber', artifactId: 'cucumber-java', scope: 'test' },
              { groupId: 'io.cucumber', artifactId: 'cucumber-spring', scope: 'test' },
              { groupId: 'org.junit.platform', artifactId: 'junit-platform-console', scope: 'test' },
              { groupId: 'org.testng', artifactId: 'testng', scope: 'test', version: javaDependencies!.testng },
            ],
            mavenDefinition: {
              plugins: [{ groupId: 'org.apache.maven.plugins', artifactId: 'maven-antrun-plugin' }],
              pluginManagement: [
                {
                  groupId: 'org.apache.maven.plugins',
                  artifactId: 'maven-antrun-plugin',
                },
              ],
            },
          },
        );

        if (application.buildToolGradle) {
          source.addGradlePlugin?.({ id: 'jhipster.cucumber-conventions' });
        }
      },
      addCucumberJunitPlatformEngine({ application, source }) {
        if (application.buildToolGradle) {
          source.addJavaDefinitions?.({
            dependencies: [
              { groupId: 'io.cucumber', artifactId: 'cucumber-junit-platform-engine', scope: 'test' },
              { groupId: 'org.junit.platform', artifactId: 'junit-platform-engine', scope: 'test', version: '1.14.0' },
              { groupId: 'org.junit.platform', artifactId: 'junit-platform-commons', scope: 'test', version: '1.14.0' },
              { groupId: 'org.junit.platform', artifactId: 'junit-platform-launcher', scope: 'runtime', version: '1.14.0' },
            ],
          });
        }
        if (application.buildToolMaven) {
          source.addMavenDefinition!({
            profiles: [
              {
                id: 'e2e',
                content: `
                <properties>
                    <profile.e2e>,e2e</profile.e2e>
                </properties>
                <build>
                    <finalName>e2e</finalName>
                </build>
                <dependencies>
                    <dependency>
                        <groupId>io.cucumber</groupId>
                        <artifactId>cucumber-junit-platform-engine</artifactId>
                        <scope>test</scope>
                    </dependency>
                </dependencies>`,
              },
            ],
          });
        }
      },
    });
  }

  get [JavaApplicationGenerator.POST_WRITING]() {
    return this.delegateTasksToBlueprint(() => this.postWriting);
  }
}
