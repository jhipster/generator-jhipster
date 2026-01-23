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
import type { Application as SpringDataRelationalApplication } from '../types.ts';

import { getDatabaseData } from './database-data.ts';
import { getJdbcUrl, getR2dbcUrl } from './database-url.ts';

const { ORACLE, MYSQL, POSTGRESQL, MARIADB, MSSQL, H2_MEMORY, H2_DISK } = databaseTypes;

export default function prepareSqlApplicationProperties({ application }: { application: SpringDataRelationalApplication }) {
  application.prodDatabaseTypeMariadb = application.prodDatabaseType === MARIADB;
  application.prodDatabaseTypeMssql = application.prodDatabaseType === MSSQL;
  application.prodDatabaseTypeMysql = application.prodDatabaseType === MYSQL;
  application.prodDatabaseTypeOracle = application.prodDatabaseType === ORACLE;
  application.prodDatabaseTypePostgresql = application.prodDatabaseType === POSTGRESQL;

  application.devDatabaseTypeH2Disk = application.devDatabaseType === H2_DISK;
  application.devDatabaseTypeH2Memory = application.devDatabaseType === H2_MEMORY;
  application.devDatabaseTypeH2Any = application.devDatabaseTypeH2Disk || application.devDatabaseTypeH2Memory;

  application.devDatabaseTypeMariadb = application.prodDatabaseTypeMariadb && !application.devDatabaseTypeH2Any;
  application.devDatabaseTypeMssql = application.prodDatabaseTypeMssql && !application.devDatabaseTypeH2Any;
  application.devDatabaseTypeMysql = application.prodDatabaseTypeMysql && !application.devDatabaseTypeH2Any;
  application.devDatabaseTypeOracle = application.prodDatabaseTypeOracle && !application.devDatabaseTypeH2Any;
  application.devDatabaseTypePostgresql = application.prodDatabaseTypePostgresql && !application.devDatabaseTypeH2Any;

  if (!application.databaseTypeSql) {
    return;
  }

  const prodDatabaseData = getDatabaseData(application.prodDatabaseType);
  application.prodHibernateDialect = prodDatabaseData.hibernateDialect;
  application.prodJdbcDriver = prodDatabaseData.jdbcDriver;
  application.prodDatabaseUsername = prodDatabaseData.defaultUsername ?? application.baseName;
  application.prodDatabasePassword = prodDatabaseData.defaultPassword ?? '';
  application.prodDatabaseName = prodDatabaseData.defaultDatabaseName ?? application.baseName;

  const prodDatabaseOptions = {
    databaseName: application.prodDatabaseName,
    hostname: 'localhost',
  };

  application.prodJdbcUrl = getJdbcUrl(application.prodDatabaseType, prodDatabaseOptions);
  application.prodLiquibaseUrl = getJdbcUrl(application.prodDatabaseType, {
    ...prodDatabaseOptions,
    skipExtraOptions: true,
  });
  if (application.reactive) {
    application.prodR2dbcUrl = getR2dbcUrl(application.prodDatabaseType, prodDatabaseOptions);
  }

  if (application.devDatabaseTypeH2Any) {
    try {
      const devDatabaseData = getDatabaseData(application.devDatabaseType);
      application.devHibernateDialect = devDatabaseData.hibernateDialect;
      application.devJdbcDriver = devDatabaseData.jdbcDriver;
      application.devDatabaseUsername = devDatabaseData.defaultUsername ?? application.baseName;
      application.devDatabasePassword = devDatabaseData.defaultPassword ?? '';
      application.devDatabaseName = devDatabaseData.defaultDatabaseName ?? application.baseName;

      const devDatabaseOptions = {
        databaseName: application.devDatabaseName,
      };
      application.devJdbcUrl = getJdbcUrl(application.devDatabaseType, {
        ...devDatabaseOptions,
        buildDirectory: `./${application.temporaryDir}`,
        prodDatabaseType: application.prodDatabaseType,
      });

      let devLiquibaseOptions;
      if (application.devDatabaseTypeH2Memory) {
        devLiquibaseOptions = {
          protocolSuffix: 'h2:tcp://',
          localDirectory: 'localhost:18080/mem:',
        };
      } else {
        devLiquibaseOptions = {
          // eslint-disable-next-line no-template-curly-in-string
          buildDirectory: application.buildToolGradle ? `./${application.temporaryDir}` : '${project.build.directory}/',
        };
      }

      application.devLiquibaseUrl = getJdbcUrl(application.devDatabaseType, {
        ...devDatabaseOptions,
        skipExtraOptions: true,
        ...devLiquibaseOptions,
      });

      if (application.reactive) {
        application.devR2dbcUrl = getR2dbcUrl(application.devDatabaseType, {
          ...devDatabaseOptions,
          buildDirectory: `./${application.temporaryDir}`,
          prodDatabaseType: application.prodDatabaseType,
        });
      }
    } catch (error) {
      if (application.backendTypeSpringBoot) {
        throw error;
      }
    }
  } else {
    application.devJdbcUrl = application.prodJdbcUrl;
    application.devLiquibaseUrl = application.prodLiquibaseUrl;
    application.devR2dbcUrl = application.prodR2dbcUrl;
    application.devHibernateDialect = application.prodHibernateDialect;
    application.devJdbcDriver = application.prodJdbcDriver;
    application.devDatabaseUsername = application.prodDatabaseUsername;
    application.devDatabasePassword = application.prodDatabasePassword;
    application.devDatabaseName = application.prodDatabaseName;
    application.devJdbcUrl = application.prodJdbcUrl;
    application.devLiquibaseUrl = application.prodLiquibaseUrl;
    if (application.reactive) {
      application.devR2dbcUrl = application.prodR2dbcUrl;
    }
  }
}
