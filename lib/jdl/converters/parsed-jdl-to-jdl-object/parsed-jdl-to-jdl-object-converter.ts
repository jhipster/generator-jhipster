/**
 * Copyright 2013-2025 the original author or authors from the JHipster project.
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
import JDLObject from '../../core/models/jdl-object.ts';
import JDLBinaryOption from '../../core/models/jdl-binary-option.ts';
import { binaryOptions } from '../../core/built-in-options/index.ts';

import type JDLApplication from '../../core/models/jdl-application.js';
import type JDLField from '../../core/models/jdl-field.js';
import type JDLValidation from '../../core/models/jdl-validation.js';
import type { JDLEntity } from '../../core/models/index.js';
import type { JDLRuntime } from '../../core/types/runtime.js';
import type {
  ParsedJDLAnnotation,
  ParsedJDLApplications,
  ParsedJDLEntity,
  ParsedJDLEntityField,
  ParsedJDLRoot,
} from '../../core/types/parsed.js';
import { APPLICATION_TYPE_MICROSERVICE } from '../../../core/application-types.ts';
import { convertApplications } from './application-converter.ts';
import { convertEntities } from './entity-converter.ts';
import { convertEnums } from './enum-converter.ts';
import { convertField } from './field-converter.ts';
import { convertValidations } from './validation-converter.ts';
import { convertOptions } from './option-converter.ts';
import { convertRelationships } from './relationship-converter.ts';
import { convertDeployments } from './deployment-converter.ts';

let parsedContent: ParsedJDLApplications;
let configuration: ParsedJDLRoot;
let jdlObject: JDLObject;
let entityNames: string[];
let applicationsPerEntityName: Record<string, JDLApplication[]> = {};

/**
 * Converts the intermediate parsedContent to a JDLObject from a configuration object.
 */
export function parseFromConfigurationObject(configurationObject: ParsedJDLRoot, runtime: JDLRuntime): JDLObject {
  parsedContent = configurationObject.parsedContent || configurationObject.document;
  if (!parsedContent) {
    throw new Error('The parsed JDL content must be passed.');
  }
  init(configurationObject);
  fillApplications(runtime);
  fillDeployments();
  fillEnums();
  fillClassesAndFields();
  fillAssociations();
  fillOptions();
  return jdlObject;
}

function init(passedConfiguration: ParsedJDLRoot) {
  configuration = passedConfiguration;
  jdlObject = new JDLObject();
  entityNames = parsedContent.entities.map(entity => entity.name);
  applicationsPerEntityName = {};
}

function fillApplications(runtime: JDLRuntime): void {
  // TODO: Function which expects two arguments is called with three.

  const jdlApplications: JDLApplication[] = convertApplications(parsedContent.applications, runtime);
  jdlApplications.forEach((jdlApplication: JDLApplication) => {
    jdlObject.addApplication(jdlApplication);
    fillApplicationsPerEntityName(jdlApplication);
  });
}

function fillApplicationsPerEntityName(application: JDLApplication): void {
  application.forEachEntityName((entityName: string) => {
    applicationsPerEntityName[entityName] ??= [];
    applicationsPerEntityName[entityName].push(application);
  });
}

function fillDeployments(): void {
  const jdlDeployments = convertDeployments(parsedContent.deployments);
  jdlDeployments.forEach(jdlDeployment => {
    jdlObject.addDeployment(jdlDeployment);
  });
}

function fillEnums(): void {
  const jdlEnums = convertEnums(parsedContent.enums);
  jdlEnums.forEach(jdlEnum => {
    jdlObject.addEnum(jdlEnum);
  });
}

function fillClassesAndFields(): void {
  const jdlEntities: JDLEntity[] = convertEntities(parsedContent.entities, getJDLFieldsFromParsedEntity);
  jdlEntities.forEach(jdlEntity => {
    jdlObject.addEntity(jdlEntity);
  });
}

function getJDLFieldsFromParsedEntity(entity: ParsedJDLEntity): JDLField[] {
  const fields: JDLField[] = [];
  const arr = entity.body || [];
  for (const item of arr) {
    const field = item;
    const jdlField = convertField(field);
    jdlField.validations = getValidations(field);
    jdlField.options = convertAnnotationsToOptions(field.annotations || []);
    fields.push(jdlField);
  }
  return fields;
}

function getValidations(field: ParsedJDLEntityField): Record<string, JDLValidation> {
  return convertValidations(field.validations, getConstantValueFromConstantName).reduce(
    (jdlValidations, jdlValidation) => {
      jdlValidations[jdlValidation.name] = jdlValidation;
      return jdlValidations;
    },
    {} as Record<string, JDLValidation>,
  );
}

function getConstantValueFromConstantName(constantName: string): string {
  return parsedContent.constants[constantName];
}

function fillAssociations(): void {
  const jdlRelationships = convertRelationships(parsedContent.relationships, convertAnnotationsToOptions);
  jdlRelationships.forEach(jdlRelationship => {
    // TODO: addRelationship only expects one argument.

    jdlObject.addRelationship(jdlRelationship);
  });
}

function convertAnnotationsToOptions(
  annotations: ParsedJDLAnnotation[],
): Record<string, boolean | string | number | string[] | boolean[] | number[]> {
  const result: Record<string, boolean | string | number | any[]> = {};
  annotations.forEach(annotation => {
    const annotationName = lowerFirst(annotation.optionName);
    const value = annotation.optionValue ?? true;
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

function fillOptions(): void {
  if (configuration.applicationType === APPLICATION_TYPE_MICROSERVICE && !parsedContent.options.microservice) {
    globallyAddMicroserviceOption(configuration.applicationName!);
  }
  fillUnaryAndBinaryOptions();
}

// TODO: move it to another file? it may not be the parser's responsibility to do it
function globallyAddMicroserviceOption(applicationName: string): void {
  jdlObject.addOption(
    new JDLBinaryOption({
      name: binaryOptions.Options.MICROSERVICE,
      value: applicationName,
      entityNames,
    }),
  );
}

function fillUnaryAndBinaryOptions(): void {
  // TODO: move it to another file? it may not be the parser's responsibility to do it
  if (configuration.applicationType === APPLICATION_TYPE_MICROSERVICE) {
    jdlObject.addOption(
      new JDLBinaryOption({
        name: binaryOptions.Options.CLIENT_ROOT_FOLDER,
        value: configuration.applicationName!,
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
