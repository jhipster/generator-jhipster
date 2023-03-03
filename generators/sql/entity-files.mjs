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
import { SERVER_MAIN_SRC_DIR, SERVER_MAIN_RES_DIR } from '../generator-constants.mjs';
import { moveToJavaEntityPackageSrcDir } from '../server/support/index.mjs';

const sqlFiles = {
  sqlFiles: [
    {
      condition: generator => generator.databaseTypeSql && !generator.reactive,
      path: `${SERVER_MAIN_SRC_DIR}package/`,
      renameTo: moveToJavaEntityPackageSrcDir,
      templates: ['domain/_PersistClass_.java.jhi.jakarta_persistence'],
    },
    {
      condition: generator => generator.databaseTypeSql && !generator.reactive && generator.requiresPersistableImplementation,
      path: `${SERVER_MAIN_SRC_DIR}package/`,
      renameTo: moveToJavaEntityPackageSrcDir,
      templates: ['domain/_PersistClass_.java.jhi.jakarta_lifecycle_events'],
    },
    {
      condition: generator => generator.databaseTypeSql && !generator.reactive && generator.enableHibernateCache,
      path: `${SERVER_MAIN_SRC_DIR}package/`,
      renameTo: moveToJavaEntityPackageSrcDir,
      templates: ['domain/_PersistClass_.java.jhi.hibernate_cache'],
    },
    {
      condition: generator => generator.databaseTypeSql && !generator.reactive && !generator.embedded && generator.containsBagRelationships,
      path: `${SERVER_MAIN_SRC_DIR}package/`,
      renameTo: moveToJavaEntityPackageSrcDir,
      templates: [
        'repository/_EntityClass_RepositoryWithBagRelationships.java',
        'repository/_EntityClass_RepositoryWithBagRelationshipsImpl.java',
      ],
    },
    {
      condition: generator => generator.databaseTypeSql && generator.reactive,
      path: `${SERVER_MAIN_SRC_DIR}package/`,
      renameTo: moveToJavaEntityPackageSrcDir,
      templates: ['domain/_PersistClass_.java.jhi.spring_data_reactive'],
    },
    {
      condition: generator => generator.databaseTypeSql && generator.requiresPersistableImplementation,
      path: `${SERVER_MAIN_SRC_DIR}package/`,
      renameTo: moveToJavaEntityPackageSrcDir,
      templates: ['domain/_PersistClass_.java.jhi.spring_data_persistable'],
    },
    {
      condition: generator => generator.databaseTypeSql && generator.reactive && generator.requiresPersistableImplementation,
      path: `${SERVER_MAIN_SRC_DIR}package/`,
      renameTo: moveToJavaEntityPackageSrcDir,
      templates: ['domain/_PersistClass_Callback.java'],
    },
  ],
};

export function cleanupEntitiesTask({ application, entities }) {}

export default async function writeEntitiesTask({ application, entities }) {
  for (const entity of entities.filter(entity => !entity.builtIn && !entity.skipServer)) {
    await this.writeFiles({
      sections: sqlFiles,
      context: { ...application, ...entity },
    });
  }
}
