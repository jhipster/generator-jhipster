/**
 * Copyright 2013-2021 the original author or authors from the JHipster project.
 *
 * This file is part of the JHipster project, see https://www.jhipster.tech/
 * for more information.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *      https://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */
const _ = require('lodash');
const JDLObject = require('../../models/jdl-object');
const JDLEntity = require('../../models/jdl-entity');
const JDLUnaryOption = require('../../models/jdl-unary-option');
const JDLBinaryOption = require('../../models/jdl-binary-option');
const ApplicationTypes = require('../../jhipster/application-types');
const BinaryOptions = require('../../jhipster/binary-options');
const DatabaseTypes = require('../../jhipster/database-types');

const { convertApplications } = require('./application-converter');
const { convertEntities } = require('./entity-converter');
const { convertEnums } = require('./enum-converter');
const { convertField } = require('./field-converter');
const { convertValidations } = require('./validation-converter');
const { convertOptions } = require('./option-converter');
const { convertRelationships } = require('./relationship-converter');
const { convertDeployments } = require('./deployment-converter');

module.exports = {
  parseFromConfigurationObject,
};

const USER = 'User';

let parsedContent;
let configuration;
let jdlObject;
let entityNames;
let applicationsPerEntityName;

/**
 * Converts the intermediate parsedContent to a JDLObject from a configuration object.
 * @param {Object} configurationObject - The configuration object.
 * @param {Object} configurationObject.document - Deprecated set parsedContent instead, the parsed JDL content
 * @param {Object} configurationObject.parsedContent - The parsed JDL content
 * @param {String} configurationObject.applicationType - The application's type
 * @param {String} configurationObject.applicationName - The application's name
 * @param {String} configurationObject.databaseType - The application's database type
 * @param {String} configurationObject.generatorVersion - The generator's version
 * @param {Boolean} configurationObject.skippedUserManagement - Whether user management is skipped
 * @param {Boolean} [configurationObject.unidirectionalRelationships] - Whether to generate unidirectional relationships
 * @return {JDLObject} the built JDL object.
 */
function parseFromConfigurationObject(configurationObject) {
  parsedContent = configurationObject.parsedContent || configurationObject.document;
  if (!parsedContent) {
    throw new Error('The parsed JDL content must be passed.');
  }
  const { unidirectionalRelationships } = configurationObject;
  init(configurationObject);
  fillApplications();
  fillDeployments();
  fillEnums();
  fillClassesAndFields();
  fillAssociations({ unidirectionalRelationships });
  fillOptions();
  return jdlObject;
}

function init(passedConfiguration) {
  configuration = passedConfiguration;
  jdlObject = new JDLObject();
  entityNames = parsedContent.entities.map(entity => entity.name);
  applicationsPerEntityName = {};
}

function fillApplications() {
  const jdlApplications = convertApplications(parsedContent.applications, configuration, entityNames);
  jdlApplications.forEach(jdlApplication => {
    jdlObject.addApplication(jdlApplication);
    fillApplicationsPerEntityName(jdlApplication);
  });
}

function fillApplicationsPerEntityName(application) {
  application.forEachEntityName(entityName => {
    applicationsPerEntityName[entityName] = applicationsPerEntityName[entityName] || [];
    applicationsPerEntityName[entityName].push(application);
  });
}

function fillDeployments() {
  const jdlDeployments = convertDeployments(parsedContent.deployments);
  jdlDeployments.forEach(jdlDeployment => {
    jdlObject.addDeployment(jdlDeployment);
  });
}

function fillEnums() {
  const jdlEnums = convertEnums(parsedContent.enums);
  jdlEnums.forEach(jdlEnum => {
    jdlObject.addEnum(jdlEnum);
  });
}

function fillClassesAndFields() {
  const jdlEntities = convertEntities(parsedContent.entities, getJDLFieldsFromParsedEntity);
  jdlEntities.forEach(jdlEntity => {
    jdlObject.addEntity(jdlEntity);
  });
  addUserEntityIfNeedBe();
  addOptionsFromEntityAnnotations();
}

function getJDLFieldsFromParsedEntity(entity) {
  const fields = [];
  for (let i = 0; i < entity.body.length; i++) {
    const field = entity.body[i];
    const jdlField = convertField(field);
    jdlField.validations = getValidations(field);
    jdlField.options = convertAnnotationsToOptions(field.annotations);
    fields.push(jdlField);
  }
  return fields;
}

function addOptionsFromEntityAnnotations() {
  parsedContent.entities.forEach(entity => {
    const entityName = entity.name;
    const annotations = entity.annotations;
    annotations.forEach(annotation => {
      let annotationName = _.lowerFirst(annotation.optionName);
      if (annotation.type === 'UNARY') {
        jdlObject.addOption(
          new JDLUnaryOption({
            name: annotationName,
            entityNames: [entityName],
          })
        );
      } else if (annotation.type === 'BINARY') {
        if (annotationName === 'paginate') {
          annotationName = BinaryOptions.Options.PAGINATION;
        }
        jdlObject.addOption(
          new JDLBinaryOption({
            name: annotationName,
            value: annotation.optionValue,
            entityNames: [entityName],
          })
        );
      }
    });
  });
}

function addUserEntityIfNeedBe() {
  const relationshipsToTheUserEntity = getRelationshipsToTheUserEntity();
  if (relationshipsToTheUserEntity && relationshipsToTheUserEntity.length && !jdlObject.getEntity(USER)) {
    addUserEntity();
  }
}

function getRelationshipsToTheUserEntity() {
  return parsedContent.relationships.filter(relationship => relationship.to.name.toLowerCase() === USER.toLowerCase());
}

function addUserEntity() {
  jdlObject.addEntity(
    new JDLEntity({
      name: USER,
      tableName: 'jhi_user',
      fields: {},
    })
  );
}

function getValidations(field) {
  return convertValidations(field.validations, getConstantValueFromConstantName).reduce((jdlValidations, jdlValidation) => {
    jdlValidations[jdlValidation.name] = jdlValidation;
    return jdlValidations;
  }, {});
}

function getConstantValueFromConstantName(constantName) {
  return parsedContent.constants[constantName];
}

function fillAssociations(conversionOptions = {}) {
  const { unidirectionalRelationships = configuration.databaseType === DatabaseTypes.NEO4J } = conversionOptions;
  const jdlRelationships = convertRelationships(parsedContent.relationships, convertAnnotationsToOptions, { unidirectionalRelationships });
  jdlRelationships.forEach(jdlRelationship => {
    jdlObject.addRelationship(jdlRelationship, configuration.skippedUserManagement);
  });
}

function convertAnnotationsToOptions(annotations) {
  const result = {};
  annotations.forEach(annotation => {
    const annotationName = _.lowerFirst(annotation.optionName);
    const value = annotation.optionValue ? annotation.optionValue : true;
    if (annotationName in result) {
      const previousValue = result[annotationName];
      if (Array.isArray(previousValue)) {
        if (!previousValue.includes(value)) {
          previousValue.push(value);
        }
      } else if (value !== previousValue) {
        result[annotationName] = [previousValue, value];
      }
    } else {
      result[annotationName] = value;
    }
  });
  return result;
}

function fillOptions() {
  if (configuration.applicationType === ApplicationTypes.MICROSERVICE && !parsedContent.options.microservice) {
    globallyAddMicroserviceOption(configuration.applicationName);
  }
  fillUnaryAndBinaryOptions();
}

// TODO: move it to another file? it may not be the parser's responsibility to do it
function globallyAddMicroserviceOption(applicationName) {
  jdlObject.addOption(
    new JDLBinaryOption({
      name: BinaryOptions.Options.MICROSERVICE,
      value: applicationName,
      entityNames,
    })
  );
}

function fillUnaryAndBinaryOptions() {
  // TODO: move it to another file? it may not be the parser's responsibility to do it
  if (configuration.applicationType === ApplicationTypes.MICROSERVICE) {
    jdlObject.addOption(
      new JDLBinaryOption({
        name: BinaryOptions.Options.CLIENT_ROOT_FOLDER,
        value: configuration.applicationName,
        entityNames,
      })
    );
  }
  const convertedOptions = convertOptions(parsedContent.options, parsedContent.useOptions);
  convertedOptions.forEach(convertedOption => {
    jdlObject.addOption(convertedOption);
  });
}
