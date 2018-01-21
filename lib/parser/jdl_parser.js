/**
 * Copyright 2013-2018 the original author or authors from the JHipster project.
 *
 * This file is part of the JHipster project, see http://www.jhipster.tech/
 * for more information.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *      http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

const _ = require('lodash');
const JDLObject = require('../core/jdl_object');
const JDLEnum = require('../core/jdl_enum');
const JDLField = require('../core/jdl_field');
const JDLRelationship = require('../core/jdl_relationship');
const JDLValidation = require('../core/jdl_validation');
const JDLUnaryOption = require('../core/jdl_unary_option');
const JDLBinaryOption = require('../core/jdl_binary_option');
const ApplicationTypes = require('../core/jhipster/application_types').APPLICATION_TYPES;
const UnaryOptions = require('../core/jhipster/unary_options');
const BinaryOptions = require('../core/jhipster/binary_options');
const FieldTypes = require('../core/jhipster/field_types');
const DatabaseTypes = require('../core/jhipster/database_types');
const formatComment = require('../utils/format_utils').formatComment;
const BuildException = require('../exceptions/exception_factory').BuildException;
const exceptions = require('../exceptions/exception_factory').exceptions;
const ReservedKeyWords = require('../core/jhipster/reserved_keywords');
const DeprecationUtils = require('../utils/deprecation_utils');

const isReservedClassName = ReservedKeyWords.isReservedClassName;
const isReservedTableName = ReservedKeyWords.isReservedTableName;
const isReservedFieldName = ReservedKeyWords.isReservedFieldName;


module.exports = {
  parse,
  parseFromConfigurationObject
};

const USER = 'User';

let configuration;
let jdlObject;
let isType;

/**
 * Converts the given intermediate document to a JDLObject.
 * @deprecated Use JDLParser::parseFromConfigurationObject instead
 */
function parse(document, databaseType, applicationType, applicationName) {
  DeprecationUtils.displayMethodDeprecationMessage({
    deprecatedMethod: 'JDLParser::parse',
    preferredMethod: 'JDLParser::parseFromConfigurationObject'
  });
  return parseFromConfigurationObject({
    document,
    databaseType,
    applicationType,
    applicationName
  });
}

/**
 * Converts the intermediate document to a JDLObject from a configuration object.
 * @param configuration The configuration object, keys:
 *        - document
 *        - databaseType
 *        - applicationType
 *        - applicationName
 */
function parseFromConfigurationObject(configuration) {
  if (!configuration.document || !configuration.databaseType) {
    throw new BuildException(exceptions.NullPointer, 'The parsed JDL content and the database type must be passed.');
  }
  init(configuration);
  fillEnums();
  fillClassesAndFields();
  fillAssociations();
  fillOptions();
  return jdlObject;
}

function init(passedConfiguration) {
  configuration = passedConfiguration;
  jdlObject = new JDLObject();
  if (configuration.applicationType !== 'gateway') {
    isType = FieldTypes.getIsType(configuration.databaseType, () => { isType = null; });
  } else {
    isType = () => true;
  }
}

function fillEnums() {
  for (let i = 0; i < configuration.document.enums.length; i++) {
    const enumObj = configuration.document.enums[i];
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

function fillClassesAndFields() {
  for (let i = 0; i < configuration.document.entities.length; i++) {
    const entity = configuration.document.entities[i];
    if (isReservedClassName(entity.name)) {
      throw new BuildException(
        exceptions.IllegalName,
        `The name '${entity.name}' is a reserved keyword and can not be used as entity class name.`);
    }
    if (isReservedTableName(entity.tableName, configuration.databaseType)) {
      throw new BuildException(
        exceptions.IllegalName,
        `The name '${entity.tableName}' is a reserved keyword and can not be used as an entity table name.`);
    }
    const tableName = entity.tableName || entity.name;
    jdlObject.addEntity({
      name: entity.name,
      tableName,
      fields: getFields(entity),
      comment: formatComment(entity.javadoc)
    });
  }

  const relationToUser = configuration.document.relationships.filter(
    val => val.to.name.toLowerCase() === USER.toLowerCase());
  if (relationToUser && relationToUser.length && !jdlObject.entities[USER]) {
    jdlObject.addEntity({
      name: USER,
      tableName: 'jhi_user',
      fields: {}
    });
  }
}

function getFields(entity) {
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
      throw new BuildException(
        exceptions.WrongType,
        `The type '${field.type}' doesn't exist for ${configuration.databaseType}.`);
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
      validation.value = configuration.document.constants[validation.value];
    }
    validations[validation.key] = new JDLValidation({
      name: validation.key,
      value: validation.value
    });
  }
  return validations;
}

function fillAssociations() {
  for (let i = 0; i < configuration.document.relationships.length; i++) {
    const relationship = configuration.document.relationships[i];
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

function fillOptions() {
  fillUnaryOptions();
  fillBinaryOptions();
  if (configuration.applicationType === ApplicationTypes.MICROSERVICE
      && Object.keys(configuration.document.microservice).length === 0) {
    globallyAddMicroserviceOption(configuration.applicationName);
  }
}

function globallyAddMicroserviceOption(applicationName) {
  jdlObject.addOption(new JDLBinaryOption({
    name: BinaryOptions.BINARY_OPTIONS.MICROSERVICE,
    value: applicationName,
    entityNames: configuration.document.entities.map(entity => entity.name)
  }));
}

function fillUnaryOptions() {
  if (configuration.document.noClient.list.length !== 0) {
    jdlObject.addOption(new JDLUnaryOption({
      name: UnaryOptions.UNARY_OPTIONS.SKIP_CLIENT,
      entityNames: configuration.document.noClient.list,
      excludedNames: configuration.document.noClient.excluded
    }));
  }
  if (configuration.document.noServer.list.length !== 0) {
    jdlObject.addOption(new JDLUnaryOption({
      name: UnaryOptions.UNARY_OPTIONS.SKIP_SERVER,
      entityNames: configuration.document.noServer.list,
      excludedNames: configuration.document.noServer.excluded
    }));
  }
  if (configuration.document.noFluentMethod.list.length !== 0) {
    jdlObject.addOption(new JDLUnaryOption({
      name: UnaryOptions.UNARY_OPTIONS.NO_FLUENT_METHOD,
      entityNames: configuration.document.noFluentMethod.list,
      excludedNames: configuration.document.noFluentMethod.excluded
    }));
  }
  if (configuration.document.filter.list.length !== 0) {
    jdlObject.addOption(new JDLUnaryOption({
      name: UnaryOptions.UNARY_OPTIONS.FILTER,
      entityNames: configuration.document.filter.list,
      excludedNames: configuration.document.filter.excluded
    }));
  }
}

function addOption(key, value) {
  const option = new JDLBinaryOption({
    name: key,
    value,
    entityNames: configuration.document[key][value].list,
    excludedNames: configuration.document[key][value].excluded
  });
  if (configuration.document[key].value !== undefined || !JDLBinaryOption.isValid(option)) {
    throw new BuildException(
      exceptions.InvalidObject,
      `The parsed ${key} option is not valid for value ${value}.`);
  }
  jdlObject.addOption(option);
}

function fillBinaryOptions() {
  _.forEach(BinaryOptions.BINARY_OPTIONS, (optionValue) => {
    _.forEach(configuration.document[optionValue], (documentOptionValue, documentOptionKey) => {
      if (optionValue === BinaryOptions.BINARY_OPTIONS.PAGINATION
        && configuration.databaseType === DatabaseTypes.Types.cassandra) {
        throw new BuildException(exceptions.IllegalOption, 'Pagination isn\'t allowed when the app uses Cassandra.');
      }
      addOption(optionValue, documentOptionKey);
    });
  });
}
