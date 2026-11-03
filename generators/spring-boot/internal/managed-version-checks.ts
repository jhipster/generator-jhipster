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
import { lt as semverLessThan } from 'semver';

import { getGradleLibsVersionsProperties } from '../../java-simple-application/generators/gradle/support/dependabot-gradle.ts';
import { R2DBC_MARIADB_BLOCKHOUND_VERSION } from '../generators/data-relational/internal/blockhound.ts';

/**
 * Versions from the server `libs.versions.toml` that are applied over Spring Boot's managed versions when those are older.
 */
export const MANAGED_VERSION_OVERRIDES = ['jackson-bom', 'jackson-2-bom', 'mariadb'] as const;

const majorMinor = (version: string) => version.split('.').slice(0, 2).join('.');

/**
 * Returns what needs a manual change after a Spring Boot upgrade, because generator code depends on the managed versions.
 */
export function checkManagedVersionCouplings({
  managedProperties,
  serverCatalog,
  graalvmCatalog,
}: {
  managedProperties: Record<string, string>;
  serverCatalog: string;
  graalvmCatalog: string;
}): string[] {
  const messages: string[] = [];
  const server = getGradleLibsVersionsProperties(serverCatalog);
  const graalvm = getGradleLibsVersionsProperties(graalvmCatalog);

  const hibernate = managedProperties['hibernate.version'];
  const hibernatePlugin = graalvm['hibernate-orm'];
  if (hibernate && hibernatePlugin && majorMinor(hibernate) !== majorMinor(hibernatePlugin)) {
    messages.push(
      `The org.hibernate.orm Gradle plugin is ${hibernatePlugin}, but Spring Boot manages Hibernate ${hibernate}. Update hibernate-orm in the graalvm libs.versions.toml to the latest plugin release of that line.`,
    );
  }

  const r2dbcMariadb = managedProperties['r2dbc-mariadb.version'];
  if (r2dbcMariadb && r2dbcMariadb !== R2DBC_MARIADB_BLOCKHOUND_VERSION) {
    messages.push(
      `Spring Boot manages r2dbc-mariadb ${r2dbcMariadb}, but the BlockHound lambdas were checked for ${R2DBC_MARIADB_BLOCKHOUND_VERSION}. Recheck SimpleClient with javap and update data-relational/internal/blockhound.ts.`,
    );
  }

  const liquibase = managedProperties['liquibase.version'];
  const liquibaseNeo4j = server['liquibase-neo4j'];
  if (liquibase && liquibaseNeo4j && majorMinor(liquibase) !== majorMinor(liquibaseNeo4j)) {
    messages.push(
      `liquibase-neo4j is pinned to ${liquibaseNeo4j}, but Spring Boot manages Liquibase ${liquibase}. Test a Neo4j sample with a matching liquibase-neo4j and update the server libs.versions.toml.`,
    );
  }

  for (const name of MANAGED_VERSION_OVERRIDES) {
    const managed = managedProperties[`${name}.version`];
    const override = server[name];
    if (managed && override && !semverLessThan(managed, override)) {
      messages.push(
        `Spring Boot manages ${name} ${managed}, which is not older than the ${override} override. Remove ${name} from the server libs.versions.toml and MANAGED_VERSION_OVERRIDES.`,
      );
    }
  }

  return messages;
}
