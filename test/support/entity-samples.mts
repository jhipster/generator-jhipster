import fieldTypes from '../../jdl/jhipster/field-types.js';

const {
  CommonDBTypes: { UUID },
} = fieldTypes;

export const entitySimple = {
  name: 'Simple',
  changelogDate: '20220129000100',
  fields: [{ fieldName: 'simpleName', fieldType: 'String' }],
};

export const entityAnotherSimple = {
  name: 'AnotherSimple',
  changelogDate: '20220129000200',
  fields: [{ fieldName: 'simpleName', fieldType: 'String' }],
  dto: 'mapstruct',
  service: 'serviceImpl',
  pagination: 'pagination',
  clientRootFolder: 'test-root',
};

export const entitiesSimple = [entitySimple, entityAnotherSimple];

export const entitiesWithRelationships = [
  entitySimple,
  entityAnotherSimple,
  {
    name: 'RelationshipWithSimple',
    changelogDate: '20220129001000',
    fields: [{ fieldName: 'twoName', fieldType: 'String' }],
    relationships: [{ relationshipName: 'relationship', otherEntityName: 'Simple', relationshipType: 'many-to-one' }],
  },
];

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
};

export const entitiesMicroservice = {
  name: 'Microservice',
  skipFakeData: true,
  changelogDate: '20220129000300',
  fields: [{ fieldName: 'simpleName', fieldType: 'String' }],
  microserviceName: 'microservice1',
  service: 'service',
  pagination: 'infiniscroll',
};

export const entitiesServerSamples = [entitySimple, entityCustomId, entitiesMicroservice];
