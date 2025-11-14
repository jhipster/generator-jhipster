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
import { asWriteEntityFilesSection, asWritingEntitiesTask } from '../base-application/support/task-type-inference.ts';
import { TEST_DIR } from '../generator-constants.ts';

export const gatlingFiles = asWriteEntityFilesSection({
  gatlingFiles: [
    {
      path: TEST_DIR,
      templates: [
        {
          file: 'java/gatling/simulations/_entityClass_GatlingTest.java',
          renameTo: generator => `java/gatling/simulations/${generator.entityClass}GatlingTest.java`,
        },
      ],
    },
  ],
});

export function cleanupEntitiesTask() {}

export default asWritingEntitiesTask(async function writeEntitiesTask({ application, entities }) {
  for (const entity of entities.filter(entity => !entity.builtIn && !entity.skipServer)) {
    await this.writeFiles({
      sections: gatlingFiles,
      context: { ...application, ...entity },
    });
  }
});
