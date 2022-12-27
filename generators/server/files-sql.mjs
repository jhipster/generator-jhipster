/**
 * Copyright 2013-2022 the original author or authors from the JHipster project.
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
import { mergeSections, addSectionsCondition } from './utils.mjs';
import { SERVER_MAIN_SRC_DIR, SERVER_MAIN_RES_DIR, SERVER_TEST_SRC_DIR, SERVER_TEST_RES_DIR } from '../generator-constants.mjs';

export const sqlFiles = {
  reactiveJavaUserManagement: [
    {
      condition: generator => generator.reactive && generator.generateBuiltInUserEntity,
      path: SERVER_MAIN_SRC_DIR,
      templates: [
        {
          file: 'package/repository/UserSqlHelper.java',
          renameTo: generator => `${generator.javaDir}repository/UserSqlHelper.java`,
        },
      ],
    },
    {
      condition: generator => generator.reactive && generator.generateBuiltInUserEntity,
      path: SERVER_MAIN_SRC_DIR,
      templates: [
        {
          file: 'package/repository/rowmapper/UserRowMapper.java',
          renameTo: generator => `${generator.javaDir}repository/rowmapper/UserRowMapper.java`,
        },
      ],
    },
  ],
  reactiveCommon: [
    {
      condition: generator => generator.reactive,
      path: SERVER_MAIN_SRC_DIR,
      templates: [
        {
          file: 'package/repository/rowmapper/ColumnConverter.java',
          renameTo: generator => `${generator.javaDir}repository/rowmapper/ColumnConverter.java`,
        },
        {
          file: 'package/repository/EntityManager.java',
          renameTo: generator => `${generator.javaDir}repository/EntityManager.java`,
        },
      ],
    },
  ],
  hibernate: [
    {
      condition: generator => !generator.reactive,
      path: SERVER_TEST_SRC_DIR,
      templates: [
        {
          file: 'package/config/timezone/HibernateTimeZoneIT.java',
          renameTo: generator => `${generator.testDir}config/timezone/HibernateTimeZoneIT.java`,
        },
        {
          file: 'package/repository/timezone/DateTimeWrapper.java',
          renameTo: generator => `${generator.testDir}repository/timezone/DateTimeWrapper.java`,
        },
        {
          file: 'package/repository/timezone/DateTimeWrapperRepository.java',
          renameTo: generator => `${generator.testDir}repository/timezone/DateTimeWrapperRepository.java`,
        },
      ],
    },
  ],
  testContainers: [
    {
      path: SERVER_TEST_SRC_DIR,
      templates: [
        {
          file: 'package/config/EmbeddedSQL.java',
          renameTo: generator => `${generator.testDir}config/EmbeddedSQL.java`,
        },
        {
          file: 'package/config/SqlTestContainer.java',
          renameTo: generator => `${generator.testDir}config/SqlTestContainer.java`,
        },
      ],
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
      templates: [{ file: 'h2.server.properties', renameTo: () => '.h2.server.properties' }],
    },
  ],
};

export const mysqlFiles = {
  serverTestSources: [
    {
      path: SERVER_TEST_SRC_DIR,
      templates: [
        {
          file: 'package/config/MysqlTestContainer.java',
          renameTo: generator => `${generator.testDir}config/MysqlTestContainer.java`,
        },
      ],
    },
  ],
};

export const mariadbFiles = {
  serverTestSources: [
    {
      path: SERVER_TEST_SRC_DIR,
      templates: [
        {
          file: 'package/config/MariadbTestContainer.java',
          renameTo: generator => `${generator.testDir}config/MariadbTestContainer.java`,
        },
      ],
    },
    {
      path: SERVER_TEST_RES_DIR,
      templates: [{ file: 'testcontainers/mariadb/my.cnf', noEjs: true }],
    },
  ],
};

export const mssqlFiles = {
  serverTestSources: [
    {
      path: SERVER_TEST_SRC_DIR,
      templates: [
        {
          file: 'package/config/MsSqlTestContainer.java',
          renameTo: generator => `${generator.testDir}config/MsSqlTestContainer.java`,
        },
      ],
    },
  ],
};

export const postgresFiles = {
  serverTestSources: [
    {
      path: SERVER_TEST_SRC_DIR,
      templates: [
        {
          file: 'package/config/PostgreSqlTestContainer.java',
          renameTo: generator => `${generator.testDir}config/PostgreSqlTestContainer.java`,
        },
      ],
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

/**
 * @this {import('./index.mjs')}
 */
export function writeSqlFiles() {
  return this.asWritingTaskGroup({
    async writeSqlFiles({ application }) {
      if (!application.databaseTypeSql) return;

      await this.writeFiles({
        sections: serverFiles,
        rootTemplatesPath: ['sql/reactive', 'sql/common'],
        context: application,
      });
    },
  });
}
