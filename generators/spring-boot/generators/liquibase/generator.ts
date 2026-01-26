/**
 * Copyright 2013-2026 the original author or authors from the JHipster project.
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
import { SERVER_MAIN_SRC_DIR } from '../../../generator-constants.ts';
import { moveToJavaPackageSrcDir } from '../../../java/support/files.ts';
import { SpringBootApplicationGenerator } from '../../generator.ts';

export default class SpringBootLiquibaseGenerator extends SpringBootApplicationGenerator {
  async beforeQueue() {
    if (!this.fromBlueprint) {
      await this.composeWithBlueprints();
    }

    if (!this.delegateToBlueprint) {
      await this.dependsOnBootstrap('spring-boot');
      await this.dependsOnJHipster('liquibase');
    }
  }

  get writing() {
    return this.asWritingTaskGroup({
      async writeFiles({ application }) {
        await this.writeFiles({
          blocks: [
            {
              path: `${SERVER_MAIN_SRC_DIR}_package_/`,
              renameTo: moveToJavaPackageSrcDir,
              templates: ['config/LiquibaseConfiguration.java'],
            },
          ],
          context: application,
        });
      },
    });
  }

  get [SpringBootApplicationGenerator.WRITING]() {
    return this.delegateTasksToBlueprint(() => this.writing);
  }

  get postWriting() {
    return this.asPostWritingTaskGroup({
      customizeApplicationProperties({ source, application }) {
        if (application.databaseTypeSql && !application.reactive) {
          source.addApplicationPropertiesClass?.({
            propertyType: 'Liquibase',
            classStructure: { asyncStart: ['Boolean', 'true'] },
          });
        }
      },

      addDependencies({ application, source }) {
        if (application.springBoot4 && application.backendTypeSpringBoot) {
          source.addJavaDependencies?.([
            {
              groupId: 'org.springframework.boot',
              artifactId: 'spring-boot-starter-liquibase',
              exclusions: application.databaseTypeNeo4j
                ? [{ groupId: 'org.springframework.boot', artifactId: 'spring-boot-starter-jdbc' }]
                : undefined,
            },
          ]);
        }
        if (application.databaseTypeNeo4j) {
          if (!application.springBoot4) {
            source.addMavenDependency?.([{ groupId: 'org.springframework', artifactId: 'spring-jdbc' }]);
          }
        }
      },

      nativeHints({ source, application }) {
        if (!application.graalvmSupport) return;
        source.addNativeHint!({ resources: ['config/liquibase/**'] });
      },
    });
  }

  get [SpringBootApplicationGenerator.POST_WRITING]() {
    return this.delegateTasksToBlueprint(() => this.postWriting);
  }
}
