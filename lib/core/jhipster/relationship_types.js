

const _ = require('lodash');

const RELATIONSHIP_TYPES = {
  ONE_TO_ONE: 'OneToOne',
  ONE_TO_MANY: 'OneToMany',
  MANY_TO_ONE: 'ManyToOne',
  MANY_TO_MANY: 'ManyToMany'
};

function exists(relationship) {
  return Object.keys(RELATIONSHIP_TYPES).map(key => RELATIONSHIP_TYPES[key]).includes(_.upperFirst(_.camelCase(relationship)));
}

module.exports = {
  RELATIONSHIP_TYPES,
  exists
};
