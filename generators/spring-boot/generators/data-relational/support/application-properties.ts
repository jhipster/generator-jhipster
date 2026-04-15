/**
 * Copyright 2013-2026 the original author or authors from the JHipster project.
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

import { databaseTypes } from '../../../../../lib/jhipster/index.ts';
import { buildMutateDataForProperty } from '../../../../../lib/utils/derived-property.ts';
import { mutateData } from '../../../../../lib/utils/object.ts';
import type { Application as SpringDataRelationalApplication } from '../types.ts';

import { getDatabaseData } from './database-data.ts';
import { getJdbcUrl, getR2dbcUrl } from './database-url.ts';

const { ORACLE, MYSQL, POSTGRESQL, MARIADB, MSSQL, H2_MEMORY, H2_DISK } = databaseTypes;

const DATABASE_TYPES = [ORACLE, MYSQL, POSTGRESQL, MARIADB, MSSQL];
const DEV_DATABASE_TYPES = [...DATABASE_TYPES, H2_MEMORY, H2_DISK];

export default function prepareSqlApplicationProperties({ application }: { application: SpringDataRelationalApplication }) {
  if (!application.databaseTypeSql && !application.databaseTypeNeo4j) {
    return;
  }

  mutateData(
    application,
    buildMutateDataForProperty('prodDatabaseType', DATABASE_TYPES),
    {
      __override__: false,
      devDatabaseType: data => data.prodDatabaseType,
    },
    buildMutateDataForProperty('devDatabaseType', DEV_DATABASE_TYPES),
    {
      __override__: false,
      devDatabaseTypeH2Any: data => data.devDatabaseTypeH2Disk || data.devDatabaseTypeH2Memory,
    },
    context => {
      if (context.databaseTypeNeo4j) {
        return {
          __override__: false,
          devDatabaseUsername: '',
          devDatabasePassword: '',
          devJdbcDriver: undefined,
          devHibernateDialect: undefined,
        };
      }

      const prodDatabaseData = getDatabaseData(context.prodDatabaseType);
      const prodDatabaseName = prodDatabaseData.defaultDatabaseName ?? context.baseName;
      return {
        __override__: false,
        prodHibernateDialect: prodDatabaseData.hibernateDialect,
        prodJdbcDriver: prodDatabaseData.jdbcDriver,
        prodDatabaseUsername: prodDatabaseData.defaultUsername ?? context.baseName,
        prodDatabasePassword: prodDatabaseData.defaultPassword ?? '',
        prodDatabaseName,
        prodJdbcUrl: data =>
          getJdbcUrl(data.prodDatabaseType, {
            databaseName: data.prodDatabaseName,
            hostname: 'localhost',
          }),
        prodR2dbcUrl: data =>
          getR2dbcUrl(data.prodDatabaseType, {
            databaseName: data.prodDatabaseName,
            hostname: 'localhost',
          }),
      };
    },
    context => {
      if (context.databaseTypeNeo4j) {
        return {};
      }

      if (context.devDatabaseTypeH2Any) {
        const devDatabaseData = getDatabaseData(context.devDatabaseType);
        const databaseName = devDatabaseData.defaultDatabaseName ?? context.baseName;
        return {
          __override__: false,
          devHibernateDialect: devDatabaseData.hibernateDialect,
          devJdbcDriver: devDatabaseData.jdbcDriver,
          devDatabaseUsername: devDatabaseData.defaultUsername ?? context.baseName,
          devDatabasePassword: devDatabaseData.defaultPassword ?? '',
          devDatabaseName: databaseName,
          devJdbcUrl: data =>
            getJdbcUrl(data.devDatabaseType, {
              databaseName: data.devDatabaseName,
              buildDirectory: `./${data.temporaryDir}`,
              prodDatabaseType: data.prodDatabaseType,
            }),
          devR2dbcUrl: data =>
            getR2dbcUrl(data.devDatabaseType, {
              databaseName: data.devDatabaseName,
              buildDirectory: `./${data.temporaryDir}`,
              prodDatabaseType: data.prodDatabaseType,
            }),
        };
      }
      return {
        __override__: false,
        devJdbcUrl: data => data.prodJdbcUrl,
        devR2dbcUrl: data => data.prodR2dbcUrl,
        devHibernateDialect: data => data.prodHibernateDialect,
        devJdbcDriver: data => data.prodJdbcDriver,
        devDatabaseUsername: data => data.prodDatabaseUsername,
        devDatabasePassword: data => data.prodDatabasePassword,
        devDatabaseName: data => data.prodDatabaseName,
      };
    },
  );
}
