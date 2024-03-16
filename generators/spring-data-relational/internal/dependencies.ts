/**
 * Copyright 2013-2024 the original author or authors from the JHipster project.
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

import { MavenDefinition, MavenPlugin } from '../../maven/types.js';

type DatabaseTypeDependencies = {
  jdbc: MavenDefinition;
  r2dbc: MavenDefinition;
};

const testcontainerFileForDB = {
  mariadb: 'MariadbTestContainer.java',
  mssql: 'MsSqlTestContainer.java',
  mysql: 'MysqlTestContainer.java',
  postgresql: 'PostgreSqlTestContainer.java',
};

type JavaArtifact = { groupId: string; artifactId: string; version?: string };
export type DatabaseArtifact = { jdbc: JavaArtifact; r2dbc: JavaArtifact };

const databaseArtifactForDB: Record<string, DatabaseArtifact> = {
  mariadb: {
    jdbc: { groupId: 'org.mariadb.jdbc', artifactId: 'mariadb-java-client' },
    // maria-r2dbc driver is failing.
    // r2dbc: { groupId: 'org.mariadb', artifactId: 'r2dbc-mariadb' },
    r2dbc: { groupId: 'io.asyncer', artifactId: 'r2dbc-mysql' },
  },
  mssql: {
    jdbc: { groupId: 'com.microsoft.sqlserver', artifactId: 'mssql-jdbc' },
    r2dbc: { groupId: 'io.r2dbc', artifactId: 'r2dbc-mssql' },
  },
  mysql: {
    jdbc: { groupId: 'com.mysql', artifactId: 'mysql-connector-j' },
    r2dbc: { groupId: 'io.asyncer', artifactId: 'r2dbc-mysql' },
  },
  postgresql: {
    jdbc: { groupId: 'org.postgresql', artifactId: 'postgresql' },
    r2dbc: { groupId: 'org.postgresql', artifactId: 'r2dbc-postgresql' },
  },
};

export const getDatabaseDriverForDatabase = (databaseType: string) => databaseArtifactForDB[databaseType];

export const getH2MavenDefinition = ({
  prodDatabaseType,
  packageFolder,
}: {
  prodDatabaseType: string;
  packageFolder: string;
}): DatabaseTypeDependencies => {
  const testcontainerFile = testcontainerFileForDB[prodDatabaseType];
  const excludeContainerPlugin: MavenPlugin[] = testcontainerFile
    ? [
        {
          inProfile: 'dev',
          groupId: 'org.apache.maven.plugins',
          artifactId: 'maven-compiler-plugin',
          additionalContent: `
<configuration>
  <testExcludes>
    <testExclude>${packageFolder}config/${testcontainerFile}</testExclude>
  </testExcludes>
</configuration>
`,
        },
      ]
    : [];

  return {
    jdbc: {
      dependencies: [{ inProfile: 'dev', groupId: 'com.h2database', artifactId: 'h2' }],
      plugins: excludeContainerPlugin,
    },
    r2dbc: {
      dependencies: [{ inProfile: 'dev', groupId: 'io.r2dbc', artifactId: 'r2dbc-h2' }],
    },
  };
};

// eslint-disable-next-line import/prefer-default-export
export const getDatabaseTypeMavenDefinition: (
  databaseType: string,
  options: { inProfile?: string; javaDependencies: Record<string, string> },
) => DatabaseTypeDependencies = (databaseType, { inProfile }) => {
  const dependenciesForType: Record<string, DatabaseTypeDependencies> = {
    mariadb: {
      jdbc: {
        dependencies: [
          { inProfile, ...databaseArtifactForDB.mariadb.jdbc },
          { groupId: 'org.testcontainers', artifactId: 'mariadb', scope: 'test' },
        ],
      },
      r2dbc: {
        dependencies: [{ inProfile, ...databaseArtifactForDB.mariadb.r2dbc }],
      },
    },
    mssql: {
      jdbc: {
        dependencies: [
          { inProfile, ...databaseArtifactForDB.mssql.jdbc },
          { groupId: 'org.testcontainers', artifactId: 'mssqlserver', scope: 'test' },
        ],
      },
      r2dbc: {
        dependencies: [{ inProfile, ...databaseArtifactForDB.mssql.r2dbc }],
      },
    },
    mysql: {
      jdbc: {
        dependencies: [
          { inProfile, ...databaseArtifactForDB.mysql.jdbc },
          { groupId: 'org.testcontainers', artifactId: 'mysql', scope: 'test' },
        ],
      },
      r2dbc: {
        dependencies: [{ inProfile, ...databaseArtifactForDB.mysql.r2dbc }],
      },
    },
    oracle: {
      jdbc: {
        dependencies: [
          { inProfile, groupId: 'com.oracle.database.jdbc', artifactId: 'ojdbc8' },
          { groupId: 'org.testcontainers', artifactId: 'oracle-xe', scope: 'test' },
        ],
      },
      r2dbc: {},
    },
    postgresql: {
      jdbc: {
        dependencies: [
          { inProfile, ...databaseArtifactForDB.postgresql.jdbc },
          { groupId: 'org.testcontainers', artifactId: 'postgresql', scope: 'test' },
        ],
      },
      r2dbc: {
        dependencies: [{ inProfile, ...databaseArtifactForDB.postgresql.r2dbc }],
      },
    },
  };
  return dependenciesForType[databaseType];
};
