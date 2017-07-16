

const merge = require('../utils/object_utils').merge;
const _ = require('lodash');
const BuildException = require('../exceptions/exception_factory').BuildException;
const exceptions = require('../exceptions/exception_factory').exceptions;
const ErrorCases = require('../exceptions/error_cases').ErrorCases;
const JDLEntity = require('./jdl_entity');
const RELATIONSHIP_TYPES = require('./jhipster/relationship_types').RELATIONSHIP_TYPES;
const exists = require('./jhipster/relationship_types').exists;

class JDLRelationship {
  constructor(args) {
    const merged = merge(defaults(), args);
    if (!JDLEntity.isValid(merged.from) || !JDLEntity.isValid(merged.to)) {
      throw new BuildException(exceptions.InvalidObject, 'Valid source and destination entities are required.');
    }
    if (!exists(merged.type) || !(merged.injectedFieldInFrom || merged.injectedFieldInTo)) {
      throw new BuildException(exceptions.NullPointer, 'The type, and at least one injected field must be passed.');
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

  static checkValidity(relationship) {
    const errors = [];
    if (!relationship) {
      errors.push(ErrorCases.relationships.NoRelationship);
      return errors;
    }
    if (!exists(relationship.type)) {
      errors.push(`${ErrorCases.relationships.WrongType}: got '${relationship.type}'`);
    }
    const sourceEntityErrors = JDLEntity.checkValidity(relationship.from);
    if (sourceEntityErrors.length !== 0) {
      errors.push(`${ErrorCases.relationships.WrongFromSide}: ${sourceEntityErrors.join(', ')}`);
    }
    const destinationEntityErrors = JDLEntity.checkValidity(relationship.to);
    if (destinationEntityErrors.length !== 0) {
      errors.push(`${ErrorCases.relationships.WrongToSide}: ${destinationEntityErrors.join(', ')}`);
    }
    if (!relationship.injectedFieldInFrom && !relationship.injectedFieldInTo) {
      errors.push(ErrorCases.relationships.DeclarationError);
    }
    return errors;
  }

  static isValid(relationship) {
    const errors = this.checkValidity(relationship);
    return errors.length === 0;
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
    const errors = JDLRelationship.checkValidity(this);
    if (errors.length !== 0) {
      throw new BuildException(
        exceptions.InvalidObject,
        `The exception is not in a valid state.\nErrors: ${errors.join(', ')}.`);
    }
    checkRelationshipType(this);
  }

  toString() {
    let string = `relationship ${this.type} {\n  `;
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
      throw new BuildException(
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
      throw new BuildException(
        exceptions.MalformedAssociation,
        `In the Many-to-One relationship from ${relationship.from.name} to ${relationship.to.name}, `
        + 'only unidirectionality is supported for a Many-to-One relationship, '
        + 'you should create a bidirectional One-to-Many relationship instead.');
    }
    break;
  case RELATIONSHIP_TYPES.MANY_TO_MANY:
    if (!relationship.injectedFieldInFrom || !relationship.injectedFieldInTo) {
      throw new BuildException(
        exceptions.MalformedAssociation,
        `In the Many-to-Many relationship from ${relationship.from.name} to ${relationship.to.name}, `
        + 'only bidirectionality is supported for a Many-to-Many relationship.');
    }
    break;
  default: // never happens, ever.
    throw new BuildException(
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
