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
import { describe, expect, it } from 'expect-node';

import springBootDependencies from '../../../generators/spring-boot/resources/spring-boot-dependencies-4.ts';

import { checkManagedVersionCouplings, readManagedVersionCatalogs } from './managed-version-checks.ts';

const serverCatalog = `[libraries]
jackson-bom = { module = 'tools.jackson:jackson-bom', version = '3.1.8' }
jackson-2-bom = { module = 'com.fasterxml.jackson:jackson-bom', version = '2.21.8' }
mariadb = { module = 'org.mariadb.jdbc:mariadb-java-client', version = '3.5.11' }
liquibase-neo4j = { module = 'org.liquibase.ext:liquibase-neo4j', version = '5.0.0' }
`;
const graalvmCatalog = `[plugins]
hibernate-orm = { id = 'org.hibernate.orm', version = '7.4.10.Final' }
`;

describe('update-spring-boot - managed version couplings', () => {
  it('should match the managed Spring Boot versions', () => {
    expect(checkManagedVersionCouplings({ managedProperties: springBootDependencies.properties, ...readManagedVersionCatalogs() })).toEqual(
      [],
    );
  });

  it('should pass when the managed versions match the catalogs', () => {
    expect(
      checkManagedVersionCouplings({
        managedProperties: {
          'hibernate.version': '7.4.13.Final',
          'r2dbc-mariadb.version': '1.4.2',
          'liquibase.version': '5.0.4',
          'jackson-bom.version': '3.1.7',
          'jackson-2-bom.version': '2.21.7',
          'mariadb.version': '3.5.10',
        },
        serverCatalog,
        graalvmCatalog,
      }),
    ).toEqual([]);
  });

  it('should report what a Spring Boot upgrade leaves behind', () => {
    expect(
      checkManagedVersionCouplings({
        managedProperties: {
          'hibernate.version': '7.5.0.Final',
          'r2dbc-mariadb.version': '1.4.3',
          'liquibase.version': '5.1.0',
          'jackson-bom.version': '3.1.8',
          'jackson-2-bom.version': '2.22.0',
          'mariadb.version': '3.5.11.Final',
        },
        serverCatalog,
        graalvmCatalog,
      }),
    ).toEqual([
      'The org.hibernate.orm Gradle plugin is 7.4.10.Final, but Spring Boot manages Hibernate 7.5.0.Final. Update hibernate-orm in the graalvm libs.versions.toml to the latest plugin release of that line, or add it to ACKNOWLEDGED_PINS.',
      'Spring Boot manages r2dbc-mariadb 1.4.3, but the BlockHound lambdas were checked for 1.4.2. Recheck SimpleClient with javap and update data-relational/resources/blockhound.ts.',
      'liquibase-neo4j is pinned to 5.0.0, but Spring Boot manages Liquibase 5.1.0. Test a Neo4j sample with a matching liquibase-neo4j and update the server libs.versions.toml, or add it to ACKNOWLEDGED_PINS.',
      'Spring Boot manages jackson-bom 3.1.8, so the 3.1.8 override no longer applies. Remove jackson-bom from the server libs.versions.toml and MANAGED_VERSION_OVERRIDES, or update it to a newer patch release of 3.1.',
      'Spring Boot manages jackson-2-bom 2.22.0, so the 2.21.8 override no longer applies. Remove jackson-2-bom from the server libs.versions.toml and MANAGED_VERSION_OVERRIDES, or update it to a newer patch release of 2.22.',
      'Spring Boot manages mariadb 3.5.11.Final, so the 3.5.11 override no longer applies. Remove mariadb from the server libs.versions.toml and MANAGED_VERSION_OVERRIDES, or update it to a newer patch release of 3.5.',
    ]);
  });

  it('should accept acknowledged pins', () => {
    expect(
      checkManagedVersionCouplings({
        managedProperties: {
          'hibernate.version': '7.5.0.Final',
          'r2dbc-mariadb.version': '1.4.2',
          'liquibase.version': '5.1.0',
          'jackson-bom.version': '3.1.7',
          'jackson-2-bom.version': '2.21.7',
          'mariadb.version': '3.5.10',
        },
        serverCatalog,
        graalvmCatalog,
        acknowledgedPins: { 'hibernate-orm': '7.5.0.Final', 'liquibase-neo4j': '5.1.0' },
      }),
    ).toEqual([]);
  });

  it('should report renamed properties and catalog entries', () => {
    expect(
      checkManagedVersionCouplings({
        managedProperties: {
          'hibernate-core.version': '7.4.13.Final',
          'r2dbc-mariadb.version': '1.4.2',
          'liquibase.version': '5.0.4',
          'jackson-bom.version': '3.1.7',
          'jackson-2-bom.version': '2.21.7',
          'mariadb.version': '3.5.10',
        },
        serverCatalog: serverCatalog.replace('liquibase-neo4j =', 'liquibase-neo4j-extension ='),
        graalvmCatalog,
      }),
    ).toEqual([
      'Spring Boot no longer manages hibernate.version. Update the check of it in update-spring-boot.',
      'The server libs.versions.toml has no liquibase-neo4j entry. Update the check of it in update-spring-boot.',
    ]);
  });
});
