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
import { SERVER_MAIN_RES_DIR, SERVER_MAIN_SRC_DIR, SERVER_TEST_SRC_DIR } from '../generator-constants.js';
import { moveToJavaPackageSrcDir, moveToJavaPackageTestDir } from '../java/support/index.ts';
import type { Application as JavaApplication, Entity as JavaEntity } from '../java/types.d.ts';

export const neo4jFiles = asWriteFilesSection<JavaApplication>({
  serverResource: [
    {
      path: `${SERVER_MAIN_SRC_DIR}_package_/`,
      renameTo: moveToJavaPackageSrcDir,
      templates: ['config/DatabaseConfiguration.java_neo4j'],
    },
    {
      condition: generator => generator.generateBuiltInUserEntity && !generator.databaseMigrationLiquibase,
      path: `${SERVER_MAIN_SRC_DIR}_package_/`,
      renameTo: moveToJavaPackageSrcDir,
      templates: ['config/neo4j/Neo4jMigrations.java'],
    },
    {
      condition: generator => generator.generateBuiltInUserEntity && !generator.databaseMigrationLiquibase,
      path: SERVER_MAIN_RES_DIR,
      templates: ['config/neo4j/migrations/user__admin.json', 'config/neo4j/migrations/user__user.json'],
    },
  ],
  serverTestFw: [
    {
      path: `${SERVER_TEST_SRC_DIR}_package_/`,
      renameTo: moveToJavaPackageTestDir,
      templates: [
        'config/Neo4jTestContainer.java',
        'config/Neo4jTestContainersSpringContextCustomizerFactory.java',
        'config/EmbeddedNeo4j.java',
      ],
    },
  ],
});

export default asWritingTask<JavaEntity, JavaApplication>(async function writeFilesTask({ application }) {
  await this.writeFiles({
    sections: neo4jFiles,
    context: application,
  });
});
