/**
 * Copyright 2013-2024 the original author or authors from the JHipster project.
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
import { lowerFirst } from 'lodash-es';
import JDLObject from '../../models/jdl-object.js';
import JDLBinaryOption from '../../models/jdl-binary-option.js';
import { applicationTypes, binaryOptions } from '../../jhipster/index.js';

import { convertApplications } from './application-converter.js';
import { convertEntities } from './entity-converter.js';
import { convertEnums } from './enum-converter.js';
import { convertField } from './field-converter.js';
import { convertValidations } from './validation-converter.js';
import { convertOptions } from './option-converter.js';
import { convertRelationships } from './relationship-converter.js';
import { convertDeployments } from './deployment-converter.js';

let parsedContent;
let configuration;
let jdlObject: JDLObject;
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
 * @return the built JDL object.
 */
export function parseFromConfigurationObject(configurationObject): JDLObject {
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
  // TODO: Function which expects two arguments is called with three.
  // eslint-disable-next-line @typescript-eslint/ban-ts-comment
  // @ts-expect-error
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
}

function getJDLFieldsFromParsedEntity(entity) {
  const fields: any[] = [];
  for (let i = 0; i < entity.body.length; i++) {
    const field = entity.body[i];
    const jdlField = convertField(field);
    jdlField.validations = getValidations(field);
    jdlField.options = convertAnnotationsToOptions(field.annotations);
    fields.push(jdlField);
  }
  return fields;
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

function fillAssociations() {
  const jdlRelationships = convertRelationships(parsedContent.relationships, convertAnnotationsToOptions);
  jdlRelationships.forEach(jdlRelationship => {
    // TODO: addRelationship only expects one argument.
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    jdlObject.addRelationship(jdlRelationship);
  });
}

function convertAnnotationsToOptions(annotations) {
  const result = {};
  annotations.forEach(annotation => {
    const annotationName = lowerFirst(annotation.optionName);
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
  if (configuration.applicationType === applicationTypes.MICROSERVICE && !parsedContent.options.microservice) {
    globallyAddMicroserviceOption(configuration.applicationName);
  }
  fillUnaryAndBinaryOptions();
}

// TODO: move it to another file? it may not be the parser's responsibility to do it
function globallyAddMicroserviceOption(applicationName) {
  jdlObject.addOption(
    new JDLBinaryOption({
      name: binaryOptions.Options.MICROSERVICE,
      value: applicationName,
      entityNames,
    }),
  );
}

function fillUnaryAndBinaryOptions() {
  // TODO: move it to another file? it may not be the parser's responsibility to do it
  if (configuration.applicationType === applicationTypes.MICROSERVICE) {
    jdlObject.addOption(
      new JDLBinaryOption({
        name: binaryOptions.Options.CLIENT_ROOT_FOLDER,
        value: configuration.applicationName,
        entityNames,
      }),
    );
  }
  const convertedOptions = convertOptions(parsedContent.options, parsedContent.useOptions);
  convertedOptions.forEach(convertedOption => {
    jdlObject.addOption(convertedOption);
  });
}

export default {
  parseFromConfigurationObject,
};
