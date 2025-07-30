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

import { SpringBootApplicationGenerator } from '../../../spring-boot/generator.ts';
import cleanupKafkaFilesTask from './cleanup.js';
import { kafkaFiles } from './files.js';

export default class KafkaGenerator extends SpringBootApplicationGenerator {
  async beforeQueue() {
    if (!this.fromBlueprint) {
      await this.composeWithBlueprints();
    }

    if (!this.delegateToBlueprint) {
      await this.dependsOnJHipster('jhipster:java:bootstrap');
    }
  }

  get writing() {
    return this.asWritingTaskGroup({
      cleanupKafkaFilesTask,
      async writing({ application }) {
        await this.writeFiles({
          sections: kafkaFiles,
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
      customizeApplicationForKafka({ source, application }) {
        source.addMainLog?.({ name: 'org.apache.kafka', level: 'INFO' });
        source.addTestLog?.({ name: 'kafka', level: 'WARN' });
        source.addTestLog?.({ name: 'org.I0Itec', level: 'WARN' });
        source.addIntegrationTestAnnotation?.({ package: `${application.packageName}.config`, annotation: 'EmbeddedKafka' });

        source.addTestSpringFactory?.({
          key: 'org.springframework.test.context.ContextCustomizerFactory',
          value: `${application.packageName}.config.KafkaTestContainersSpringContextCustomizerFactory`,
        });
      },
      applyKafkaGradleConventionPlugin({ source, application }) {
        if (application.buildToolGradle) {
          source.addGradlePlugin?.({ id: 'jhipster.kafka-conventions' });
        }
      },
      addKafkaMavenDependencies({ application, source }) {
        source.addJavaDefinition?.({
          versions: [{ name: 'spring-kafka', version: '3.3.6' }],
        });
        if (application.buildToolMaven) {
          source.addMavenDependency?.([
            {
              groupId: 'org.springframework.cloud',
              artifactId: 'spring-cloud-stream',
            },
            {
              groupId: 'org.springframework.cloud',
              artifactId: 'spring-cloud-starter-stream-kafka',
            },
            {
              groupId: 'org.springframework.cloud',
              artifactId: 'spring-cloud-stream-test-binder',
              scope: 'test',
            },
            {
              groupId: 'org.testcontainers',
              artifactId: 'junit-jupiter',
              scope: 'test',
            },
            {
              groupId: 'org.testcontainers',
              artifactId: 'testcontainers',
              scope: 'test',
            },
            {
              groupId: 'org.testcontainers',
              artifactId: 'kafka',
              scope: 'test',
            },
          ]);
        }
      },
      addLog({ source }) {
        source.addMainLog!({ name: 'org.apache.kafka', level: 'WARN' });
      },
    });
  }

  get [SpringBootApplicationGenerator.POST_WRITING]() {
    return this.delegateTasksToBlueprint(() => this.postWriting);
  }
}
