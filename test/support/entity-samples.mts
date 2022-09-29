import { CommonDBTypes } from '../../jdl/jhipster/field-types.js';

const { UUID } = CommonDBTypes;

export const entitySimple = {
  name: 'Simple',
  changelogDate: '20220129000100',
  fields: [{ fieldName: 'simpleName', fieldType: 'String' }],
};

export const entityAnotherSimple = {
  name: 'AnotherSimple',
  changelogDate: '20220129000200',
  fields: [{ fieldName: 'simpleName', fieldType: 'String' }],
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

export const entitiesCustomId = [
  {
    name: 'EntityWithCustomId',
    changelogDate: '20220129002000',
    fields: [
      {
        fieldName: 'id',
        fieldType: UUID,
      },
    ],
  },
];
