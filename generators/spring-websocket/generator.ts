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
import { JavaApplicationGenerator } from '../java/generator.ts';

import cleanupTask from './cleanup.ts';
import writeTask from './files.ts';

export default class SpringWebsocketGenerator extends JavaApplicationGenerator {
  async beforeQueue() {
    if (!this.fromBlueprint) {
      await this.composeWithBlueprints();
    }

    if (!this.delegateToBlueprint) {
      await this.dependsOnBootstrap('java');
    }
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
      addDependencies({ source }) {
        source.addJavaDependencies?.([
          { groupId: 'org.springframework.boot', artifactId: 'spring-boot-starter-websocket' },
          { groupId: 'org.springframework.security', artifactId: 'spring-security-messaging' },
        ]);
      },
    });
  }

  get [JavaApplicationGenerator.POST_WRITING]() {
    return this.delegateTasksToBlueprint(() => this.postWriting);
  }
}
