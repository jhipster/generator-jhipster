'use strict';

const JDLRelationship = require('./jdl_relationship'),
    buildException = require('../exceptions/exception_factory').buildException,
    exceptions = require('../exceptions/exception_factory').exceptions;

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
      throw new buildException(exceptions.NullPointer, 'A relationship must be passed.');
    }
    if (!JDLRelationship.isValid(relationship)) {
      throw new buildException(exceptions.InvalidObject, 'A valid relationship must be passed.');
    }
    this.relationships[relationship.type][relationship.getId()] = relationship;
    this.size++;
  }

  toArray() {
    let relationships = [];
    for (let type in this.relationships) {
      if (this.relationships.hasOwnProperty(type)) {
        for (let relationshipId in this.relationships[type]) {
          if (this.relationships[type].hasOwnProperty(relationshipId)) {
            relationships.push(this.relationships[type][relationshipId]);
          }
        }
      }
    }
    return relationships;
  }

  toString() {
    var string = '';
    for (let type in this.relationships) {
      if (this.relationships.hasOwnProperty(type) && Object.keys(this.relationships[type]).length !== 0) {
        let result = relationshipTypeToString(this.relationships[type], type);
        string += `${result}\n`;
      }
    }
    return string.slice(0, string.length - 1);
  }
}

module.exports = JDLRelationships;

function relationshipTypeToString(relationships, type) {
  let relationship = `relationship ${type} {\n`;
  for (let internalRelationship in relationships) {
    if (relationships.hasOwnProperty(internalRelationship)) {
      let lines = relationships[internalRelationship].toString().split('\n');
      lines = lines.slice(1, lines.length - 1);
      relationship += `${lines.join('')},\n`;
    }
  }
  relationship = `${relationship.slice(0, relationship.length - 2)}\n}`;
  return relationship;
}
