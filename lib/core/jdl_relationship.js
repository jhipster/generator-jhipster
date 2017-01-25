'use strict';
const merge = require('../utils/object_utils').merge,
  _ = require('lodash'),
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
    this.isInjectedFieldInFromRequired = merged.isInjectedFieldInFromRequired;
    this.isInjectedFieldInToRequired = merged.isInjectedFieldInToRequired;
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
    return `${this.type}_${this.from.name}${(this.injectedFieldInFrom) ? `{${this.injectedFieldInFrom}}` : ''}`
      + `_${this.to.name}${(this.injectedFieldInTo) ? `{${this.injectedFieldInTo}}` : ''}`;
  }

  /**
   * Checks the validity of the relationship.
   * @throws InvalidObjectException if the association is invalid.
   * @throws MalformedAssociation if the association type is incompatible with its data.
   * @throws WrongAssociationException if the association doesn't exist.
   */
  validate() {
    if (!JDLRelationship.isValid(this)) {
      throw new buildException(exceptions.InvalidObject, 'The exception is not in a valid state.');
    }
    checkRelationshipType(this);
  }

  toString() {
    var string = `relationship ${this.type} {\n  `;
    if (this.commentInFrom) {
      string += `/**\n${this.commentInFrom.split('\n').map(line => `   * ${line}\n`).join('')}   */\n  `;
    }
    string += `${this.from.name}`;
    if (this.injectedFieldInFrom) {
      string += `{${this.injectedFieldInFrom}${this.isInjectedFieldInFromRequired ? ' required' : ''}}`;
    }
    string += ' to';
    if (this.commentInTo) {
      string += `\n  /**\n${this.commentInTo.split('\n').map(line => `   * ${line}\n`).join('')}   */\n  `;
    } else {
      string += ' ';
    }
    string += `${this.to.name}`;
    if (this.injectedFieldInTo) {
      string += `{${this.injectedFieldInTo}${this.isInjectedFieldInToRequired ? ' required' : ''}}`;
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
    isInjectedFieldInFromRequired: false,
    isInjectedFieldInToRequired: false,
    commentInFrom: '',
    commentInTo: ''
  };
}
function checkRelationshipType(relationship) {
  switch (relationship.type) {
  case RELATIONSHIP_TYPES.ONE_TO_ONE:
    if (!relationship.injectedFieldInFrom) {
      throw new buildException(
        exceptions.MalformedAssociation,
        `In the One-to-One relationship from ${relationship.from.name} to ${relationship.to.name}, `
        + 'the source entity must possess the destination in a One-to-One '
        + ' relationship, or you must invert the direction of the relationship.');
    }
    break;
  case RELATIONSHIP_TYPES.ONE_TO_MANY:
    if (!relationship.injectedFieldInFrom || !relationship.injectedFieldInTo) {
      console.warn(
        `In the One-to-Many relationship from ${relationship.from.name} to ${relationship.to.name}, `
        + 'only bidirectionality is supported for a One-to-Many association. '
        + 'The other side will be automatically added.');
      addMissingSide(relationship);
    }
    break;
  case RELATIONSHIP_TYPES.MANY_TO_ONE:
    if (relationship.injectedFieldInFrom && relationship.injectedFieldInTo) {
      throw new buildException(
        exceptions.MalformedAssociation,
        `In the Many-to-One relationship from ${relationship.from.name} to ${relationship.to.name}, `
        + 'only unidirectionality is supported for a Many-to-One relationship, '
        + 'you should create a bidirectional One-to-Many relationship instead.');
    }
    break;
  case RELATIONSHIP_TYPES.MANY_TO_MANY:
    if (!relationship.injectedFieldInFrom || !relationship.injectedFieldInTo) {
      throw new buildException(
        exceptions.MalformedAssociation,
        `In the Many-to-Many relationship from ${relationship.from.name} to ${relationship.to.name}, `
        + 'only bidirectionality is supported for a Many-to-Many relationship.');
    }
    break;
  default: // never happens, ever.
    throw new buildException(
      exceptions.Assertion,
      `This case shouldn't have happened with type ${relationship.type}.`);
  }
}
function addMissingSide(relationship) {
  if (!relationship.injectedFieldInFrom) {
    relationship.injectedFieldInFrom = _.lowerFirst(relationship.to.name);
    return;
  }
  relationship.injectedFieldInTo = _.lowerFirst(relationship.from.name);
}
