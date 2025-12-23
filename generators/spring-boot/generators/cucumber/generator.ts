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
import { SERVER_TEST_RES_DIR, SERVER_TEST_SRC_DIR } from '../../../generator-constants.ts';
import { JavaApplicationGenerator } from '../../../java/generator.ts';
import { moveToJavaPackageTestDir } from '../../../java/support/files.ts';

export default class CucumberGenerator extends JavaApplicationGenerator {
  async beforeQueue() {
    if (!this.fromBlueprint) {
      await this.composeWithBlueprints();
    }

    if (!this.delegateToBlueprint) {
      await this.dependsOnJHipster('jhipster:java-simple-application:build-tool');
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
      async cleanupTask({ application, control }) {
        await control.cleanupFiles({
          '7.4.2': [
            `${application.javaPackageTestDir}cucumber.properties`,
            `${application.srcTestJava}features/gitkeep`,
            `${application.srcTestJava}features/user/user.feature`,
          ],
          '9.0.0-alpha.0': [
            `${application.javaPackageTestDir}cucumber/CucumberIT.java`,
            `${application.srcTestResources}${application.packageFolder}cucumber/gitkeep`,
            [application.buildToolGradle, `${application.gradleBuildSrc}src/main/groovy/jhipster.cucumber-conventions.gradle`],
          ],
        });
      },
      async writeFiles({ application }) {
        await this.writeFiles<typeof application>({
          sections: {
            cucumberFiles: [
              {
                path: `${SERVER_TEST_SRC_DIR}_package_/`,
                renameTo: moveToJavaPackageTestDir,
                templates: [
                  // Create Cucumber test files
                  'cucumber/CucumberTest.java',
                  'cucumber/stepdefs/BasicStepDefs.java',
                  'cucumber/stepdefs/StepDefs.java',
                  'cucumber/CucumberTestContextConfiguration.java',
                ],
              },
              {
                path: `${SERVER_TEST_RES_DIR}_package_/`,
                renameTo: (data, filename) => `${data.srcTestResources}${data.packageFolder}${filename}`,
                templates: ['cucumber/basic.feature'],
              },
            ],
            authenticate: [
              {
                condition: data => data.authenticationTypeJwt || data.generateAuthenticationApi,
                path: `${SERVER_TEST_SRC_DIR}_package_/`,
                renameTo: moveToJavaPackageTestDir,
                templates: ['cucumber/stepdefs/AuthenticateStepDefs.java'],
              },
              {
                condition: data => data.authenticationTypeJwt || data.generateAuthenticationApi,
                path: `${SERVER_TEST_RES_DIR}_package_/`,
                renameTo: (data, filename) => `${data.srcTestResources}${data.packageFolder}${filename}`,
                templates: ['cucumber/authenticate.feature'],
              },
            ],
            user: [
              {
                condition: data => data.generateUserManagement,
                path: `${SERVER_TEST_SRC_DIR}_package_/`,
                renameTo: moveToJavaPackageTestDir,
                templates: ['cucumber/stepdefs/UserStepDefs.java'],
              },
              {
                condition: data => data.generateUserManagement,
                path: `${SERVER_TEST_RES_DIR}_package_/`,
                renameTo: (data, filename) => `${data.srcTestResources}${data.packageFolder}${filename}`,
                templates: ['cucumber/user.feature'],
              },
            ],
          },
          context: application,
        });
      },
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
      addDependencies({ application, source }) {
        const { javaDependencies } = application;
        source.addJavaDefinitions?.({
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
            { groupId: 'org.junit.platform', artifactId: 'junit-platform-suite', scope: 'test' },
          ],
        });
      },
    });
  }

  get [JavaApplicationGenerator.POST_WRITING]() {
    return this.delegateTasksToBlueprint(() => this.postWriting);
  }
}
