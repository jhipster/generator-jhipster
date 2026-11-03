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
import { readFileSync } from 'node:fs';

import springBootDependencies from '../resources/spring-boot-dependencies-4.ts';

import { checkManagedVersionCouplings } from './managed-version-checks.ts';

const readResource = (path: string) => readFileSync(new URL(path, import.meta.url), 'utf8');
const serverCatalog = readResource('../../server/resources/gradle/libs.versions.toml');
const graalvmCatalog = readResource('../../java-simple-application/generators/graalvm/resources/gradle/libs.versions.toml');

describe('generator - spring-boot - managed version couplings', () => {
  it('should match the managed Spring Boot versions', () => {
    expect(checkManagedVersionCouplings({ managedProperties: springBootDependencies.properties, serverCatalog, graalvmCatalog })).toEqual(
      [],
    );
  });

  it('should report what a Spring Boot upgrade leaves behind', () => {
    const messages = checkManagedVersionCouplings({
      managedProperties: {
        'hibernate.version': '7.5.0.Final',
        'r2dbc-mariadb.version': '9.9.9',
        'liquibase.version': '5.1.0',
        'jackson-bom.version': '99.0.0',
        'jackson-2-bom.version': '99.0.0',
        'mariadb.version': '99.0.0',
      },
      serverCatalog,
      graalvmCatalog,
    });
    expect(messages).toHaveLength(6);
  });
});
