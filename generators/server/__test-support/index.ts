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

import { it } from 'esmocha';

import { databaseTypes } from '../../../lib/jhipster/index.ts';
import type { result } from '../../../lib/testing/index.ts';

const { SQL, COUCHBASE } = databaseTypes;

type RunResultSupplier = () => typeof result;

export const shouldComposeWithLiquibase = (testSample: boolean | Record<string, unknown>, runResultSupplier: RunResultSupplier) => {
  const liquibaseEnabled = typeof testSample === 'boolean' ? testSample : testSample?.databaseType === SQL;
  if (liquibaseEnabled) {
    it('should compose with liquibase generator', () => {
      runResultSupplier().assertGeneratorComposedOnce('jhipster:liquibase');
    });
  } else {
    it('should not compose with liquibase generator', () => {
      runResultSupplier().assertGeneratorNotComposed('jhipster:liquibase');
    });
  }
};

const shouldComposeWithDatabasetype = (databaseType: string, shouldCompose: boolean, runResultSupplier: RunResultSupplier) => {
  const generator = databaseType;
  if (shouldCompose) {
    it(`should compose with ${generator} generator`, () => {
      runResultSupplier().assertGeneratorComposedOnce(`jhipster:spring-boot:data-${generator}`);
    });
  } else {
    it(`should not compose with ${generator} generator`, () => {
      runResultSupplier().assertGeneratorNotComposed(`jhipster:spring-boot:data-${generator}`);
    });
  }
};

export const shouldComposeWithCouchbase = (shouldCompose: boolean, runResultSupplier: RunResultSupplier) =>
  shouldComposeWithDatabasetype(COUCHBASE, shouldCompose, runResultSupplier);

export const filterBasicServerGenerators = (ns: string) => {
  const [, generator, subGenerator] = ns.split(':');
  return (
    subGenerator !== 'bootstrap' &&
    !generator.startsWith('bootstrap') &&
    ![
      `jhipster:project-name`,
      `jhipster:java-simple-application:build-tool`,
      `jhipster:java-simple-application:gradle`,
      `jhipster:java`,
      `jhipster:java:domain`,
      `jhipster:server`,
      `jhipster:spring-boot`,
    ].includes(ns)
  );
};
