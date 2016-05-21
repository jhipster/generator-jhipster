'use strict';

const merge = require('../utils/object_utils').merge,
    isNilOrEmpty = require('../utils/string_utils').isNilOrEmpty,
    buildException = require('../exceptions/exception_factory').buildException,
    exceptions = require('../exceptions/exception_factory').exceptions,
    JDLEntity = require('./jdl_entity');

const TYPES = {
  OneToOne: 'OneToOne',
  OneToMany: 'OneToMany',
  ManyToOne: 'ManyToOne',
  ManyToMany: 'ManyToMany'
};

class JDLRelationship {
  constructor(args) {
    var merged = merge(defaults(), args);
    if (!JDLEntity.isValid(merged.from) || !JDLEntity.isValid(merged.to)) {
      throw new buildException(exceptions.InvalidObject, 'Valid source and destination entities are required.');
    }
    if (!(merged.type in TYPES) || !(merged.injectedFieldInFrom || merged.injectedFieldInTo)) {
      throw new buildException(exceptions.NullPointer, 'The type, and at least one injected field must be passed.');
    }
    this.from = merged.from;
    this.to = merged.to;
    this.type = merged.type;
    this.injectedFieldInFrom = merged.injectedFieldInFrom;
    this.injectedFieldInTo = merged.injectedFieldInTo;
    this.commentInFrom = merged.commentInFrom;
    this.commentInTo = merged.commentInTo;
  }

  static isValid(relationship) {
    return relationship != null && relationship.type in TYPES
        && 'from' in relationship && JDLEntity.isValid(relationship.from)
        && 'to' in relationship && JDLEntity.isValid(relationship.to)
        && (('injectedFieldInFrom' in relationship && relationship.injectedFieldInFrom != null)
        || ('injectedFieldInTo' in relationship && relationship.injectedFieldInTo != null));
  }

  toString() {
    var string = `relationship ${this.type} {\n  ${this.from.name}`;
    if (this.injectedFieldInFrom) {
      string += `{${this.injectedFieldInFrom}}`
    }
    string += `} to ${this.to.name}`;
    if (this.injectedFieldInTo) {
      string += `{${this.injectedFieldInTo}\n`;
    }
    string += '}';
    return string;
  }
}

module.exports = {
  JDLRelationship: JDLRelationship,
  RelationshipTypes: TYPES
};

function defaults() {
  return {
    type: TYPES.OneToOne,
    injectedFieldInFrom: null,
    injectedFieldInTo: null,
    commentInFrom: '',
    commentInTo: ''
  };
}
