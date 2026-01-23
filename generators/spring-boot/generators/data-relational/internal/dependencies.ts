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

import type { JavaDependency } from '../../../../java/types.ts';
import type { MavenDefinition, MavenDependency, MavenPlugin } from '../../../../java-simple-application/generators/maven/types.ts';

type DatabaseTypeDependencies = {
  jdbc: MavenDefinition;
  r2dbc: MavenDefinition;
};

const testcontainerFileForDB: Record<string, string> = {
  mariadb: 'MariadbTestContainer.java',
  mssql: 'MsSqlTestContainer.java',
  mysql: 'MysqlTestContainer.java',
  postgresql: 'PostgreSqlTestContainer.java',
};

export type DatabaseArtifact = { jdbc: JavaDependency; r2dbc?: JavaDependency; testContainer?: JavaDependency };

export const javaSqlDatabaseArtifacts = {
  mariadb: {
    jdbc: { groupId: 'org.mariadb.jdbc', artifactId: 'mariadb-java-client' },
    // maria-r2dbc driver is failing.
    // r2dbc: { groupId: 'org.mariadb', artifactId: 'r2dbc-mariadb' },
    r2dbc: { groupId: 'io.asyncer', artifactId: 'r2dbc-mysql' },
    testContainer: { groupId: 'org.testcontainers', artifactId: 'testcontainers-mariadb', scope: 'test' },
  },
  mssql: {
    jdbc: { groupId: 'com.microsoft.sqlserver', artifactId: 'mssql-jdbc' },
    r2dbc: { groupId: 'io.r2dbc', artifactId: 'r2dbc-mssql' },
    testContainer: { groupId: 'org.testcontainers', artifactId: 'testcontainers-mssqlserver', scope: 'test' },
  },
  mysql: {
    jdbc: { groupId: 'com.mysql', artifactId: 'mysql-connector-j' },
    r2dbc: { groupId: 'io.asyncer', artifactId: 'r2dbc-mysql' },
    testContainer: { groupId: 'org.testcontainers', artifactId: 'testcontainers-mysql', scope: 'test' },
  },
  postgresql: {
    jdbc: { groupId: 'org.postgresql', artifactId: 'postgresql' },
    r2dbc: { groupId: 'org.postgresql', artifactId: 'r2dbc-postgresql' },
    testContainer: { groupId: 'org.testcontainers', artifactId: 'testcontainers-postgresql', scope: 'test' },
  },
  oracle: {
    jdbc: { groupId: 'com.oracle.database.jdbc', artifactId: 'ojdbc8' },
    testContainer: { groupId: 'org.testcontainers', artifactId: 'testcontainers-oracle-xe', scope: 'test' },
  },
  h2: {
    jdbc: { groupId: 'com.h2database', artifactId: 'h2' },
    r2dbc: { groupId: 'io.r2dbc', artifactId: 'r2dbc-h2' },
  },
} as const satisfies Record<string, DatabaseArtifact>;

export const getH2MavenDefinition = ({
  prodDatabaseType,
  packageFolder,
}: {
  prodDatabaseType: keyof Omit<typeof javaSqlDatabaseArtifacts, 'h2'>;
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
      dependencies: [{ inProfile: 'dev', ...javaSqlDatabaseArtifacts.h2.jdbc }],
      plugins: excludeContainerPlugin,
    },
    r2dbc: {
      dependencies: [{ inProfile: 'dev', ...javaSqlDatabaseArtifacts.h2.r2dbc }],
    },
  };
};

export const getDatabaseTypeMavenDefinition: (
  databaseType: keyof Omit<typeof javaSqlDatabaseArtifacts, 'h2'>,
  options: { inProfile?: string; javaDependencies: Record<string, string> },
) => DatabaseTypeDependencies = (databaseType, { inProfile }) => {
  if (!javaSqlDatabaseArtifacts[databaseType]) {
    throw new Error(`Unsupported database type: ${databaseType}`);
  }
  const { jdbc, testContainer } = javaSqlDatabaseArtifacts[databaseType];
  const testContainerDeps: MavenDependency[] = [{ inProfile, ...testContainer }];
  if (inProfile === 'prod') {
    // Add test containers dependency to provided in dev profile, as they need to be in a default profile for IDEs. Avoids `cannot find symbol` error.
    testContainerDeps.push({ inProfile: 'dev', ...testContainer, scope: 'provided' });
  }
  return {
    jdbc: {
      dependencies: [{ inProfile, ...jdbc }, ...testContainerDeps],
    },
    r2dbc:
      databaseType !== 'oracle'
        ? { dependencies: [{ inProfile, ...javaSqlDatabaseArtifacts[databaseType].r2dbc }] } // r2dbc uses jdbc for testcontainers.
        : {},
  };
};
