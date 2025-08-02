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
import { asWriteFilesSection, asWritingTask } from '../base-application/support/task-type-inference.ts';
import { GRADLE_BUILD_SRC_MAIN_DIR, SERVER_MAIN_SRC_DIR, SERVER_TEST_SRC_DIR } from '../generator-constants.js';
import { moveToJavaPackageSrcDir, moveToJavaPackageTestDir } from '../java/support/index.ts';

const files = asWriteFilesSection({
  cacheFiles: [
    {
      condition: data => data.buildToolGradle,
      templates: [`${GRADLE_BUILD_SRC_MAIN_DIR}/jhipster.spring-cache-conventions.gradle`],
    },
    {
      path: `${SERVER_MAIN_SRC_DIR}_package_/`,
      renameTo: moveToJavaPackageSrcDir,
      templates: ['config/CacheConfiguration.java'],
    },
    {
      condition: data => data.cacheProviderRedis,
      path: `${SERVER_TEST_SRC_DIR}_package_/`,
      renameTo: moveToJavaPackageTestDir,
      templates: [
        'config/EmbeddedRedis.java',
        'config/RedisTestContainer.java',
        'config/RedisTestContainersSpringContextCustomizerFactory.java',
      ],
    },
  ],
});

export default asWritingTask(async function writeTask({ application }) {
  await this.writeFiles({
    sections: files,
    context: application,
  });
});
