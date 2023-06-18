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

import { MavenDefinition, MavenPlugin } from '../../maven/types.mjs';

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

export const getCommonMavenDefinition = ({ javaDependencies }: { javaDependencies: Record<string, string> }) => ({
  properties: [
    { property: 'jaxb-runtime.version', value: javaDependencies['jaxb-runtime'] },
    { property: 'validation-api.version', value: javaDependencies['validation-api'] },
  ],
  dependencies: [
    { groupId: 'com.zaxxer', artifactId: 'HikariCP' },
    { groupId: 'com.fasterxml.jackson.module', artifactId: 'jackson-module-jaxb-annotations' },
    { groupId: 'org.testcontainers', artifactId: 'jdbc', scope: 'test' },
  ],
  annotationProcessors: [
    // eslint-disable-next-line no-template-curly-in-string
    { groupId: 'org.glassfish.jaxb', artifactId: 'jaxb-runtime', version: '${jaxb-runtime.version}' },
  ],
});

export const getReactiveMavenDefinition = ({ javaDependencies }: { javaDependencies: Record<string, string> }) => ({
  properties: [{ property: 'commons-beanutils.version', value: javaDependencies['commons-beanutils'] }],
  dependencies: [
    { groupId: 'org.springframework.boot', artifactId: 'spring-boot-starter-data-r2dbc' },
    // eslint-disable-next-line no-template-curly-in-string
    { groupId: 'commons-beanutils', artifactId: 'commons-beanutils', version: '${commons-beanutils.version}' },
    { groupId: 'jakarta.persistence', artifactId: 'jakarta.persistence-api' },
  ],
});

export const getImperativeMavenDefinition = ({ javaDependencies }: { javaDependencies: Record<string, string> }) => ({
  properties: [{ property: 'hibernate.version', value: javaDependencies.hibernate }],
  dependencies: [
    { groupId: 'org.springframework.boot', artifactId: 'spring-boot-starter-data-jpa' },
    { groupId: 'com.fasterxml.jackson.datatype', artifactId: 'jackson-datatype-hibernate6' },
    // TODO drop forced version. Refer to https://github.com/jhipster/generator-jhipster/issues/22579
    // eslint-disable-next-line no-template-curly-in-string
    { groupId: 'org.hibernate.orm', artifactId: 'hibernate-core', version: '${hibernate.version}' },
    { groupId: 'org.hibernate.orm', artifactId: 'hibernate-jpamodelgen', scope: 'provided' },
    { groupId: 'org.hibernate.validator', artifactId: 'hibernate-validator' },
    { groupId: 'org.springframework.security', artifactId: 'spring-security-data' },
    { inProfile: 'IDE', groupId: 'org.hibernate.orm', artifactId: 'hibernate-jpamodelgen' },
  ],
  annotationProcessors: [
    // eslint-disable-next-line no-template-curly-in-string
    { groupId: 'org.hibernate.orm', artifactId: 'hibernate-jpamodelgen', version: '${hibernate.version}' },
  ],
});

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
  options: { inProfile?: string; javaDependencies: Record<string, string> }
) => DatabaseTypeDependencies = (databaseType, { inProfile, javaDependencies }) => {
  const dependenciesForType: Record<string, DatabaseTypeDependencies> = {
    mariadb: {
      jdbc: {
        dependencies: [
          { inProfile, groupId: 'org.mariadb.jdbc', artifactId: 'mariadb-java-client' },
          { groupId: 'org.testcontainers', artifactId: 'mariadb', scope: 'test' },
        ],
      },
      r2dbc: {
        dependencies: [{ inProfile, groupId: 'org.mariadb', artifactId: 'r2dbc-mariadb' }],
      },
    },
    mssql: {
      jdbc: {
        dependencies: [
          { inProfile, groupId: 'com.microsoft.sqlserver', artifactId: 'mssql-jdbc' },
          { groupId: 'org.testcontainers', artifactId: 'mssqlserver', scope: 'test' },
        ],
      },
      r2dbc: {
        dependencies: [{ inProfile, groupId: 'io.r2dbc', artifactId: 'r2dbc-mssql' }],
      },
    },
    mysql: {
      jdbc: {
        dependencies: [
          { inProfile, groupId: 'com.mysql', artifactId: 'mysql-connector-j' },
          { groupId: 'org.testcontainers', artifactId: 'mysql', scope: 'test' },
        ],
      },
      r2dbc: {
        dependencies: [{ inProfile, groupId: 'io.asyncer', artifactId: 'r2dbc-mysql' }],
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
          { inProfile, groupId: 'org.postgresql', artifactId: 'postgresql' },
          { groupId: 'org.testcontainers', artifactId: 'postgresql', scope: 'test' },
        ],
      },
      r2dbc: {
        dependencies: [{ inProfile, groupId: 'org.postgresql', artifactId: 'r2dbc-postgresql' }],
      },
    },
  };
  return dependenciesForType[databaseType];
};
