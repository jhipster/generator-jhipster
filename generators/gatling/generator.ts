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
import { GENERATOR_GATLING, GENERATOR_BOOTSTRAP_APPLICATION } from '../generator-list.js';
import writeTask from './files.js';
import cleanupTask from './cleanup.js';
import writeEntityTask, { cleanupEntitiesTask } from './entity-files.js';

export default class GatlingGenerator extends BaseApplicationGenerator {
  async beforeQueue() {
    if (!this.fromBlueprint) {
      await this.composeWithBlueprints(GENERATOR_GATLING);
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

  get writingEntities() {
    return this.asWritingEntitiesTaskGroup({
      cleanupEntitiesTask,
      writeEntityTask,
    });
  }

  get [BaseApplicationGenerator.WRITING_ENTITIES]() {
    return this.delegateTasksToBlueprint(() => this.writingEntities);
  }

  get postWriting() {
    return this.asPostWritingTaskGroup({
      addDependencies({ application, source }) {
        const { javaDependencies } = application;
        if (application.buildToolMaven) {
          source.addMavenDefinition?.({
            properties: [
              { property: 'gatling.version', value: javaDependencies?.gatling },
              { property: 'gatling-maven-plugin.version', value: javaDependencies?.['gatling-maven-plugin'] },
            ],
            dependencies: [
              // eslint-disable-next-line no-template-curly-in-string
              { groupId: 'io.gatling.highcharts', artifactId: 'gatling-charts-highcharts', version: '${gatling.version}', scope: 'test' },
            ],
            plugins: [{ groupId: 'io.gatling', artifactId: 'gatling-maven-plugin' }],
            pluginManagement: [
              {
                groupId: 'io.gatling',
                artifactId: 'gatling-maven-plugin',
                // eslint-disable-next-line no-template-curly-in-string
                version: '${gatling-maven-plugin.version}',
                additionalContent: `
<configuration>
    <runMultipleSimulations>true</runMultipleSimulations>
    <resourcesFolder>\${project.basedir}/src/test/gatling/conf</resourcesFolder>
</configuration>
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
