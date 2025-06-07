import { fieldTypes } from '../../jhipster/index.js';
import type { Entity } from '../../jhipster/types/entity.js';

const {
  CommonDBTypes: { UUID },
} = fieldTypes;

export const entitySimple = {
  name: 'Simple',
  changelogDate: '20220129000100',
  jpaMetamodelFiltering: true,
  fields: [{ fieldName: 'simpleName', fieldType: 'String' }],
} satisfies Entity;

export const entityAnotherSimple = {
  name: 'AnotherSimple',
  changelogDate: '20220129000200',
  fields: [{ fieldName: 'simpleName', fieldType: 'String' }],
  dto: 'mapstruct',
  service: 'serviceImpl',
  pagination: 'pagination',
  clientRootFolder: 'test-root',
} satisfies Entity;

export const entitiesSimple = [entitySimple, entityAnotherSimple] satisfies Entity[];

export const entitiesWithRelationships = [
  entitySimple,
  entityAnotherSimple,
  {
    name: 'RelationshipWithSimple',
    changelogDate: '20220129001000',
    fields: [{ fieldName: 'twoName', fieldType: 'String' }],
    relationships: [{ relationshipName: 'relationship', otherEntityName: 'Simple', relationshipType: 'many-to-one' }],
  },
] satisfies Entity[];

export const entityCustomId = {
  name: 'EntityWithCustomId',
  changelogDate: '20220129002000',
  entityPackage: 'custom',
  fields: [
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
  fields: [{ fieldName: 'simpleName', fieldType: 'String' }],
  microserviceName: 'microservice1',
  service: 'serviceClass',
  pagination: 'infinite-scroll',
} satisfies Entity;

export const entitySkipClient = {
  name: 'SkipClient',
  changelogDate: '20220129000400',
  skipClient: true,
  fields: [{ fieldName: 'skipClientName', fieldType: 'String' }],
} satisfies Entity;

export const entitiesServerSamples = [entitySimple, entityAnotherSimple, entityCustomId, entitiesMicroservice] satisfies Entity[];

export const entitiesClientSamples = [entitySimple, entityCustomId, entitiesMicroservice, entitySkipClient] satisfies Entity[];
