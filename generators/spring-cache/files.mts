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
import Generator from './generator.mjs';
import { moveToJavaPackageSrcDir, moveToJavaPackageTestDir } from '../java/support/index.mjs';
import { SERVER_MAIN_SRC_DIR, SERVER_TEST_SRC_DIR } from '../generator-constants.mjs';
import { WriteFileSection } from '../base/api.mjs';

const files: WriteFileSection<Generator, any> = {
  cacheFiles: [
    {
      condition: data => data.buildToolGradle,
      templates: ['gradle/cache.gradle'],
    },
    {
      path: `${SERVER_MAIN_SRC_DIR}package/`,
      renameTo: moveToJavaPackageSrcDir,
      templates: ['config/CacheConfiguration.java'],
    },
    {
      condition: data => data.cacheProviderInfinispan,
      path: `${SERVER_MAIN_SRC_DIR}package/`,
      renameTo: moveToJavaPackageSrcDir,
      templates: ['config/CacheFactoryConfiguration.java'],
    },
    {
      condition: data => data.cacheProviderRedis,
      path: `${SERVER_TEST_SRC_DIR}package/`,
      renameTo: moveToJavaPackageTestDir,
      templates: [
        'config/EmbeddedRedis.java',
        'config/RedisTestContainer.java',
        'config/RedisTestContainersSpringContextCustomizerFactory.java',
      ],
    },
  ],
};

export default async function writeTask(this: Generator, { application }) {
  await this.writeFiles({
    sections: files,
    context: application,
  });
}
