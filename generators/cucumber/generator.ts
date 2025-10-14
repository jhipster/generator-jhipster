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
import { gt } from 'semver';

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
          { key: 'cucumber.publish.enabled', value: 'false' },
          { key: 'cucumber.plugin', value: `pretty, html:${application.temporaryDir}cucumber-reports/Cucumber.html` },
        ]);
      },
      upgradeJunitJupiter({ application, source }) {
        // https://github.com/cucumber/cucumber-jvm/issues/3071#issuecomment-3281811324, SpringBoot depends on 5.12.2
        const springBootJunitJupiterVersion = application.javaManagedProperties?.['junit-jupiter.version'];
        const junitJupiterVersion = '5.13.3';
        if (springBootJunitJupiterVersion && gt(springBootJunitJupiterVersion, junitJupiterVersion)) {
          throw new Error(
            `Spring Boot provides junit-jupiter.version=${application.javaManagedProperties!['junit-jupiter.version']}, which is compatible with Cucumber. Custom version can be dropped.`,
          );
        }
        source.addJavaProperty?.({ property: 'junit-jupiter.version', value: junitJupiterVersion });
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
              { groupId: 'io.cucumber', artifactId: 'cucumber-junit-platform-engine', scope: 'test' },
              { groupId: 'io.cucumber', artifactId: 'cucumber-java', scope: 'test' },
              { groupId: 'io.cucumber', artifactId: 'cucumber-spring', scope: 'test' },
              { groupId: 'org.junit.platform', artifactId: 'junit-platform-console', scope: 'test' },
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
              ],
            },
          },
        );

        if (application.buildToolGradle) {
          source.addGradlePlugin?.({ id: 'jhipster.cucumber-conventions' });
        }
      },
    });
  }

  get [JavaApplicationGenerator.POST_WRITING]() {
    return this.delegateTasksToBlueprint(() => this.postWriting);
  }
}
