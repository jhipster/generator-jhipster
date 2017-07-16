

const JDLRelationship = require('./jdl_relationship');
const BuildException = require('../exceptions/exception_factory').BuildException;
const exceptions = require('../exceptions/exception_factory').exceptions;

class JDLRelationships {
  constructor() {
    this.relationships = {
      OneToOne: {},
      OneToMany: {},
      ManyToOne: {},
      ManyToMany: {}
    };
    this.size = 0;
  }

  add(relationship) {
    if (!relationship) {
      throw new BuildException(exceptions.NullPointer, 'A relationship must be passed.');
    }
    if (!JDLRelationship.isValid(relationship)) {
      throw new BuildException(exceptions.InvalidObject, 'A valid relationship must be passed.');
    }
    this.relationships[relationship.type][relationship.getId()] = relationship;
    this.size++;
  }

  toArray() {
    const relationships = [];
    Object.keys(this.relationships).forEach((type) => {
      Object.keys(this.relationships[type]).forEach((relationshipId) => {
        relationships.push(this.relationships[type][relationshipId]);
      });
    });
    return relationships;
  }

  toString() {
    let string = '';
    Object.keys(this.relationships).forEach((type) => {
      if (Object.keys(this.relationships[type]).length !== 0) {
        const result = relationshipTypeToString(this.relationships[type], type);
        string += `${result}\n`;
      }
    });
    return string.slice(0, string.length - 1);
  }
}

module.exports = JDLRelationships;

function relationshipTypeToString(relationships, type) {
  let relationship = `relationship ${type} {\n`;
  Object.keys(relationships).forEach((internalRelationship) => {
    let lines = relationships[internalRelationship].toString().split('\n');
    lines = lines.slice(1, lines.length - 1);
    relationship += `${lines.join('\n')},\n`;
  });
  relationship = `${relationship.slice(0, relationship.length - 2)}\n}`;
  return relationship;
}
