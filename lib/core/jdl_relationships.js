'use strict';

const JDLRelationship = require('./jdl_relationship'),
    buildException = require('../exceptions/exception_factory').buildException,
    exceptions = require('../exceptions/exception_factory').exceptions;

class JDLRelationships {
  constructor() {
    this.relationships = {
      OneToOne: [],
      OneToMany: [],
      ManyToOne: [],
      ManyToMany: []
    };
  }

  add(relationship) {
    if (!relationship) {
      throw new buildException(exceptions.NullPointer, 'A relationship must be passed.');
    }
    if (!JDLRelationship.isValid(relationship)) {
      throw new buildException(exceptions.InvalidObject, 'A valid relationship must be passed.');
    }
    this.relationships[relationship.type].push(relationship);
  }

  toString() {
    var string = '';
    for (let type in this.relationships) {
      if (this.relationships[type].length !== 0) {
        let result = relationshipTypeToString(this.relationships[type], type);
        string += `${result}\n`;
      }
    }
    return string.slice(0, string.length - 1);
  }
}

module.exports = JDLRelationships;

function relationshipTypeToString(array, type) {
  let relationship = `relationship ${type} {\n`;
  for (let i = 0; i < array.length; i++) {
    let lines = array[i].toString().split('\n');
    lines = lines.slice(1, lines.length - 1);
    relationship += `${lines.join('')},\n`;
  }
  relationship = `${relationship.slice(0, relationship.length - 2)}\n}`;
  return relationship;
}
