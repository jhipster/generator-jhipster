'use strict';

const merge = require('../utils/object_utils').merge,
    isNilOrEmpty = require('../utils/string_utils').isNilOrEmpty,
    buildException = require('../exceptions/exception_factory').buildException,
    exceptions = require('../exceptions/exception_factory').exceptions,
    JDLEntity = require('./jdl_entity'),
    RELATIONSHIP_TYPES = require('./jhipster/relationship_types').RELATIONSHIP_TYPES,
    exists = require('./jhipster/relationship_types').exists;

class JDLRelationship {
  constructor(args) {
    var merged = merge(defaults(), args);
    if (!JDLEntity.isValid(merged.from) || !JDLEntity.isValid(merged.to)) {
      throw new buildException(exceptions.InvalidObject, 'Valid source and destination entities are required.');
    }
    if (!exists(merged.type) || !(merged.injectedFieldInFrom || merged.injectedFieldInTo)) {
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
    return relationship != null && exists(relationship.type)
        && 'from' in relationship && JDLEntity.isValid(relationship.from)
        && 'to' in relationship && JDLEntity.isValid(relationship.to)
        && (('injectedFieldInFrom' in relationship && relationship.injectedFieldInFrom != null)
        || ('injectedFieldInTo' in relationship && relationship.injectedFieldInTo != null));
  }

  /**
   * Returns a constructed ID representing this relationship.
   * @return {String} the relationship's id.
   */
  getId() {
    return `${this.type}_${this.from.name}${(this.injectedFieldInFrom) ? `{${this.injectedFieldInFrom}}` : ''}_${this.to.name}${(this.injectedFieldInTo) ? `${this.injectedFieldInTo}` : ''}`;
  }

  toString() {
    var string = `relationship ${this.type} {\n  `;
    if (this.commentInFrom) {
      string += `/**
   * ${this.commentInFrom}
   */\n  `;
    }
    string += `${this.from.name}`;
    if (this.injectedFieldInFrom) {
      string += `{${this.injectedFieldInFrom}}`
    }
    string += ' to';
    if (this.commentInTo) {
      string += `
  /**
   * ${this.commentInTo}
   */\n  `;
    } else {
      string += ' ';
    }
    string += `${this.to.name}`;
    if (this.injectedFieldInTo) {
      string += `{${this.injectedFieldInTo}}`;
    }
    string += '\n}';
    return string;
  }
}

module.exports = JDLRelationship;

function defaults() {
  return {
    type: RELATIONSHIP_TYPES.ONE_TO_ONE,
    injectedFieldInFrom: null,
    injectedFieldInTo: null,
    commentInFrom: '',
    commentInTo: ''
  };
}
