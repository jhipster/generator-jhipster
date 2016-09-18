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
    isReservedClassName = require('../core/jhipster/reserved_keywords').isReservedClassName,
    isReservedTableName = require('../core/jhipster/reserved_keywords').isReservedTableName,
    isReservedFieldName = require('../core/jhipster/reserved_keywords').isReservedFieldName,
    buildException = require('../exceptions/exception_factory').buildException,
    exceptions = require('../exceptions/exception_factory').exceptions;

module.exports = {
  parse: parse
};

const USER = 'User';

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
  fillClassesAndFields(passedDatabaseType);
  fillAssociations();
  fillOptions();
  return jdlObject;
}

function init(passedDocument, passedDatabaseType) {
  document = passedDocument;
  jdlObject = new JDLObject();
  isType = FieldTypes.getIsType(passedDatabaseType, function () {
    isType = null;
  });
}

function fillEnums() {
  for (let i = 0; i < document.enums.length; i++) {
    let enumObj = document.enums[i];
    if (isReservedClassName(enumObj.name)) {
      throw new buildException(
          exceptions.IllegalName,
          `The name '${enumObj.name}' is reserved keyword and can not be used as enum class name.`);
    }
    jdlObject.addEnum(new JDLEnum({
      name: enumObj.name,
      values: enumObj.values,
      comment: formatComment(enumObj.javadoc)
    }));
  }
}

function fillClassesAndFields(passedDatabaseType) {
  for (let i = 0; i < document.entities.length; i++) {
    let entity = document.entities[i];
    if (isReservedClassName(entity.name)) {
      throw new buildException(
          exceptions.IllegalName,
          `The name '${entity.name}' is reserved keyword and can not be used as entity class name.`);
    }
    let tableName = entity.tableName || entity.name;
    if (isReservedTableName(tableName, passedDatabaseType)) {
      throw new buildException(
          exceptions.IllegalName,
          `The name '${tableName}' is reserved keyword and can not be used as entity table name.`);
    }
    jdlObject.addEntity({
      name: entity.name,
      tableName: tableName,
      fields: getFields(entity, passedDatabaseType),
      comment: formatComment(entity.javadoc)
    });
  }

  let relationToUser = document.relationships.filter(function (val) {
    return val.to.name.toLowerCase() === USER.toLowerCase();
  });
  if (relationToUser && relationToUser.length && !jdlObject.entities[USER]) {
    jdlObject.addEntity({
      name: USER,
      tableName: 'jhi_user',
      fields: {}
    });
  }
}

function getFields(entity, passedDatabaseType) {
  var fields = {};
  for (let i = 0; i < entity.body.length; i++) {
    let field = entity.body[i];
    let fieldName = _.lowerFirst(field.name);
    if (fieldName.toLowerCase() === 'id') {
      continue;
    }
    if (isReservedFieldName(fieldName, passedDatabaseType)) {
      throw new buildException(
          exceptions.IllegalName,
          `The name '${fieldName}' is reserved keyword and can not be used as entity field name.`);
    }
    if (jdlObject.enums[field.type] || isType(field.type)) {
      let fieldObject = new JDLField({
        name: fieldName,
        type: field.type,
        validations: getValidations(field, jdlObject.enums[field.type])
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

function getValidations(field, isAnEnum) {
  var validations = {};
  for (let i = 0; i < field.validations.length; i++) {
    let validation = field.validations[i];
    if (!FieldTypes.hasValidation(field.type, validation.key, isAnEnum)) {
      throw new buildException(
          exceptions.WrongValidation,
          `The validation '${validation}' isn't supported for the type '${field.type}'.`);
    }
    validations[validation.key] = new JDLValidation({
      name: validation.key,
      value: validation.value
    });
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
      isInjectedFieldInFromRequired: relationship.from.required,
      isInjectedFieldInToRequired: relationship.to.required,
      commentInFrom: formatComment(relationship.from.javadoc),
      commentInTo: formatComment(relationship.to.javadoc)
    }));
  }
}

function checkEntityDeclaration(relationship) {
  var absentEntities = [];

  if (relationship.from.name.toLowerCase() === USER.toLowerCase()) {
    throw new buildException(
        exceptions.IllegalAssociation,
        `Relationships from User entity is not supported in the declaration between ${relationship.from.name} and `
        + `${relationship.to.name}.`
    );
  }
  if (!jdlObject.entities[relationship.from.name]) {
    absentEntities.push(relationship.from.name);
  }
  if (relationship.to.name.toLowerCase() !== USER.toLowerCase() && !jdlObject.entities[relationship.to.name]) {
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
      excludedNames: document.noClient.excluded
    }));
  }
  if (document.noServer.list.length !== 0) {
    jdlObject.addOption(new JDLUnaryOption({
      name: UnaryOptions.UNARY_OPTIONS.SKIP_SERVER,
      entityNames: document.noServer.list,
      excludedNames: document.noServer.excluded
    }));
  }
  if (document.noFluentMethod.list.length !== 0) {
    jdlObject.addOption(new JDLUnaryOption({
      name: UnaryOptions.UNARY_OPTIONS.NO_FLUENT_METHOD,
      entityNames: document.noFluentMethod.list,
      excludedNames: document.noFluentMethod.excluded
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
  Object.keys(BinaryOptions.BINARY_OPTIONS).forEach(function (key) {
    key = BinaryOptions.BINARY_OPTIONS[key];
    Object.keys(document[key]).forEach(function (option) {
      addOption(key, option);
    });
  });
}
