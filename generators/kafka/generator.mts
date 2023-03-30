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
import { GENERATOR_KAFKA, GENERATOR_BOOTSTRAP_APPLICATION_SERVER } from '../generator-list.mjs';
import { GeneratorDefinition } from '../server/index.mjs';
import cleanupKafkaFilesTask from './cleanup.mjs';
import writeKafkaFilesTask from './files.mjs';

export default class KafkaGenerator extends BaseApplicationGenerator<GeneratorDefinition> {
  async beforeQueue() {
    await this.dependsOnJHipster(GENERATOR_BOOTSTRAP_APPLICATION_SERVER);
    if (!this.fromBlueprint) {
      await this.composeWithBlueprints(GENERATOR_KAFKA);
    }
  }

  get writing() {
    return this.asWritingTaskGroup({
      cleanupKafkaFilesTask,
      writeKafkaFilesTask,
    });
  }

  get [BaseApplicationGenerator.WRITING]() {
    return this.delegateTasksToBlueprint(() => this.writing);
  }

  get postWriting() {
    return this.asPostWritingTaskGroup({
      customizeApplication({ source, application }) {
        source.addLogbackMainLog?.({ name: 'org.apache.kafka', level: 'INFO' });
        source.addLogbackTestLog?.({ name: 'kafka', level: 'WARN' });
        source.addLogbackTestLog?.({ name: 'org.I0Itec', level: 'WARN' });
        source.addIntegrationTestAnnotation?.({ package: `${application.packageName}.config`, annotation: 'EmbeddedKafka' });

        source.addTestSpringFactory?.({
          key: 'org.springframework.test.context.ContextCustomizerFactory',
          value: `${application.packageName}.config.KafkaTestContainersSpringContextCustomizerFactory`,
        });
      },
      applyGradleScript({ source, application }) {
        if (application.buildToolGradle) {
          source.applyFromGradle?.({ script: 'gradle/kafka.gradle' });
        }
      },
    });
  }

  get [BaseApplicationGenerator.POST_WRITING]() {
    return this.delegateTasksToBlueprint(() => this.postWriting);
  }
}
