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

import { relationshipOptions } from '../../core/built-in-options/index.js';
import { applicationOptions, fieldTypes } from '../../../jhipster/index.js';
import type JDLObject from '../../core/models/jdl-object.js';
import type JDLRelationship from '../../core/models/jdl-relationship.js';
import type JDLApplication from '../../core/models/jdl-application.js';
import type JDLField from '../../core/models/jdl-field.js';
import type JDLApplicationConfigurationOption from '../../core/models/jdl-application-configuration-option.js';
import EntityValidator from './entity-validator.js';
import FieldValidator from './field-validator.js';
import ValidationValidator from './validation-validator.js';
import RelationshipValidator from './relationship-validator.js';
import EnumValidator from './enum-validator.js';
import DeploymentValidator from './deployment-validator.js';
import UnaryOptionValidator from './unary-option-validator.js';
import BinaryOptionValidator from './binary-option-validator.js';
import type { ValidatorOptions } from './validator.js';

const { OptionNames } = applicationOptions;

const { BUILT_IN_ENTITY } = relationshipOptions;
const { BLUEPRINTS, BASE_NAME } = OptionNames;
/**
 * Constructor taking the jdl object to check against application settings.
 * @param {JDLObject} jdlObject -  the jdl object to check.
 * @param {Object} logger - the logger to use, default to the console.
 */
export default function createValidator(jdlObject: JDLObject, logger: any = console) {
  if (!jdlObject) {
    throw new Error('A JDL object must be passed to check for business errors.');
  }

  return {
    checkForErrors: (): void => {
      jdlObject.forEachApplication(jdlApplication => {
        const blueprints = jdlApplication.getConfigurationOptionValue(BLUEPRINTS);
        const checkReservedKeywords = (blueprints?.length ?? 0) === 0;
        checkForNamespaceConfigErrors(jdlApplication);
        checkForRelationshipErrors();
        checkForEntityErrors(jdlApplication, { checkReservedKeywords });
        checkForEnumErrors({ checkReservedKeywords });
        if (!checkReservedKeywords) {
          logger.warn('Blueprints are being used, the JDL validation phase is skipped.');
          return;
        }
        checkDeploymentsErrors();
        checkForOptionErrors();
      });
      checkForRelationshipsBetweenApplications();
    },
  };

  function checkForNamespaceConfigErrors(jdlApplication: JDLApplication): void {
    jdlApplication.forEachNamespaceConfiguration(config => {
      const blueprints: JDLApplicationConfigurationOption<string[]> | undefined = jdlApplication.config.getOption('blueprints');
      if (!blueprints?.getValue().some(blueprint => blueprint === config.namespace)) {
        throw new Error(`Blueprint namespace config ${config.namespace} requires the blueprint ${config.namespace}`);
      }
    });
  }

  function checkForEntityErrors(jdlApplication: JDLApplication, options: ValidatorOptions): void {
    if (jdlObject.getEntityQuantity() === 0) {
      return;
    }
    const validator = new EntityValidator();
    jdlObject.forEachEntity(jdlEntity => {
      if (!jdlApplication.hasEntityName(jdlEntity.name)) {
        return;
      }
      validator.validate(jdlEntity, options);
      checkForFieldErrors(jdlEntity.name, jdlEntity.fields, jdlApplication);
    });
  }

  function checkForFieldErrors(_entityName: string, jdlFields: Record<string, JDLField>, _jdlApplication: JDLApplication): void {
    const validator = new FieldValidator();
    Object.keys(jdlFields).forEach(fieldName => {
      const jdlField = jdlFields[fieldName];
      validator.validate(jdlField);
      const isAnEnum = jdlObject.hasEnum(jdlField.type);
      checkForValidationErrors(jdlField, isAnEnum);
    });
  }

  function checkForValidationErrors(jdlField: JDLField, isAnEnum: boolean): void {
    const validator = new ValidationValidator();
    Object.keys(jdlField.validations).forEach(validationName => {
      const jdlValidation = jdlField.validations[validationName];
      validator.validate(jdlValidation);
      if (!fieldTypes.hasValidation(jdlField.type, jdlValidation.name, isAnEnum)) {
        throw new Error(`The validation '${jdlValidation.name}' isn't supported for the type '${jdlField.type}'.`);
      }
    });
  }

  function checkForRelationshipErrors(): void {
    if (jdlObject.getRelationshipQuantity() === 0) {
      return;
    }
    const validator = new RelationshipValidator();
    jdlObject.forEachRelationship(jdlRelationship => {
      validator.validate(jdlRelationship);
      checkForAbsentEntities({
        jdlRelationship,
        doesEntityExist: entityName => !!jdlObject.getEntity(entityName),
      });
    });
  }

  function checkForEnumErrors(options: ValidatorOptions): void {
    if (jdlObject.getEnumQuantity() === 0) {
      return;
    }
    const validator = new EnumValidator();
    jdlObject.forEachEnum(jdlEnum => {
      validator.validate(jdlEnum, options);
    });
  }

  function checkDeploymentsErrors(): void {
    if (jdlObject.getDeploymentQuantity() === 0) {
      return;
    }
    const validator = new DeploymentValidator();
    jdlObject.forEachDeployment(deployment => {
      validator.validate(deployment);
    });
  }

  function checkForOptionErrors(): void {
    if (jdlObject.getOptionQuantity() === 0) {
      return;
    }
    const unaryOptionValidator = new UnaryOptionValidator();
    const binaryOptionValidator = new BinaryOptionValidator();
    jdlObject.getOptions().forEach(option => {
      if (option.getType() === 'UNARY') {
        unaryOptionValidator.validate(option);
      } else {
        binaryOptionValidator.validate(option);
      }
    });
  }

  function checkForRelationshipsBetweenApplications(): void {
    const applicationsPerEntityNames = getApplicationsPerEntityNames(jdlObject);
    jdlObject.forEachRelationship(jdlRelationship => {
      checkIfRelationshipIsBetweenApplications({
        jdlRelationship,
        applicationsPerEntityName: applicationsPerEntityNames,
      });
    });
  }
}

function checkForAbsentEntities({
  jdlRelationship,
  doesEntityExist,
}: {
  jdlRelationship: JDLRelationship;
  doesEntityExist: (string) => boolean;
}) {
  const absentEntities: any[] = [];
  if (!doesEntityExist(jdlRelationship.from)) {
    absentEntities.push(jdlRelationship.from);
  }
  if (!doesEntityExist(jdlRelationship.to) && !jdlRelationship.options.global[BUILT_IN_ENTITY]) {
    absentEntities.push(jdlRelationship.to);
  }
  if (absentEntities.length !== 0) {
    throw new Error(
      `In the relationship between ${jdlRelationship.from} and ${jdlRelationship.to}, ` +
        `${absentEntities.join(' and ')} ${absentEntities.length === 1 ? 'is' : 'are'} not declared. If '${
          jdlRelationship.to
        }' is a built-in entity declare like '${jdlRelationship.from} to ${jdlRelationship.to} with builtInEntity'.`,
    );
  }
}

function checkIfRelationshipIsBetweenApplications({ jdlRelationship, applicationsPerEntityName }) {
  let applicationsForSourceEntity = applicationsPerEntityName[jdlRelationship.from];
  let applicationsForDestinationEntity = applicationsPerEntityName[jdlRelationship.to];
  if (!applicationsForDestinationEntity || !applicationsForSourceEntity) {
    return;
  }
  applicationsForSourceEntity = applicationsForSourceEntity.map(jdlApplication => jdlApplication.getConfigurationOptionValue(BASE_NAME));
  applicationsForDestinationEntity = applicationsForDestinationEntity.map(jdlApplication =>
    jdlApplication.getConfigurationOptionValue(BASE_NAME),
  );
  const difference = applicationsForSourceEntity.filter(application => !applicationsForDestinationEntity.includes(application));
  if (difference.length !== 0) {
    throw new Error(
      `Entities for the ${jdlRelationship.type} relationship from '${jdlRelationship.from}' to '${jdlRelationship.to}' do not belong to the same application.`,
    );
  }
}
function getApplicationsPerEntityNames(jdlObject: JDLObject) {
  const applicationsPerEntityName = {};
  jdlObject.forEachApplication(jdlApplication => {
    jdlApplication.forEachEntityName(entityName => {
      applicationsPerEntityName[entityName] = applicationsPerEntityName[entityName] || [];
      applicationsPerEntityName[entityName].push(jdlApplication);
    });
  });
  return applicationsPerEntityName;
}
