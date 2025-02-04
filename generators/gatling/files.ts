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
import { GRADLE_BUILD_SRC_MAIN_DIR, TEST_DIR } from '../generator-constants.js';
import type { WriteFileSection } from '../base/api.js';
import type Generator from './generator.js';

const gatlingFiles: WriteFileSection = {
  gatlingFiles: [
    {
      templates: ['README.md.jhi.gatling'],
    },
    {
      condition: generator => generator.buildToolGradle,
      path: GRADLE_BUILD_SRC_MAIN_DIR,
      templates: ['jhipster.gatling-conventions.gradle'],
    },
    {
      path: TEST_DIR,
      templates: [
        // Create Gatling test files
        'gatling/conf/gatling.conf',
        'gatling/conf/logback.xml',
      ],
    },
  ],
};

export default async function writeTask(this: Generator, { application }) {
  await this.writeFiles({
    sections: gatlingFiles,
    context: application,
  });
}
