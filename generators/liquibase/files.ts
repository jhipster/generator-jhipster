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
import type { WriteFileSection } from '../base-core/api.js';
import { SERVER_MAIN_RES_DIR, SERVER_MAIN_SRC_DIR } from '../generator-constants.js';
import { moveToJavaPackageSrcDir } from '../java/support/index.js';

export const liquibaseFiles: WriteFileSection = {
  liquibase: [
    {
      condition: ctx => ctx.backendTypeSpringBoot,
      path: `${SERVER_MAIN_SRC_DIR}_package_/`,
      renameTo: moveToJavaPackageSrcDir,
      templates: ['config/LiquibaseConfiguration.java'],
    },
  ],
  gradle: [
    {
      condition: ctx => ctx.buildToolGradle,
      templates: ['gradle/liquibase.gradle'],
    },
  ],
  serverResource: [
    {
      path: SERVER_MAIN_RES_DIR,
      templates: [
        {
          override: ctx => !ctx.incrementalChangelog || (ctx as any).recreateInitialChangelog,
          file: data => `config/liquibase/changelog/initial_schema_${data.databaseType}.xml`,
          renameTo: () => 'config/liquibase/changelog/00000000000000_initial_schema.xml',
        },
        {
          override: ctx => !ctx.incrementalChangelog || (ctx as any).recreateInitialChangelog,
          file: 'config/liquibase/master.xml',
        },
      ],
    },
    {
      condition: generator => Boolean(generator.generateUserManagement),
      path: SERVER_MAIN_RES_DIR,
      templates: ['config/liquibase/data/user.csv', 'config/liquibase/data/user_authority.csv'],
    },
    {
      condition: generator => Boolean(generator.generateBuiltInAuthorityEntity),
      path: SERVER_MAIN_RES_DIR,
      templates: ['config/liquibase/data/authority.csv'],
    },
  ],
  graalvm: [
    {
      condition: ctx => ctx.graalvmSupport,
      transform: false,
      path: SERVER_MAIN_RES_DIR,
      templates: ['META-INF/native-image/liquibase/reflect-config.json'],
    },
  ],
};
