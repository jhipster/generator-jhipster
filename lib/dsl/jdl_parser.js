'use strict';

const _ = require('lodash'),
    JDLObject = require('../core/jdl_object'),
    JDLField = require('../core/jdl_field'),
    JDLValidation = require('../core/jdl_validation'),
    JDLUnaryOption = require('../core/jdl_unary_option'),
    JDLBinaryOption = require('../core/jdl_binary_option'),
    UnaryOptions = require('../core/jhipster/unary_options'),
    BinaryOptions = require('../core/jhipster/binary_options'),
    FieldTypes = require('../core/jhipster/field_types'),
    AbstractParser = require('../editors/abstract_parser'),
    parser_helper = require('../editors/parser_helper'),
    buildException = require('../exceptions/exception_factory').buildException,
    exceptions = require('../exceptions/exception_factory').exceptions;


let document;
let jdlObject = new JDLObject();
let isType;

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
  if (document) {
    resetState();
  }
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
      throw new buildException(
          exceptions.IllegalArgument,
          "The passed database type must either be 'sql', 'mongodb', or 'cassandra'");
  }
}

function fillEnums() {
  for (let i = 0; i < document.enums.length; i++) {
    jdlObject.addEnum({
      name: document.enums[i].name,
      values: document.enums[i].values
    });
  }
}

function fillClassesAndFields() {
  for (let i = 0; i < document.entities.length; i++) {
    jdlObject.addEntity({
      name: document.entities[i].name,
      tableName: document.entities[i].tableName,
      fields: getFields(document.entities[i]),
      comment: document.entities[i].javadoc
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
    if (jdlObject.enums[field.type] || isType(jdlObject.enums[field.type])) {
      let fieldName = _.lowerFirst(field.name);
      fields[fieldName] = new JDLField({
        name: fieldName,
        type: field.type,
        comment: field.javadoc,
        validations: getValidations(field)
      });
    } else {
      throw new buildException(exceptions.WrongType, `The type '${field.type}' doesn't exist.`);
    }
  }
  return fields;
}

function getValidations(field) {
  var validations = {};
  for (let i = 0; i < field.validations.length; i++) {
    if (!FieldTypes.hasValidation(field.type, field.validations[i].name)) {
      throw new buildException(
          exceptions.WrongValidation,
          `The validation '${field.validations[i]}' isn't supported for the type '${field.type}'.`);
    }
    if (!JDLValidation.isValid({
          name: field.validations[i].name,
          value: field.validations[i].value
        })) {
      throw new buildException(
          exceptions.InvalidObject,
          `The parsed validation is not valid, for name ${field.validations[i].name} and value ${field.validations[i].value}`);
    }
    validations[field.validations[i].name] = new JDLValidation({
      name: field.validations[i].name,
      value: field.validations[i].value
    });
  }
  return validations;
}

function fillAssociations() {
  for (let i = 0; i < document.relationships.length; i++) {
    let relationship = document.relationships[i];
    checkEntityDeclaration(relationship);
    jdlObject.addRelationship({
      from: _.upperFirst(relationship.from.name),
      to: _.upperFirst(relationship.to.name),
      type: relationship.cardinality,
      injectedFieldInFrom: relationship.from.injectedfield,
      injectedFieldInTo: relationship.to.injectedfield,
      commentInFrom: relationship.from.javadoc,
      commentInTo: relationship.to.javadoc
    });
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

function addDTO(value, document) {
  if (!document.dto.hasOwnProperty(value) || !JDLBinaryOption.isValid({
        name: BinaryOptions.BINARY_OPTIONS.DTO,
        value: value,
        entityNames: [],
        excludedNames: []
      })) {
    throw new buildException(exceptions.InvalidObject, `The parsed DTO option is not valid for value ${value}.`)
  }
  jdlObject.addOption(new JDLBinaryOption({
    name: BinaryOptions.BINARY_OPTIONS.DTO,
    value: value,
    entityNames: document.dto[value].list,
    excludedNames: document.dto[value].excluded
  }));
}
function addPagination(value, document) {
  if (!document.pagination.hasOwnProperty(value) || !JDLBinaryOption.isValid({
        name: BinaryOptions.BINARY_OPTIONS.PAGINATION,
        value: value,
        entityNames: [],
        excludedNames: []
      })) {
    throw new buildException(exceptions.InvalidObject, `The parsed pagination option is not valid for value ${value}.`)
  }
  jdlObject.addOption(new JDLBinaryOption({
    name: BinaryOptions.BINARY_OPTIONS.PAGINATION,
    value: value,
    entityNames: document.pagination[value].list,
    excludedNames: document.pagination[value].excluded
  }));
}
function addService(value, document) {
  if (!document.service.hasOwnProperty(value) || !JDLBinaryOption.isValid({
        name: BinaryOptions.BINARY_OPTIONS.SERVICE,
        value: value,
        entityNames: [],
        excludedNames: []
      })) {
    throw new buildException(exceptions.InvalidObject, `The parsed service option is not valid for value ${value}.`)
  }
  jdlObject.addOption(new JDLBinaryOption({
    name: BinaryOptions.BINARY_OPTIONS.SERVICE,
    value: value,
    entityNames: document.service[value].list,
    excludedNames: document.service[value].excluded
  }));
}
function addMicroservice(value, document) {
  if (!document.microservice.hasOwnProperty(value) || !JDLBinaryOption.isValid({
        name: BinaryOptions.BINARY_OPTIONS.MICROSERVICE,
        value: value,
        entityNames: [],
        excludedNames: []
      })) {
    throw new buildException(exceptions.InvalidObject, `The parsed microservice option is not valid for value ${value}.`)
  }
  jdlObject.addOption(new JDLBinaryOption({
    name: BinaryOptions.BINARY_OPTIONS.MICROSERVICE,
    value: value,
    entityNames: document.microservice[value].list,
    excludedNames: document.microservice[value].excluded
  }));
}
function addSearchEngine(value, document) {
  if (!document.searchEngine.hasOwnProperty(value) || !JDLBinaryOption.isValid({
        name: BinaryOptions.BINARY_OPTIONS.SEARCH_ENGINE,
        value: value,
        entityNames: [],
        excludedNames: []
      })) {
    throw new buildException(exceptions.InvalidObject, `The parsed search engine option is not valid for value ${value}.`)
  }
  jdlObject.addOption(new JDLBinaryOption({
    name: BinaryOptions.BINARY_OPTIONS.SEARCH_ENGINE,
    value: value,
    entityNames: document.searchEngine[value].list,
    excludedNames: document.searchEngine[value].excluded
  }));
}
function addAngularSuffix(value, document) {
  if (!document.angularSuffixes.hasOwnProperty(value) || !JDLBinaryOption.isValid({
        name: BinaryOptions.BINARY_OPTIONS.ANGULAR_SUFFIX,
        value: value,
        entityNames: [],
        excludedNames: []
      })) {
    throw new buildException(exceptions.InvalidObject, `The parsed angular suffix option is not valid for value ${value}.`)
  }
  jdlObject.addOption(new JDLBinaryOption({
    name: BinaryOptions.BINARY_OPTIONS.ANGULAR_SUFFIX,
    value: value,
    entityNames: document.angularSuffixes[value].list,
    excludedNames: document.angularSuffixes[value].excluded
  }));
}

function fillBinaryOptions() {
  for (let option in document.dto) {
    if (document.dto.hasOwnProperty(option)) {
      addDTO(option, document);
    }
  }
  for (let option in document.pagination) {
    if (document.pagination.hasOwnProperty(option)) {
      addPagination(option, document);
    }
  }
  for (let option in document.service) {
    if (document.service.hasOwnProperty(option)) {
      addService(option, document);
    }
  }
  for (let option in document.microservice) {
    if (document.microservice.hasOwnProperty(option)) {
      addMicroservice(option, document);
    }
  }
  for (let option in document.searchEngine) {
    if (document.searchEngine.hasOwnProperty(option)) {
      addSearchEngine(option, document);
    }
  }
  for (let option in document.angularSuffixes) {
    if (document.angularSuffixes.hasOwnProperty(option)) {
      addAngularSuffix(option, document);
    }
  }
}

function resetState() {
  document = null;
  isType = null;
  jdlObject = null;
}
