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
import { asWriteFilesSection, asWritingTask } from '../base-application/support/task-type-inference.js';
import { SERVER_MAIN_RES_DIR, SERVER_MAIN_SRC_DIR, SERVER_TEST_SRC_DIR } from '../generator-constants.js';
import { moveToJavaPackageSrcDir, moveToJavaPackageTestDir } from '../java/support/index.js';
import type { Application as JavaApplication } from '../java/types.js';

export const cassandraFiles = asWriteFilesSection<JavaApplication>({
  serverFiles: [
    {
      path: `${SERVER_MAIN_SRC_DIR}_package_/`,
      renameTo: moveToJavaPackageSrcDir,
      templates: ['config/DatabaseConfiguration.java'],
    },
  ],
  serverResource: [
    {
      path: SERVER_MAIN_RES_DIR,
      templates: [
        'config/cql/create-keyspace-prod.cql',
        'config/cql/create-keyspace.cql',
        'config/cql/drop-keyspace.cql',
        'config/cql/changelog/README.md',
      ],
    },
    {
      condition: ctx => !ctx.applicationTypeMicroservice && ctx.generateBuiltInUserEntity,
      path: SERVER_MAIN_RES_DIR,
      templates: [
        { file: 'config/cql/changelog/create-tables.cql', renameTo: () => 'config/cql/changelog/00000000000000_create-tables.cql' },
        {
          file: 'config/cql/changelog/insert_default_users.cql',
          renameTo: () => 'config/cql/changelog/00000000000001_insert_default_users.cql',
        },
      ],
    },
  ],
  serverTestFw: [
    {
      path: `${SERVER_TEST_SRC_DIR}_package_/`,
      renameTo: moveToJavaPackageTestDir,
      templates: [
        'CassandraKeyspaceIT.java',
        'config/CassandraTestContainer.java',
        'config/CassandraTestContainersSpringContextCustomizerFactory.java',
        'config/EmbeddedCassandra.java',
      ],
    },
  ],
});

export default asWritingTask(async function writeCassandraFilesTask({ application }) {
  await this.writeFiles({
    sections: cassandraFiles,
    context: application,
  });
});
