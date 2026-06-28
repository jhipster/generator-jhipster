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

import { join } from 'node:path';

import type { MemFsEditor } from 'mem-fs-editor';

import { entitiesSamplesDir } from '../../constants.ts';

const sqllight = ['BankAccount', 'Label', 'Operation'];

const sql = [
  ...sqllight,

  'FieldTestEntity',
  'FieldTestMapstructAndServiceClassEntity',
  'FieldTestServiceClassAndJpaFilteringEntity',
  'FieldTestServiceImplEntity',
  'FieldTestInfiniteScrollEntity',
  'FieldTestPaginationEntity',
  'FieldTestEnumWithValue',

  'EntityWithDTO',
  'EntityWithPaginationAndDTO',
  'EntityWithServiceClassAndPagination',
  'EntityWithServiceClassPaginationAndDTO',
  'EntityWithServiceImplAndDTO',
  'EntityWithServiceImplAndPagination',
  'EntityWithServiceImplPaginationAndDTO',

  'MapsIdUserProfileWithDTO',
];

export const entitiesByType: Record<string, string[]> = {
  document: [
    'DocumentBankAccount',
    'EmbeddedOperation',
    'Place',
    'Division',

    'FieldTestEntity',
    'FieldTestMapstructAndServiceClassEntity',
    'FieldTestServiceClassAndJpaFilteringEntity',
    'FieldTestServiceImplEntity',
    'FieldTestInfiniteScrollEntity',
    'FieldTestPaginationEntity',

    'EntityWithDTO',
    'EntityWithPaginationAndDTO',
    'EntityWithServiceClassAndPagination',
    'EntityWithServiceClassPaginationAndDTO',
    'EntityWithServiceImplAndDTO',
    'EntityWithServiceImplAndPagination',
    'EntityWithServiceImplPaginationAndDTO',
  ],
  neo4j: ['Album', 'Track', 'Genre', 'Artist'],
  cassandra: [
    'CassBankAccount',

    'FieldTestEntity',
    'FieldTestServiceImplEntity',
    'FieldTestMapstructAndServiceClassEntity',
    'FieldTestPaginationEntity',
  ],
  micro: [
    'MicroserviceBankAccount',
    'MicroserviceOperation',
    'MicroserviceLabel',

    'FieldTestEntity',
    'FieldTestMapstructAndServiceClassEntity',
    'FieldTestServiceClassAndJpaFilteringEntity',
    'FieldTestServiceImplEntity',
    'FieldTestInfiniteScrollEntity',
    'FieldTestPaginationEntity',
  ],
  sqllight,
  sql,
  sqlfull: [
    ...sql,
    'Place',
    'Division',

    'TestEntity',
    'TestMapstruct',
    'TestServiceClass',
    'TestServiceImpl',
    'TestInfiniteScroll',
    'TestPagination',
    'TestManyToOne',
    'TestManyToMany',
    'TestManyRelPaginDTO',
    'TestOneToOne',
    'TestCustomTableName',
    'TestTwoRelationshipsSameEntity',
    'SuperMegaLargeTestEntity',

    'MapsIdParentEntityWithoutDTO',
    'MapsIdChildEntityWithoutDTO',
    'MapsIdGrandchildEntityWithoutDTO',
    'MapsIdParentEntityWithDTO',
    'MapsIdChildEntityWithDTO',
    'MapsIdGrandchildEntityWithDTO',

    'JpaFilteringRelationship',
    'JpaFilteringOtherSide',
  ],
};

export default function copyEntitySamples(memFs: MemFsEditor, dest: string, type: string) {
  if (type === 'mongodb' || type === 'couchbase') {
    type = 'document';
  }
  const entitiesFolder = join(dest, '.jhipster');
  const entities = entitiesByType[type];
  for (const entity of entities) {
    memFs.copy(join(entitiesSamplesDir, `${entity}.json`), join(entitiesFolder, `${entity}.json`));
  }
}
