'use strict';

const _ = require('lodash'),
    JDLObject = require('../core/jdl_object'),
    JDLEnum = require('../core/jdl_enum'),
    JDLField = require('../core/jdl_field'),
    JDLRelationship = require('../core/jdl_relationship'),
    JDLValidation = require('../core/jdl_validation'),
    JDLUnaryOption = require('../core/jdl_unary_option'),
    JDLBinaryOption = require('../core/jdl_binary_option'),
    UnaryOptions = require('../core/jhipster/unary_options'),
    BinaryOptions = require('../core/jhipster/binary_options'),
    FieldTypes = require('../core/jhipster/field_types'),
    formatComment = require('../utils/format_utils').formatComment,
    buildException = require('../exceptions/exception_factory').buildException,
    exceptions = require('../exceptions/exception_factory').exceptions;

module.exports = {
  parse: parse
};

let document;
let jdlObject;
let isType;

/**
 * Convert the given intermediate object to JDLObject
 */
function parse(passedDocument, passedDatabaseType) {
  if (!passedDocument || !passedDatabaseType) {
    throw new buildException(exceptions.NullPointer, 'The parsed JDL content and the database type must be passed.');
  }
  init(passedDocument, passedDatabaseType);
  fillEnums();
  fillClassesAndFields();
  fillAssociations();
  fillOptions();
  return jdlObject;
}

function init(passedDocument, passedDatabaseType) {
  document = passedDocument;
  jdlObject = new JDLObject();
  switch (passedDatabaseType) {
    case 'sql':
      isType = FieldTypes.isSQLType;
      break;
    case 'mongodb':
      isType = FieldTypes.isMongoDBType;
      break;
    case 'cassandra':
      isType = FieldTypes.isCassandraType;
      break;
    default:
      isType = null;
      throw new buildException(
          exceptions.IllegalArgument,
          "The passed database type must either be 'sql', 'mongodb', or 'cassandra'");
  }
}

function fillEnums() {
  for (let i = 0; i < document.enums.length; i++) {
    jdlObject.addEnum(new JDLEnum({
      name: document.enums[i].name,
      values: document.enums[i].values,
      comment: formatComment(document.enums[i].javadoc)
    }));
  }
}

function fillClassesAndFields() {
  for (let i = 0; i < document.entities.length; i++) {
    jdlObject.addEntity({
      name: document.entities[i].name,
      tableName: document.entities[i].tableName,
      fields: getFields(document.entities[i]),
      comment: formatComment(document.entities[i].javadoc)
    });
  }
}

function getFields(entity) {
  var fields = {};
  for (let i = 0; i < entity.body.length; i++) {
    let field = entity.body[i];
    if (field.name.toLowerCase() === 'id') {
      continue;
    }
    if (jdlObject.enums[field.type] || isType(field.type)) {
      let fieldName = _.lowerFirst(field.name);
      let fieldObject = new JDLField({
        name: fieldName,
        type: field.type,
        validations: getValidations(field)
      });
      if (field.javadoc) {
        fieldObject.comment = formatComment(field.javadoc);
      }
      fields[fieldName] = fieldObject;
    } else {
      throw new buildException(exceptions.WrongType, `The type '${field.type}' doesn't exist.`);
    }
  }
  return fields;
}

function getValidations(field) {
  var validations = {};
  for (let i = 0; i < field.validations.length; i++) {
    if (!FieldTypes.hasValidation(field.type, field.validations[i].key)) {
      throw new buildException(
          exceptions.WrongValidation,
          `The validation '${field.validations[i]}' isn't supported for the type '${field.type}'.`);
    }
    let validation = new JDLValidation({
      name: field.validations[i].key,
      value: field.validations[i].value
    });
    if (!JDLValidation.isValid(validation)) {
      throw new buildException(
          exceptions.InvalidObject,
          `The parsed validation is not valid, for name ${field.validations[i].key} and value ${field.validations[i].value}`);
    }
    validations[field.validations[i].key] = validation;
  }
  return validations;
}

function fillAssociations() {
  for (let i = 0; i < document.relationships.length; i++) {
    let relationship = document.relationships[i];
    checkEntityDeclaration(relationship);
    jdlObject.addRelationship(new JDLRelationship({
      from: jdlObject.entities[relationship.from.name],
      to: jdlObject.entities[relationship.to.name],
      type: _.upperFirst(_.camelCase(relationship.cardinality)),
      injectedFieldInFrom: relationship.from.injectedfield,
      injectedFieldInTo: relationship.to.injectedfield,
      commentInFrom: formatComment(relationship.from.javadoc),
      commentInTo: formatComment(relationship.to.javadoc)
    }));
  }
}

function checkEntityDeclaration(relationship) {
  var absentEntities = [];

  if (!jdlObject.entities[relationship.from.name]) {
    absentEntities.push(relationship.from.name);
  }
  if (!jdlObject.entities[relationship.to.name]) {
    absentEntities.push(relationship.to.name);
  }
  if (absentEntities.length !== 0) {
    throw new buildException(
        exceptions.UndeclaredEntity,
        `In the relationship between ${relationship.from.name} and `
        + `${relationship.to.name}, ${absentEntities.join(' and ')} `
        + `${(absentEntities.length === 1 ? 'is' : 'are')} not declared.`
    );
  }
}

function fillOptions() {
  fillUnaryOptions();
  fillBinaryOptions();
}

function fillUnaryOptions() {
  if (document.noClient.list.length !== 0) {
    jdlObject.addOption(new JDLUnaryOption({
      name: UnaryOptions.UNARY_OPTIONS.SKIP_CLIENT,
      entityNames: document.noClient.list,
      excluded: document.noClient.excluded
    }));
  }
  if (document.noServer.list.length !== 0) {
    jdlObject.addOption(new JDLUnaryOption({
      name: UnaryOptions.UNARY_OPTIONS.SKIP_SERVER,
      entityNames: document.noServer.list,
      excluded: document.noServer.excluded
    }));
  }
}

function addOption(key, value) {
  let option = new JDLBinaryOption({
    name: key,
    value: value,
    entityNames: document[key][value].list,
    excludedNames: document[key][value].excluded
  });
  if (!document[key].hasOwnProperty(value) || !JDLBinaryOption.isValid(option)) {
    throw new buildException(exceptions.InvalidObject, `The parsed ${key} option is not valid for value ${value}.`)
  }
  jdlObject.addOption(option);
}

function fillBinaryOptions() {
  for (let option in document.dto) {
    if (document.dto.hasOwnProperty(option)) {
      addOption(BinaryOptions.BINARY_OPTIONS.DTO, option);
    }
  }
  for (let option in document.pagination) {
    if (document.pagination.hasOwnProperty(option)) {
      addOption(BinaryOptions.BINARY_OPTIONS.PAGINATION, option);
    }
  }
  for (let option in document.service) {
    if (document.service.hasOwnProperty(option)) {
      addOption(BinaryOptions.BINARY_OPTIONS.SERVICE, option);
    }
  }
  for (let option in document.microservice) {
    if (document.microservice.hasOwnProperty(option)) {
      addOption(BinaryOptions.BINARY_OPTIONS.MICROSERVICE, option);
    }
  }
  for (let option in document.searchEngine) {
    if (document.searchEngine.hasOwnProperty(option)) {
      addOption(BinaryOptions.BINARY_OPTIONS.SEARCH_ENGINE, option);
    }
  }
  for (let option in document.angularSuffix) {
    if (document.angularSuffix.hasOwnProperty(option)) {
      addOption(BinaryOptions.BINARY_OPTIONS.ANGULAR_SUFFIX, option);
    }
  }
}
