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

import { getDatabaseData } from './database-data.mjs';
import { getJdbcUrl, getR2dbcUrl } from './database-url.mjs';

export default function prepareSqlApplicationProperties(application: any) {
  const devDatabaseData = getDatabaseData(application.devDatabaseType);
  const prodDatabaseData = getDatabaseData(application.prodDatabaseType);

  application.devHibernateDialect = devDatabaseData.hibernateDialect;
  application.prodHibernateDialect = prodDatabaseData.hibernateDialect;

  application.devJdbcDriver = devDatabaseData.jdbcDriver;
  application.prodJdbcDriver = prodDatabaseData.jdbcDriver;

  application.devDatabaseUsername = devDatabaseData.defaultUsername ?? application.baseName;
  application.devDatabasePassword = devDatabaseData.defaultPassword ?? '';
  application.prodDatabaseUsername = prodDatabaseData.defaultUsername ?? application.baseName;
  application.prodDatabasePassword = prodDatabaseData.defaultPassword ?? '';

  const prodDatabaseOptions = {
    databaseName: prodDatabaseData.defaultDatabaseName ?? application.baseName,
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
    const devDatabaseOptions = {
      databaseName: devDatabaseData.defaultDatabaseName ?? application.lowercaseBaseName,
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
  } else {
    application.devJdbcUrl = application.prodJdbcUrl;
    application.devLiquibaseUrl = application.prodLiquibaseUrl;
    application.devR2dbcUrl = application.prodR2dbcUrl;
  }
}
