import { fieldTypes } from '../../jhipster/index.js';
import type { Entity } from '../../types/base/entity.js';

const {
  CommonDBTypes: { UUID },
} = fieldTypes;

export const entitySimple = {
  name: 'Simple',
  changelogDate: '20220129000100',
  jpaMetamodelFiltering: true,
  // @ts-ignore
  fields: [{ fieldName: 'simpleName', fieldType: 'String' }],
} satisfies Entity;

export const entityAnotherSimple = {
  name: 'AnotherSimple',
  changelogDate: '20220129000200',
  // @ts-ignore
  fields: [{ fieldName: 'simpleName', fieldType: 'String' }],
  dto: 'mapstruct',
  service: 'serviceImpl',
  pagination: 'pagination',
  clientRootFolder: 'test-root',
} satisfies Entity;

// @ts-ignore
export const entitiesSimple = [entitySimple, entityAnotherSimple] satisfies Entity[];

export const entitiesWithRelationships = [
  // @ts-ignore
  entitySimple,
  // @ts-ignore
  entityAnotherSimple,
  {
    name: 'RelationshipWithSimple',
    changelogDate: '20220129001000',
    // @ts-ignore
    fields: [{ fieldName: 'twoName', fieldType: 'String' }],
    // @ts-ignore
    relationships: [{ relationshipName: 'relationship', otherEntityName: 'Simple', relationshipType: 'many-to-one' }],
  },
] satisfies Entity[];

export const entityCustomId = {
  name: 'EntityWithCustomId',
  changelogDate: '20220129002000',
  entityPackage: 'custom',
  fields: [
    // @ts-ignore
    {
      fieldName: 'id',
      fieldType: UUID,
    },
  ],
} satisfies Entity;

export const entitiesMicroservice = {
  name: 'Microservice',
  skipFakeData: true,
  changelogDate: '20220129000300',
  // @ts-ignore
  fields: [{ fieldName: 'simpleName', fieldType: 'String' }],
  microserviceName: 'microservice1',
  service: 'serviceClass',
  pagination: 'infinite-scroll',
} satisfies Entity;

export const entitySkipClient = {
  name: 'SkipClient',
  changelogDate: '20220129000400',
  skipClient: true,
  // @ts-ignore
  fields: [{ fieldName: 'skipClientName', fieldType: 'String' }],
} satisfies Entity;

// @ts-ignore
export const entitiesServerSamples = [entitySimple, entityAnotherSimple, entityCustomId, entitiesMicroservice] satisfies Entity[];

// @ts-ignore
export const entitiesClientSamples = [entitySimple, entityCustomId, entitiesMicroservice, entitySkipClient] satisfies Entity[];
