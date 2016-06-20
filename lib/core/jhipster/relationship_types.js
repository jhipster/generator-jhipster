'use strict';

const _ = require('lodash');

const RELATIONSHIP_TYPES = {
  ONE_TO_ONE: 'OneToOne',
  ONE_TO_MANY: 'OneToMany',
  MANY_TO_ONE: 'ManyToOne',
  MANY_TO_MANY: 'ManyToMany'
};

function exists(relationship) {
  for (let definedRelationship in RELATIONSHIP_TYPES) {
    if (RELATIONSHIP_TYPES[definedRelationship] === _.upperFirst(_.camelCase(relationship))) {
      return true;
    }
  }
  return false;
}

module.exports = {
  RELATIONSHIP_TYPES: RELATIONSHIP_TYPES,
  exists: exists
};
