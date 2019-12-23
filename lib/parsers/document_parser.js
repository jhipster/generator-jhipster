/** Copyright 2013-2019 the original author or authors from the JHipster project.
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
const ValidatedJDLObject = require('../core/validated_jdl_object');
const JDLEntity = require('../core/jdl_entity');
const JDLRelationship = require('../core/jdl_relationship');
const JDLUnaryOption = require('../core/jdl_unary_option');
const JDLBinaryOption = require('../core/jdl_binary_option');
const ApplicationTypes = require('../core/jhipster/application_types');
const BinaryOptions = require('../core/jhipster/binary_options');
const { lowerFirst, upperFirst } = require('../utils/string_utils');
const { formatComment } = require('../utils/format_utils');

const { convertApplications } = require('../converters/parsedJDLToJDLObject/application_converter');
const { convertEnums } = require('../converters/parsedJDLToJDLObject/enum_converter');
const { convertField } = require('../converters/parsedJDLToJDLObject/field_converter');
const { convertValidations } = require('../converters/parsedJDLToJDLObject/validation_converter');
const { convertOptions } = require('../converters/parsedJDLToJDLObject/option_converter');
const { convertDeployments } = require('../converters/parsedJDLToJDLObject/deployment_converter');

module.exports = {
  parseFromConfigurationObject
};

const USER = 'User';

let configuration;
let jdlObject;
let applicationsPerEntityName;

/**
 * Converts the intermediate document to a JDLObject from a configuration object.
 * @param configuration The configuration object, keys:
 *        - document
 *        - applicationType
 *        - applicationName
 *        - generatorVersion
 */
function parseFromConfigurationObject(configuration) {
  if (!configuration.document) {
    throw new Error('The parsed JDL content must be passed.');
  }
  init(configuration);
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
  jdlObject = new ValidatedJDLObject();
  applicationsPerEntityName = {};
  applicationsPerEntityName = {};
}

function fillApplications() {
  const entityNames = configuration.document.entities.map(entity => entity.name);
  const jdlApplications = convertApplications(configuration.document.applications, configuration, entityNames);
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
  const jdlDeployments = convertDeployments(configuration.document.deployments);
  jdlDeployments.forEach(jdlDeployment => {
    jdlObject.addDeployment(jdlDeployment);
  });
}

function fillEnums() {
  const jdlEnums = convertEnums(configuration.document.enums);
  jdlEnums.forEach(jdlEnum => {
    jdlObject.addEnum(jdlEnum);
  });
}

function fillClassesAndFields() {
  for (let i = 0; i < configuration.document.entities.length; i++) {
    const entity = configuration.document.entities[i];
    fillClassAndItsFields(entity);
  }

  addUserEntityIfNeedBe();
}

function addUserEntityIfNeedBe() {
  const relationshipsToTheUserEntity = getUserRelationships();
  if (relationshipsToTheUserEntity && relationshipsToTheUserEntity.length && !jdlObject.getEntity(USER)) {
    addUserEntity();
  }
}

function getUserRelationships() {
  return configuration.document.relationships.filter(val => val.to.name.toLowerCase() === USER.toLowerCase());
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

function fillClassAndItsFields(entity) {
  entity.tableName = entity.tableName || entity.name;
  jdlObject.addEntity(
    new JDLEntity({
      name: entity.name,
      tableName: entity.tableName,
      fields: getFields(entity),
      comment: formatComment(entity.javadoc)
    })
  );
  if (entity.annotations.length !== 0) {
    addOptionsForEntityFromAnnotations(entity.name, entity.annotations);
  }
}

function addOptionsForEntityFromAnnotations(entityName, annotations) {
  annotations.forEach(annotation => {
    if (annotation.type === 'UNARY') {
      jdlObject.addOption(
        new JDLUnaryOption({
          name: annotation.option,
          entityNames: [entityName]
        })
      );
    } else if (annotation.type === 'BINARY') {
      if (annotation.option === 'paginate') {
        annotation.option = BinaryOptions.Options.PAGINATION;
      }
      jdlObject.addOption(
        new JDLBinaryOption({
          name: annotation.option,
          value: annotation.method,
          entityNames: [entityName]
        })
      );
    }
  });
}

function getFields(entity) {
  const fields = {};
  for (let i = 0; i < entity.body.length; i++) {
    const field = entity.body[i];
    const fieldName = lowerFirst(field.name);
    if (fieldName.toLowerCase() === 'id') {
      continue; // eslint-disable-line no-continue
    }
    const jdlField = convertField(field);
    jdlField.validations = getValidations(field);
    jdlField.options = convertAnnotationsToOptions(field.annotations);
    fields[fieldName] = jdlField;
  }
  return fields;
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
  return configuration.document.constants[constantName];
}

function fillAssociations() {
  for (let i = 0; i < configuration.document.relationships.length; i++) {
    const relationship = configuration.document.relationships[i];
    if (!relationship.from.injectedField && !relationship.to.injectedField) {
      relationship.from.injectedField = lowerFirst(relationship.to.name);
      relationship.to.injectedField = lowerFirst(relationship.from.name);
    }
    const options = convertAnnotationsToOptions(relationship.options);
    jdlObject.addRelationship(
      new JDLRelationship({
        from: relationship.from.name,
        to: relationship.to.name,
        type: upperFirst(_.camelCase(relationship.cardinality)),
        options,
        injectedFieldInFrom: relationship.from.injectedField,
        injectedFieldInTo: relationship.to.injectedField,
        isInjectedFieldInFromRequired: relationship.from.required,
        isInjectedFieldInToRequired: relationship.to.required,
        commentInFrom: formatComment(relationship.from.javadoc),
        commentInTo: formatComment(relationship.to.javadoc)
      })
    );
  }
}

function convertAnnotationsToOptions(annotations) {
  const result = {};
  annotations.forEach(annotation => {
    const value = annotation.method ? annotation.method : true;
    if (annotation.option in result) {
      const oldValue = result[annotation.option];
      if (Array.isArray(oldValue)) {
        if (!oldValue.includes(value)) {
          oldValue.push(value);
        }
      } else if (value !== oldValue) {
        result[annotation.option] = [oldValue, value];
      }
    } else {
      result[annotation.option] = value;
    }
  });
  return result;
}

function fillOptions() {
  if (
    configuration.applicationType === ApplicationTypes.MICROSERVICE &&
    Object.keys(configuration.document.options.microservice).length === 0
  ) {
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
      entityNames: configuration.document.entities.map(entity => entity.name)
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
        entityNames: configuration.document.entities.map(entity => entity.name)
      })
    );
  }
  const convertedOptions = convertOptions(configuration.document.options);
  convertedOptions.forEach(convertedOption => {
    jdlObject.addOption(convertedOption);
  });
}
