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
import fs from 'fs';
import path from 'path';
import { JavaApplicationGenerator } from '../java/generator.ts';
import { createNeedleCallback } from '../base-core/support/index.js';
import BaseApplicationGenerator from '../base-application/index.js';
import type { Config as JavaConfig, Entity as JavaEntity, Options as JavaOptions } from '../java/index.js';
import type { Source as SpringBootSource } from '../spring-boot/types.js';
import type { Application as CucumberApplication } from '../java/types.js';
import { buildToolTypes } from '../../lib/jhipster/index.js';
import writeTask from './files.js';
import cleanupTask from './cleanup.js';

const { MAVEN, GRADLE } = buildToolTypes;

export class CucumberApplicationGenerator extends BaseApplicationGenerator<
  JavaEntity,
  CucumberApplication<JavaEntity>,
  JavaConfig,
  JavaOptions,
  SpringBootSource
> {}

export default class CucumberGenerator extends CucumberApplicationGenerator {
  async beforeQueue() {
    if (!this.fromBlueprint) {
      await this.composeWithBlueprints();
    }

    if (!this.delegateToBlueprint) {
      await this.dependsOnBootstrapApplication();
      await this.dependsOnJHipster('jhipster:java:build-tool');
    }
  }

  get preparing() {
    return this.asPreparingTaskGroup({
      preparing({ application, applicationDefaults }) {
        applicationDefaults({ cucumberTests: ({ testFrameworks }) => testFrameworks?.includes('cucumber') ?? false } as any);
      },
      addNeedles({ source, application }) {
        if (application.cucumberTests) {
          source.addJunitPlatformPropertyEntry = args => {
            const junitPlatformPath = `${application.srcTestResources}/junit-platform.properties`;
            const ignoreNonExisting = this.ignoreNeedlesError && 'Junit platform properties file not found';
            this.editFile(
              junitPlatformPath,
              { ignoreNonExisting },
              createNeedleCallback({
                needle: 'jhipster-needle-add-junit-platform-properties',
                contentToAdd: `${args.additionalData},`,
              }),
            );
          };
          if (application.buildTool === GRADLE) {
            source.addIntegrationTestPluginAdditionalDevConfiguration = args => {
              const gradleDevProfilePath = path.join(`${application.gradleBuildSrc}`, '..', 'gradle', 'profile_dev.gradle');
              const ignoreNonExisting = this.ignoreNeedlesError && 'gradle dev profile file not found';
              this.editFile(
                gradleDevProfilePath,
                { ignoreNonExisting },
                createNeedleCallback({
                  needle: 'jhipster-needle-gradle-integration-test',
                  contentToAdd: `${args.additionalData},`,
                }),
              );
            };
            source.addIntegrationTestPluginAdditionalProdConfiguration = args => {
              const gradleProdProfilePath = path.join(`${application.gradleBuildSrc}`, '..', 'gradle', 'profile_prod.gradle');
              const ignoreNonExisting = this.ignoreNeedlesError && 'gradle prod profile file not found';
              this.editFile(
                gradleProdProfilePath,
                { ignoreNonExisting },
                createNeedleCallback({
                  needle: 'jhipster-needle-gradle-integration-test',
                  contentToAdd: `${args.additionalData},`,
                }),
              );
            };
          }
        }
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
              { groupId: 'io.cucumber', artifactId: 'cucumber-junit-platform-engine', scope: 'test' },
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
                  additionalContent: `
<executions>
  <execution>
  <!--Work around. Surefire does not use JUnit's Test Engine discovery functionality -->
  <id>prepare cucumber feature files</id>
  <phase>integration-test</phase>
  <goals>
    <goal>run</goal>
  </goals>
  <configuration>
    <target>
        <echo message="Running JUnit Platform CLI"/>
        <java classname="org.junit.platform.console.ConsoleLauncher"
              fork="true"
              failonerror="true"
              newenvironment="true"
              maxmemory="512m"
              classpathref="maven.test.classpath">
            <jvmarg value="-Dspring.profiles.active=testprod"/>${
              application.reactive
                ? `
            <jvmarg value="-XX:+AllowRedefinitionToAddDeleteMethods"/>`
                : ''
            }
            <arg value="--include-engine"/>
            <arg value="cucumber"/>
            <arg value="--scan-classpath"/>
            <arg value="\${project.build.testOutputDirectory}"/>
        </java>
    </target>
  </configuration>
  </execution>
</executions>
`,
                },
                {
                  groupId: 'org.apache.maven.plugins',
                  artifactId: 'maven-failsafe-plugin',
                  additionalContent: fs.readFileSync(path.join(this.templatePath(), '..', 'blocks', 'failsafe-plugin-content.xml'), {
                    encoding: 'utf8',
                  }),
                },
              ],
            },
          },
        );

        if (application.buildToolGradle) {
          source.addGradlePlugin?.({ id: 'jhipster.cucumber-conventions' });
        }
      },
      junitPlatformProperties({ application, source }) {
        if (application.cucumberTests) {
          source.addJunitPlatformPropertyEntry!({
            additionalData: `
              cucumber.publish.enabled=true
              cucumber.plugin=pretty, html:target/cucumber-reports/Cucumber.html`,
          });
          if (application.buildTool === GRADLE) {
            source.addIntegrationTestPluginAdditionalDevConfiguration!({
              additionalData: 'exclude "**/*CucumberIT*"',
            });
            source.addIntegrationTestPluginAdditionalProdConfiguration!({
              additionalData: 'exclude "**/*CucumberIT*"',
            });
          }
        }
      },
    });
  }

  get [JavaApplicationGenerator.POST_WRITING]() {
    return this.delegateTasksToBlueprint(() => this.postWriting);
  }
}
