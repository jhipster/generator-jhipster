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
import _ from 'lodash';

import BaseApplicationGenerator from '../base-application/index.mjs';
import { GENERATOR_PULSAR, GENERATOR_BOOTSTRAP_APPLICATION_SERVER } from '../generator-list.mjs';
import writePulsarFilesTask from './files.mjs';

export default class PulsarGenerator extends BaseApplicationGenerator {
  async beforeQueue() {
    await this.dependsOnJHipster(GENERATOR_BOOTSTRAP_APPLICATION_SERVER);
    if (!this.fromBlueprint) {
      await this.composeWithBlueprints(GENERATOR_PULSAR);
    }
  }

  get writing() {
    return this.asWritingTaskGroup({
      writePulsarFilesTask,
    });
  }

  get [BaseApplicationGenerator.WRITING]() {
    return this.delegateTasksToBlueprint(() => this.writing);
  }

  get postWriting() {
    return this.asPostWritingTaskGroup({
      customizeApplication({ source, application }) {
        source.addLogbackMainLog?.({ name: 'org.apache.pulsar', level: 'INFO' });
        source.addIntegrationTestAnnotation?.({ package: `${application.packageName}.config`, annotation: 'EmbeddedPulsar' });

        source.addTestSpringFactory?.({
          key: 'org.springframework.test.context.ContextCustomizerFactory',
          value: `${application.packageName}.config.PulsarTestContainersSpringContextCustomizerFactory`,
        });
      },
      applyGradleScript({ source, application }) {
        if (application.buildToolGradle) {
          source.applyFromGradle?.({ script: 'gradle/pulsar.gradle' });
        }
      },
      addDependencies({ application, source }) {
        if (application.buildToolMaven) {
          const { javaDependencies } = application;
          source.addMavenDefinition?.({
            properties: [{ property: 'spring-pulsar.version', value: javaDependencies?.['spring-pulsar'] }],
            dependencies: [
              { groupId: 'org.springframework.cloud', artifactId: 'spring-cloud-stream' },
              {
                groupId: 'org.springframework.pulsar',
                artifactId: 'spring-pulsar-spring-cloud-stream-binder',
                // eslint-disable-next-line no-template-curly-in-string
                version: '${spring-pulsar.version}',
              },
              { groupId: 'org.testcontainers', artifactId: 'junit-jupiter', scope: 'test' },
              { groupId: 'org.testcontainers', artifactId: 'testcontainers', scope: 'test' },
              { groupId: 'org.testcontainers', artifactId: 'pulsar', scope: 'test' },
            ],
          });
        }
      },
    });
  }

  get [BaseApplicationGenerator.POST_WRITING]() {
    return this.asPostWritingTaskGroup(this.delegateTasksToBlueprint(() => this.postWriting));
  }
}
