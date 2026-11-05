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
import { readFileSync } from 'node:fs';

import { getGradleLibsVersionsProperties } from '../../../generators/java-simple-application/generators/gradle/support/dependabot-gradle.ts';
import { R2DBC_MARIADB_BLOCKHOUND_VERSION } from '../../../generators/spring-boot/generators/data-relational/resources/blockhound.ts';
import { MANAGED_VERSION_OVERRIDES, isOlderPatchVersion } from '../../../generators/spring-boot/resources/managed-version-overrides.ts';
import { getSourceRoot } from '../../../lib/index.ts';

/**
 * Pins that were checked against a managed version they don't match: catalog entry => managed version it was checked with.
 * The check of that entry passes while Spring Boot manages that version.
 * @example { 'liquibase-neo4j': '5.1.0' }
 */
export const ACKNOWLEDGED_PINS: Record<string, string> = {};

export type ManagedVersionCatalogs = { serverCatalog: string; graalvmCatalog: string };

/**
 * Reads the `libs.versions.toml` catalogs that hold the versions coupled to the managed ones.
 */
export const readManagedVersionCatalogs = (): ManagedVersionCatalogs => ({
  serverCatalog: readFileSync(getSourceRoot('generators/server/resources/gradle/libs.versions.toml'), 'utf8'),
  graalvmCatalog: readFileSync(
    getSourceRoot('generators/java-simple-application/generators/graalvm/resources/gradle/libs.versions.toml'),
    'utf8',
  ),
});

const majorMinor = (version: string) => version.split('.').slice(0, 2).join('.');

/**
 * Returns what needs a manual change after a Spring Boot upgrade, because generator code depends on the managed versions.
 */
export function checkManagedVersionCouplings({
  managedProperties,
  serverCatalog,
  graalvmCatalog,
  acknowledgedPins = ACKNOWLEDGED_PINS,
}: ManagedVersionCatalogs & {
  managedProperties: Record<string, string>;
  acknowledgedPins?: Record<string, string>;
}): string[] {
  const messages: string[] = [];
  const server = getGradleLibsVersionsProperties(serverCatalog);
  const graalvm = getGradleLibsVersionsProperties(graalvmCatalog);

  const getManaged = (property: string): string | undefined => {
    const value = managedProperties[property];
    if (!value) {
      messages.push(`Spring Boot no longer manages ${property}. Update the check of it in update-spring-boot.`);
    }
    return value;
  };
  const getCatalogEntry = (catalog: Record<string, string>, key: string, catalogName: string): string | undefined => {
    const value = catalog[key];
    if (!value) {
      messages.push(`The ${catalogName} libs.versions.toml has no ${key} entry. Update the check of it in update-spring-boot.`);
    }
    return value;
  };
  const isAcknowledged = (key: string, managed: string) => acknowledgedPins[key] === managed;

  const hibernate = getManaged('hibernate.version');
  const hibernatePlugin = getCatalogEntry(graalvm, 'hibernate-orm', 'graalvm');
  if (
    hibernate &&
    hibernatePlugin &&
    majorMinor(hibernate) !== majorMinor(hibernatePlugin) &&
    !isAcknowledged('hibernate-orm', hibernate)
  ) {
    messages.push(
      `The org.hibernate.orm Gradle plugin is ${hibernatePlugin}, but Spring Boot manages Hibernate ${hibernate}. Update hibernate-orm in the graalvm libs.versions.toml to the latest plugin release of that line, or add it to ACKNOWLEDGED_PINS.`,
    );
  }

  const r2dbcMariadb = getManaged('r2dbc-mariadb.version');
  if (r2dbcMariadb && r2dbcMariadb !== R2DBC_MARIADB_BLOCKHOUND_VERSION) {
    messages.push(
      `Spring Boot manages r2dbc-mariadb ${r2dbcMariadb}, but the BlockHound lambdas were checked for ${R2DBC_MARIADB_BLOCKHOUND_VERSION}. Recheck SimpleClient with javap and update data-relational/resources/blockhound.ts.`,
    );
  }

  const liquibase = getManaged('liquibase.version');
  const liquibaseNeo4j = getCatalogEntry(server, 'liquibase-neo4j', 'server');
  if (
    liquibase &&
    liquibaseNeo4j &&
    majorMinor(liquibase) !== majorMinor(liquibaseNeo4j) &&
    !isAcknowledged('liquibase-neo4j', liquibase)
  ) {
    messages.push(
      `liquibase-neo4j is pinned to ${liquibaseNeo4j}, but Spring Boot manages Liquibase ${liquibase}. Test a Neo4j sample with a matching liquibase-neo4j and update the server libs.versions.toml, or add it to ACKNOWLEDGED_PINS.`,
    );
  }

  for (const name of MANAGED_VERSION_OVERRIDES) {
    const managed = getManaged(`${name}.version`);
    const override = getCatalogEntry(server, name, 'server');
    if (managed && override && !isOlderPatchVersion(managed, override)) {
      messages.push(
        `Spring Boot manages ${name} ${managed}, so the ${override} override no longer applies. Remove ${name} from the server libs.versions.toml and MANAGED_VERSION_OVERRIDES, or update it to a newer patch release of ${majorMinor(managed)}.`,
      );
    }
  }

  return messages;
}
