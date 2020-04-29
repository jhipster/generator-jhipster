/** Copyright 2013-2020 the original author or authors from the JHipster project.
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

const JDLObject = require('../core/jdl_object');
const JDLEntity = require('../core/jdl_entity');
const JDLUnaryOption = require('../core/jdl_unary_option');
const JDLBinaryOption = require('../core/jdl_binary_option');
const ApplicationTypes = require('../core/jhipster/application_types');
const BinaryOptions = require('../core/jhipster/binary_options');
const { lowerFirst } = require('../utils/string_utils');

const { convertApplications } = require('../converters/parsedJDLToJDLObject/application_converter');
const { convertEntities } = require('../converters/parsedJDLToJDLObject/entity_converter');
const { convertEnums } = require('../converters/parsedJDLToJDLObject/enum_converter');
const { convertField } = require('../converters/parsedJDLToJDLObject/field_converter');
const { convertValidations } = require('../converters/parsedJDLToJDLObject/validation_converter');
const { convertOptions } = require('../converters/parsedJDLToJDLObject/option_converter');
const { convertRelationships } = require('../converters/parsedJDLToJDLObject/relationship_converter');
const { convertDeployments } = require('../converters/parsedJDLToJDLObject/deployment_converter');

module.exports = {
  parseFromConfigurationObject
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
 * @param {String} configurationObject.generatorVersion - The generator's version
 * @param {Boolean} configurationObject.skippedUserManagement - Whether user management is skipped
 * @return {ValidatedJDLObject} the built JDL object.
 */
function parseFromConfigurationObject(configurationObject) {
  parsedContent = configurationObject.parsedContent || configurationObject.document;
  if (!parsedContent) {
    throw new Error('The parsed JDL content must be passed.');
  }
  init(configurationObject);
  fillApplications();
  fillDeployments();
  fillEnums();
  fillClassesAndFields();
  fillAssociations();
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
    const fieldName = lowerFirst(field.name);
    if (fieldName.toLowerCase() === 'id') {
      continue; // eslint-disable-line no-continue
    }
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
      if (annotation.type === 'UNARY') {
        jdlObject.addOption(
          new JDLUnaryOption({
            name: annotation.optionName,
            entityNames: [entityName]
          })
        );
      } else if (annotation.type === 'BINARY') {
        if (annotation.optionName === 'paginate') {
          annotation.optionName = BinaryOptions.Options.PAGINATION;
        }
        jdlObject.addOption(
          new JDLBinaryOption({
            name: annotation.optionName,
            value: annotation.optionValue,
            entityNames: [entityName]
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
      fields: {}
    })
  );
}

function getValidations(field) {
  return convertValidations(field.validations, getConstantValueFromConstantName).reduce(
    (jdlValidations, jdlValidation) => {
      jdlValidations[jdlValidation.name] = jdlValidation;
      return jdlValidations;
    },
    {}
  );
}

function getConstantValueFromConstantName(constantName) {
  return parsedContent.constants[constantName];
}

function fillAssociations() {
  const jdlRelationships = convertRelationships(parsedContent.relationships, convertAnnotationsToOptions);
  jdlRelationships.forEach(jdlRelationship => {
    jdlObject.addRelationship(jdlRelationship, configuration.skippedUserManagement);
  });
}

function convertAnnotationsToOptions(annotations) {
  const result = {};
  annotations.forEach(annotation => {
    const value = annotation.optionValue ? annotation.optionValue : true;
    if (annotation.optionName in result) {
      const previousValue = result[annotation.optionName];
      if (Array.isArray(previousValue)) {
        if (!previousValue.includes(value)) {
          previousValue.push(value);
        }
      } else if (value !== previousValue) {
        result[annotation.optionName] = [previousValue, value];
      }
    } else {
      result[annotation.optionName] = value;
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
      entityNames
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
        entityNames
      })
    );
  }
  const convertedOptions = convertOptions(parsedContent.options);
  convertedOptions.forEach(convertedOption => {
    jdlObject.addOption(convertedOption);
  });
}
