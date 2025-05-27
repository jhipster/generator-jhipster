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
import BaseApplicationGenerator, {
  type Field as DeprecatedField,
  type Relationship as DeprecatedRelationship,
} from '../base-application/index.js';
import type { JHipsterGeneratorOptions } from '../../lib/types/application/options.js';
import type { Entity as DeprecatedEntity, PrimaryKey as DeprecatedPrimarykey } from '../../lib/types/application/entity.js';
import type { ApplicationType as DeprecatedApplication } from '../../lib/types/application/application.js';
import cleanupTask from './cleanup.js';
import writeTask from './files.js';

export default class CucumberGenerator<
  O extends JHipsterGeneratorOptions = JHipsterGeneratorOptions,
  F extends DeprecatedField = DeprecatedField,
  PK extends DeprecatedPrimarykey<F> = DeprecatedPrimarykey<F>,
  R extends DeprecatedRelationship<any> = DeprecatedRelationship<any>,
  E extends DeprecatedEntity<F, PK, R> = DeprecatedEntity<F, PK, R>,
  A extends DeprecatedApplication = DeprecatedApplication,
> extends BaseApplicationGenerator<O, F, PK, R, E, A> {
  async beforeQueue() {
    if (!this.fromBlueprint) {
      await this.composeWithBlueprints();
    }

    if (!this.delegateToBlueprint) {
      await this.dependsOnJHipster('jhipster:java:build-tool');
    }
  }

  get writing() {
    return this.asWritingTaskGroup({
      cleanupTask,
      writeTask,
    });
  }

  get [BaseApplicationGenerator.WRITING]() {
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

  get [BaseApplicationGenerator.POST_WRITING]() {
    return this.delegateTasksToBlueprint(() => this.postWriting);
  }
}
