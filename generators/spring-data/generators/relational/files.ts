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
import { asWriteFilesSection, asWritingTask } from '../../../base-application/support/index.ts';
import { addSectionsCondition, mergeSections } from '../../../base-core/support/index.ts';
import {
  javaMainPackageTemplatesBlock,
  javaMainResourceTemplatesBlock,
  javaTestPackageTemplatesBlock,
  javaTestResourceTemplatesBlock,
} from '../../../java/support/index.ts';

import type { Application, Entity } from './types.ts';

export const sqlFiles = asWriteFilesSection<Application>({
  serverFiles: [
    {
      ...javaMainPackageTemplatesBlock(),
      templates: ['config/DatabaseConfiguration.java'],
    },
  ],
  reactiveJavaUserManagement: [
    {
      condition: generator => generator.reactive && generator.generateBuiltInUserEntity,
      ...javaMainPackageTemplatesBlock(),
      templates: ['repository/UserSqlHelper_reactive.java', 'repository/rowmapper/UserRowMapper_reactive.java'],
    },
  ],
  reactiveCommon: [
    {
      condition: generator => generator.reactive,
      ...javaMainPackageTemplatesBlock(),
      templates: ['repository/rowmapper/ColumnConverter_reactive.java', 'repository/EntityManager_reactive.java'],
    },
  ],
  hibernate: [
    {
      condition: generator => !generator.reactive,
      ...javaTestPackageTemplatesBlock(),
      templates: [
        'config/timezone/HibernateTimeZoneIT.java',
        'repository/timezone/DateTimeWrapper.java',
        'repository/timezone/DateTimeWrapperRepository.java',
      ],
    },
  ],
  testContainers: [
    {
      ...javaTestPackageTemplatesBlock(),
      templates: ['config/EmbeddedSQL.java', 'config/SqlTestContainer.java', 'config/SqlTestContainersSpringContextCustomizerFactory.java'],
    },
    {
      ...javaTestResourceTemplatesBlock(),
      templates: ['config/application-testdev.yml'],
    },
    {
      condition: generator => !generator.reactive,
      ...javaTestResourceTemplatesBlock(),
      templates: ['config/application-testprod.yml'],
    },
  ],
  graalvm: [
    javaMainPackageTemplatesBlock({
      condition: ctx => !ctx.reactive && ctx.graalvmSupport,
      templates: ['config/JacksonNativeConfiguration.java'],
    }),
  ],
});

export const h2Files = asWriteFilesSection<Application>({
  serverResource: [
    {
      ...javaMainResourceTemplatesBlock(),
      templates: ['.h2.server.properties'],
    },
  ],
});

export const mysqlFiles = asWriteFilesSection<Application>({
  serverTestSources: [
    {
      ...javaTestPackageTemplatesBlock(),
      templates: ['config/MysqlTestContainer.java'],
    },
    {
      ...javaTestResourceTemplatesBlock(),
      templates: ['conf/mysql/my.cnf'],
    },
  ],
});

export const mariadbFiles = asWriteFilesSection<Application>({
  serverTestSources: [
    {
      ...javaTestPackageTemplatesBlock(),
      templates: ['config/MariadbTestContainer.java'],
    },
  ],
});

export const mssqlFiles = asWriteFilesSection<Application>({
  serverTestSources: [
    {
      ...javaTestPackageTemplatesBlock(),
      templates: ['config/MsSqlTestContainer.java'],
    },
  ],
});

export const postgresFiles = asWriteFilesSection<Application>({
  serverTestSources: [
    {
      ...javaTestPackageTemplatesBlock(),
      templates: ['config/PostgreSqlTestContainer.java'],
    },
  ],
});

export const serverFiles = mergeSections(
  sqlFiles,
  addSectionsCondition(h2Files, context => context.devDatabaseTypeH2Any),
  addSectionsCondition(mysqlFiles, context => context.prodDatabaseTypeMysql),
  addSectionsCondition(mariadbFiles, context => context.prodDatabaseTypeMariadb),
  addSectionsCondition(mssqlFiles, context => context.prodDatabaseTypeMssql),
  addSectionsCondition(postgresFiles, context => context.prodDatabaseTypePostgresql),
);

export default asWritingTask<Entity, Application>(async function writeSqlFiles({ application }) {
  await this.writeFiles({
    sections: serverFiles,
    context: application,
  });
});
