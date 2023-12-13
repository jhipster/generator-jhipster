/**
 * Copyright 2013-2023 the original author or authors from the JHipster project.
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
import BaseApplicationGenerator from '../base-application/index.js';
import { GENERATOR_CUCUMBER, GENERATOR_BOOTSTRAP_APPLICATION } from '../generator-list.js';
import writeTask from './files.js';
import cleanupTask from './cleanup.js';

export default class CucumberGenerator extends BaseApplicationGenerator {
  async beforeQueue() {
    if (!this.fromBlueprint) {
      await this.composeWithBlueprints(GENERATOR_CUCUMBER);
    }

    if (!this.delegateToBlueprint) {
      await this.dependsOnJHipster(GENERATOR_BOOTSTRAP_APPLICATION);
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
        if (application.buildToolMaven) {
          source.addMavenDefinition?.({
            dependencies: [
              { groupId: 'io.cucumber', artifactId: 'cucumber-junit-platform-engine', scope: 'test' },
              { groupId: 'io.cucumber', artifactId: 'cucumber-java', scope: 'test' },
              { groupId: 'io.cucumber', artifactId: 'cucumber-spring', scope: 'test' },
              { groupId: 'org.junit.platform', artifactId: 'junit-platform-console', scope: 'test' },
              { groupId: 'org.testng', artifactId: 'testng', scope: 'test' },
            ],
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
          });
        }
      },
    });
  }

  get [BaseApplicationGenerator.POST_WRITING]() {
    return this.delegateTasksToBlueprint(() => this.postWriting);
  }
}
