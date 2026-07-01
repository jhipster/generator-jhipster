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

import { before, describe, it } from 'esmocha';

import { defaultHelpers as helpers, runResult } from '../../../../lib/testing/index.ts';
import { SERVER_MAIN_RES_DIR } from '../../../generator-constants.ts';

const GENERATOR_SPRING_DATA_CASSANDRA = 'spring-boot:data-cassandra';

const entityFoo = { name: 'Foo', changelogDate: '20160926101210' };

describe('generator - app - database changelogs', () => {
  describe('when regenerating the application', () => {
    describe('with cassandra database', () => {
      before(async () => {
        await helpers
          .runJHipster(GENERATOR_SPRING_DATA_CASSANDRA)
          .withJHipsterConfig({ databaseType: 'cassandra' }, [entityFoo])
          .withMockedSource()
          .withOptions({ force: true, skipClient: true });
      });

      it('should create database changelog for the entity', () => {
        runResult.assertFile([`${SERVER_MAIN_RES_DIR}config/cql/changelog/20160926101210_added_entity_Foo.cql`]);
      });
    });
  });
});
