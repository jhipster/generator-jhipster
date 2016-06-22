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
  }

  add(relationship) {
    if (!relationship) {
      throw new buildException(exceptions.NullPointer, 'A relationship must be passed.');
    }
    if (!JDLRelationship.isValid(relationship)) {
      throw new buildException(exceptions.InvalidObject, 'A valid relationship must be passed.');
    }
    this.relationships[relationship.type][relationship.getId()] = relationship;
  }

  getAll() {
    let relationships = [];
    Object.keys(this.relationships).forEach(function (relType) {
      Object.keys(this.relationships[relType]).forEach(function (relId) {
        relationships.push(this.relationships[relType][relId]);
      }, this);
    }, this);
    return relationships;
  }

  size() {
    let ln = 0;
    Object.keys(this.relationships).forEach(function (relType) {
      ln += Object.keys(relType).length;
    });
    return ln;
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
