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

import { binaryOptions, relationshipOptions } from '../../core/built-in-options/index.js';
import { applicationTypes, databaseTypes, fieldTypes, reservedKeywords } from '../../../jhipster/index.js';
import type JDLObject from '../../core/models/jdl-object.js';
import type JDLRelationship from '../../core/models/jdl-relationship.js';
import type JDLField from '../../core/models/jdl-field.js';
import type AbstractJDLOption from '../../core/models/abstract-jdl-option.js';
import EntityValidator from './entity-validator.js';
import FieldValidator from './field-validator.js';
import ValidationValidator from './validation-validator.js';
import RelationshipValidator from './relationship-validator.js';
import EnumValidator from './enum-validator.js';
import DeploymentValidator from './deployment-validator.js';
import UnaryOptionValidator from './unary-option-validator.js';
import BinaryOptionValidator from './binary-option-validator.js';

import type { ValidatorOptions } from './validator.js';

const { isReservedFieldName, isReservedPaginationWords, isReservedTableName } = reservedKeywords;
const { BUILT_IN_ENTITY } = relationshipOptions;
const { SQL } = databaseTypes;

/**
 * Constructor taking the jdl object to check against application settings.
 * @param {JDLObject} jdlObject -  the jdl object to check.
 * @param {Object} [applicationSettings] - the settings object.
 * @param {String} applicationSettings.baseName - the application's name.
 * @param {String} applicationSettings.applicationType - the application type.
 * @param {String} applicationSettings.databaseType - the DB type.
 * @param {Array} applicationSettings.blueprints - the blueprints used.
 * @param {Object} [logger] - the logger to use, default to the console.
 */
export default function createValidator(jdlObject: JDLObject, applicationSettings: any = {}, logger: any = console) {
  if (!jdlObject) {
    throw new Error('A JDL object must be passed to check for business errors.');
  }
  const { blueprints, databaseType } = applicationSettings;
  const checkReservedKeywords = Boolean((databaseType ?? 'no') !== 'no') && (blueprints?.length ?? 0) === 0;

  return {
    checkForErrors: () => {
      checkForEntityErrors({ checkReservedKeywords });
      checkForRelationshipErrors();
      checkForEnumErrors({ checkReservedKeywords });
      if (checkReservedKeywords) {
        checkDeploymentsErrors();
        checkForOptionErrors();
      } else {
        logger.warn('Blueprints are being used, the JDL validation phase is skipped.');
      }
    },
  };

  function checkForEntityErrors(options: ValidatorOptions): void {
    if (jdlObject.getEntityQuantity() === 0) {
      return;
    }
    const validator = new EntityValidator();
    jdlObject.forEachEntity(jdlEntity => {
      validator.validate(jdlEntity, options);
      if (options.checkReservedKeywords) {
        if (isReservedTableName(jdlEntity.tableName, applicationSettings.databaseType)) {
          logger.warn(
            `The table name '${jdlEntity.tableName}' is a reserved keyword, so it will be prefixed with the value of 'jhiPrefix'.`,
          );
        }
      }
      checkForFieldErrors(jdlEntity.name, jdlEntity.fields, options);
    });
  }

  function checkForFieldErrors(entityName: string, jdlFields: Record<string, JDLField>, options: ValidatorOptions) {
    const validator = new FieldValidator();
    const filtering = applicationSettings.databaseType === SQL;

    Object.keys(jdlFields).forEach(fieldName => {
      const jdlField = jdlFields[fieldName];
      validator.validate(jdlField);
      if (options.checkReservedKeywords) {
        if (isReservedFieldName(jdlField.name)) {
          logger.warn(`The name '${jdlField.name}' is a reserved keyword, so it will be prefixed with the value of 'jhiPrefix'.`);
        }
        if (filtering && isReservedPaginationWords(jdlField.name)) {
          throw new Error(
            `Field name '${fieldName}' found in ${entityName} is a reserved keyword, as it is used by Spring for pagination in the URL.`,
          );
        }
      }
      const typeCheckingFunction = getTypeCheckingFunction(entityName, applicationSettings);
      const isAnEnum = jdlObject.hasEnum(jdlField.type);
      if (!isAnEnum && !typeCheckingFunction(jdlField.type)) {
        throw new Error(`The type '${jdlField.type}' is an unknown field type for field '${fieldName}' of entity '${entityName}'.`);
      }
      checkForValidationErrors(jdlField, isAnEnum);
    });
  }

  function checkForValidationErrors(jdlField: JDLField, isAnEnum: boolean): void {
    const validator = new ValidationValidator();
    jdlField.forEachValidation(jdlValidation => {
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
      checkForPaginationInAppWithCassandra(option, applicationSettings);
    });
  }
}

function getTypeCheckingFunction(entityName: string, applicationSettings) {
  if (applicationSettings.applicationType === applicationTypes.GATEWAY) {
    return () => true;
  }
  return fieldTypes.getIsType(applicationSettings.databaseType);
}

function checkForAbsentEntities({
  jdlRelationship,
  doesEntityExist,
}: {
  jdlRelationship: JDLRelationship;
  doesEntityExist: (entityName: string) => boolean;
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

function checkForPaginationInAppWithCassandra(jdlOption: AbstractJDLOption, applicationSettings): void {
  if (applicationSettings.databaseType === databaseTypes.CASSANDRA && jdlOption.name === binaryOptions.Options.PAGINATION) {
    throw new Error("Pagination isn't allowed when the application uses Cassandra.");
  }
}
