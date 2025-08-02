import { cpSync, mkdirSync } from 'fs';
import { join } from 'path';
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

export default function copyEntitySamples(dest: string, type: string) {
  if (type === 'mongodb' || type === 'couchbase') {
    type = 'document';
  }
  const entitiesFolder = join(dest, '.jhipster');
  mkdirSync(entitiesFolder, { recursive: true });
  const entities = entitiesByType[type];
  for (const entity of entities) {
    cpSync(join(entitiesSamplesDir, `${entity}.json`), join(entitiesFolder, `${entity}.json`));
  }
}
