

const _ = require('lodash');
const JDLObject = require('../core/jdl_object');
const JDLEnum = require('../core/jdl_enum');
const JDLField = require('../core/jdl_field');
const JDLRelationship = require('../core/jdl_relationship');
const JDLValidation = require('../core/jdl_validation');
const JDLUnaryOption = require('../core/jdl_unary_option');
const JDLBinaryOption = require('../core/jdl_binary_option');
const UnaryOptions = require('../core/jhipster/unary_options');
const BinaryOptions = require('../core/jhipster/binary_options');
const FieldTypes = require('../core/jhipster/field_types');
const DatabaseTypes = require('../core/jhipster/database_types');
const formatComment = require('../utils/format_utils').formatComment;
const isReservedClassName = require('../core/jhipster/reserved_keywords').isReservedClassName;
const isReservedFieldName = require('../core/jhipster/reserved_keywords').isReservedFieldName;
const BuildException = require('../exceptions/exception_factory').BuildException;
const exceptions = require('../exceptions/exception_factory').exceptions;

module.exports = {
  parse
};

const USER = 'User';

let document;
let jdlObject;
let isType;

/**
 * Convert the given intermediate object to JDLObject
 */
function parse(passedDocument, passedDatabaseType, applicationType) {
  if (!passedDocument || !passedDatabaseType) {
    throw new BuildException(exceptions.NullPointer, 'The parsed JDL content and the database type must be passed.');
  }
  init(passedDocument, passedDatabaseType, applicationType);
  fillEnums();
  fillClassesAndFields(passedDatabaseType);
  fillAssociations();
  fillOptions(passedDatabaseType);
  return jdlObject;
}

function init(passedDocument, passedDatabaseType, applicationType) {
  document = passedDocument;
  jdlObject = new JDLObject();
  if (applicationType !== 'gateway') {
    isType = FieldTypes.getIsType(passedDatabaseType, () => { isType = null; });
  } else {
    isType = () => true;
  }
}

function fillEnums() {
  for (let i = 0; i < document.enums.length; i++) {
    const enumObj = document.enums[i];
    if (isReservedClassName(enumObj.name)) {
      throw new BuildException(
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
    const entity = document.entities[i];
    if (isReservedClassName(entity.name)) {
      throw new BuildException(
        exceptions.IllegalName,
        `The name '${entity.name}' is reserved keyword and can not be used as entity class name.`);
    }
    const tableName = entity.tableName || entity.name;
    jdlObject.addEntity({
      name: entity.name,
      tableName,
      fields: getFields(entity, passedDatabaseType),
      comment: formatComment(entity.javadoc)
    });
  }

  const relationToUser = document.relationships.filter(val => val.to.name.toLowerCase() === USER.toLowerCase());
  if (relationToUser && relationToUser.length && !jdlObject.entities[USER]) {
    jdlObject.addEntity({
      name: USER,
      tableName: 'jhi_user',
      fields: {}
    });
  }
}

function getFields(entity, passedDatabaseType) {
  const fields = {};
  for (let i = 0; i < entity.body.length; i++) {
    const field = entity.body[i];
    const fieldName = _.lowerFirst(field.name);
    if (fieldName.toLowerCase() === 'id') {
      continue; // eslint-disable-line no-continue
    }
    if (isReservedFieldName(fieldName)) {
      throw new BuildException(
        exceptions.IllegalName,
        `The name '${fieldName}' is a reserved keyword and can not be used as entity field name.`);
    }
    if (jdlObject.enums[field.type] || isType(field.type)) {
      const fieldObject = new JDLField({
        name: fieldName,
        type: field.type,
        validations: getValidations(field, jdlObject.enums[field.type])
      });
      if (field.javadoc) {
        fieldObject.comment = formatComment(field.javadoc);
      }
      fields[fieldName] = fieldObject;
    } else {
      throw new BuildException(exceptions.WrongType, `The type '${field.type}' doesn't exist for ${passedDatabaseType}.`);
    }
  }
  return fields;
}

function getValidations(field, isAnEnum) {
  const validations = {};
  for (let i = 0; i < field.validations.length; i++) {
    const validation = field.validations[i];
    if (!FieldTypes.hasValidation(field.type, validation.key, isAnEnum)) {
      throw new BuildException(
        exceptions.WrongValidation,
        `The validation '${validation.key}' isn't supported for the type '${field.type}'.`);
    }
    if (validation.constant) {
      validation.value = document.constants[validation.value];
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
    const relationship = document.relationships[i];
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
  const absentEntities = [];

  if (relationship.from.name.toLowerCase() === USER.toLowerCase()) {
    throw new BuildException(
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
    throw new BuildException(
      exceptions.UndeclaredEntity,
      `In the relationship between ${relationship.from.name} and `
      + `${relationship.to.name}, ${absentEntities.join(' and ')} `
      + `${(absentEntities.length === 1 ? 'is' : 'are')} not declared.`
    );
  }
}

function fillOptions(passedDatabaseType) {
  fillUnaryOptions();
  fillBinaryOptions(passedDatabaseType);
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
  const option = new JDLBinaryOption({
    name: key,
    value,
    entityNames: document[key][value].list,
    excludedNames: document[key][value].excluded
  });
  if (document[key].value !== undefined || !JDLBinaryOption.isValid(option)) {
    throw new BuildException(
      exceptions.InvalidObject,
      `The parsed ${key} option is not valid for value ${value}.`);
  }
  jdlObject.addOption(option);
}

function fillBinaryOptions(passedDatabaseType) {
  _.forEach(BinaryOptions.BINARY_OPTIONS, (optionValue) => {
    _.forEach(document[optionValue], (documentOptionValue, documentOptionKey) => {
      if (optionValue === BinaryOptions.BINARY_OPTIONS.PAGINATION
        && passedDatabaseType === DatabaseTypes.Types.cassandra) {
        throw new BuildException(exceptions.IllegalOption, 'Pagination isn\'t allowed when the app uses Cassandra.');
      }
      addOption(optionValue, documentOptionKey);
    });
  });
}
