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
import { mergeSections, addSectionsCondition } from '../base/support/index.mjs';
import { moveToJavaPackageSrcDir, moveToJavaPackageTestDir } from '../server/support/index.mjs';
import { SERVER_MAIN_SRC_DIR, SERVER_MAIN_RES_DIR, SERVER_TEST_SRC_DIR, SERVER_TEST_RES_DIR } from '../generator-constants.mjs';

export const sqlFiles = {
  serverFiles: [
    {
      path: `${SERVER_MAIN_SRC_DIR}package/`,
      renameTo: moveToJavaPackageSrcDir,
      templates: ['config/DatabaseConfiguration.java'],
    },
  ],
  reactiveJavaUserManagement: [
    {
      condition: generator => generator.reactive && generator.generateBuiltInUserEntity,
      path: `${SERVER_MAIN_SRC_DIR}package/`,
      renameTo: moveToJavaPackageSrcDir,
      templates: ['repository/UserSqlHelper_reactive.java', 'repository/rowmapper/UserRowMapper_reactive.java'],
    },
  ],
  reactiveCommon: [
    {
      condition: generator => generator.reactive,
      path: `${SERVER_MAIN_SRC_DIR}package/`,
      renameTo: moveToJavaPackageSrcDir,
      templates: ['repository/rowmapper/ColumnConverter_reactive.java', 'repository/EntityManager_reactive.java'],
    },
  ],
  hibernate: [
    {
      condition: generator => !generator.reactive,
      path: `${SERVER_TEST_SRC_DIR}package/`,
      renameTo: moveToJavaPackageTestDir,
      templates: [
        'config/timezone/HibernateTimeZoneIT.java',
        'repository/timezone/DateTimeWrapper.java',
        'repository/timezone/DateTimeWrapperRepository.java',
      ],
    },
  ],
  testContainers: [
    {
      path: `${SERVER_TEST_SRC_DIR}package/`,
      renameTo: moveToJavaPackageTestDir,
      templates: ['config/EmbeddedSQL.java', 'config/SqlTestContainer.java', 'config/SqlTestContainersSpringContextCustomizerFactory.java'],
    },
    {
      path: SERVER_TEST_RES_DIR,
      templates: ['config/application-testdev.yml'],
    },
    {
      condition: generator => !generator.reactive,
      path: SERVER_TEST_RES_DIR,
      templates: ['config/application-testprod.yml'],
    },
  ],
};

export const h2Files = {
  serverResource: [
    {
      path: SERVER_MAIN_RES_DIR,
      templates: ['.h2.server.properties'],
    },
  ],
};

export const mysqlFiles = {
  serverTestSources: [
    {
      path: `${SERVER_TEST_SRC_DIR}package/`,
      renameTo: moveToJavaPackageTestDir,
      templates: ['config/MysqlTestContainer.java'],
    },
  ],
};

export const mariadbFiles = {
  serverTestSources: [
    {
      path: `${SERVER_TEST_SRC_DIR}package/`,
      renameTo: moveToJavaPackageTestDir,
      templates: ['config/MariadbTestContainer.java'],
    },
  ],
};

export const mssqlFiles = {
  serverTestSources: [
    {
      path: `${SERVER_TEST_SRC_DIR}package/`,
      renameTo: moveToJavaPackageTestDir,
      templates: ['config/MsSqlTestContainer.java'],
    },
  ],
};

export const postgresFiles = {
  serverTestSources: [
    {
      path: `${SERVER_TEST_SRC_DIR}package/`,
      renameTo: moveToJavaPackageTestDir,
      templates: ['config/PostgreSqlTestContainer.java'],
    },
  ],
};

export const serverFiles = mergeSections(
  sqlFiles,
  addSectionsCondition(h2Files, context => context.devDatabaseTypeH2Any),
  addSectionsCondition(mysqlFiles, context => context.devDatabaseTypeMysql || context.prodDatabaseTypeMysql),
  addSectionsCondition(mariadbFiles, context => context.devDatabaseTypeMariadb || context.prodDatabaseTypeMariadb),
  addSectionsCondition(mssqlFiles, context => context.devDatabaseTypeMssql || context.prodDatabaseTypeMssql),
  addSectionsCondition(postgresFiles, context => context.devDatabaseTypePostgres || context.prodDatabaseTypePostgres)
);

export default async function writeSqlFiles({ application }) {
  await this.writeFiles({
    sections: serverFiles,
    context: application,
  });
}
