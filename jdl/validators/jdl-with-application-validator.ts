/**
 * Copyright 2013-2022 the original author or authors from the JHipster project.
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

import EntityValidator from './entity-validator.js';
import FieldValidator from './field-validator.js';
import { fieldTypes, applicationTypes, databaseTypes, binaryOptions, reservedKeywords, applicationOptions } from '../jhipster/index.mjs';
import ValidationValidator from './validation-validator.js';
import RelationshipValidator from './relationship-validator.js';
import EnumValidator from './enum-validator.js';
import DeploymentValidator from './deployment-validator.js';
import UnaryOptionValidator from './unary-option-validator.js';
import BinaryOptionValidator from './binary-option-validator.js';
import ApplicationValidator from './application-validator.js';
import JDLObject from '../models/jdl-object.js';

const { OptionNames } = applicationOptions;
const { SQL } = databaseTypes;

const { APPLICATION_TYPE, BLUEPRINTS, DATABASE_TYPE, BASE_NAME, REACTIVE, JHI_PREFIX, SKIP_USER_MANAGEMENT } = OptionNames;
const { isReservedFieldName, isReservedTableName, isReservedPaginationWords } = reservedKeywords;
/**
 * Constructor taking the jdl object to check against application settings.
 * @param {JDLObject} jdlObject -  the jdl object to check.
 * @param {Object} logger - the logger to use, default to the console.
 * @param {Object} [options]
 */
export default function createValidator(jdlObject: JDLObject, logger: any = console, options: any = {}) {
  if (!jdlObject) {
    throw new Error('A JDL object must be passed to check for business errors.');
  }
  const { unidirectionalRelationships } = options;

  return {
    checkForErrors: () => {
      checkForApplicationErrors();
      jdlObject.forEachApplication(jdlApplication => {
        const blueprints = jdlApplication.getConfigurationOptionValue(BLUEPRINTS);
        if (blueprints && blueprints.length > 0) {
          logger.warn('Blueprints are being used, the JDL validation phase is skipped.');
          return;
        }
        checkForEntityErrors(jdlApplication);
        checkForRelationshipErrors(jdlApplication, { unidirectionalRelationships });
        checkForEnumErrors();
        checkDeploymentsErrors();
        checkForOptionErrors(jdlApplication);
      });
      checkForRelationshipsBetweenApplications();
    },
  };
  function checkForApplicationErrors() {
    if (jdlObject.getApplicationQuantity() === 0) {
      return;
    }
    const validator = new ApplicationValidator();
    jdlObject.forEachApplication(jdlApplication => {
      validator.validate(jdlApplication);
    });
  }

  function checkForEntityErrors(jdlApplication) {
    if (jdlObject.getEntityQuantity() === 0) {
      return;
    }
    const validator = new EntityValidator();
    jdlObject.forEachEntity(jdlEntity => {
      if (!jdlApplication.hasEntityName(jdlEntity.name)) {
        return;
      }
      validator.validate(jdlEntity);
      if (
        jdlApplication.getConfigurationOptionValue(DATABASE_TYPE) &&
        isReservedTableName(jdlEntity.tableName, jdlApplication.getConfigurationOptionValue(DATABASE_TYPE))
      ) {
        logger.warn(`The table name '${jdlEntity.tableName}' is a reserved keyword, so it will be prefixed with the value of 'jhiPrefix'.`);
      } else if (!jdlApplication.getConfigurationOptionValue(DATABASE_TYPE) && isTableNameReserved(jdlEntity.tableName, jdlApplication)) {
        logger.warn(
          `The table name '${jdlEntity.tableName}' is a reserved keyword for application: ` +
            `${jdlApplication.getConfigurationOptionValue(BASE_NAME)}` +
            "so it will be prefixed with the value of 'jhiPrefix'."
        );
      }
      checkForFieldErrors(jdlEntity.name, jdlEntity.fields, jdlApplication);
    });
  }

  function checkForFieldErrors(entityName, jdlFields, jdlApplication) {
    const validator = new FieldValidator();
    const filtering =
      jdlApplication.getConfigurationOptionValue(DATABASE_TYPE) === SQL && jdlApplication.getConfigurationOptionValue(REACTIVE) === false;
    Object.keys(jdlFields).forEach(fieldName => {
      const jdlField = jdlFields[fieldName];
      validator.validate(jdlField);
      if (isReservedFieldName(jdlField.name)) {
        logger.warn(`The name '${jdlField.name}' is a reserved keyword, so it will be prefixed with the value of '${JHI_PREFIX}'.`);
      }
      if (filtering && isReservedPaginationWords(jdlField.name)) {
        throw new Error(
          `Field name '${fieldName}' found in ${entityName} is a reserved keyword, as it is used by Spring for pagination in the URL.`
        );
      }
      const typeCheckingFunction = getTypeCheckingFunction(entityName, jdlApplication);
      if (!jdlObject.hasEnum(jdlField.type) && !typeCheckingFunction(jdlField.type)) {
        throw new Error(`The type '${jdlField.type}' is an unknown field type for field '${fieldName}' of entity '${entityName}'.`);
      }
      const isAnEnum = jdlObject.hasEnum(jdlField.type);
      checkForValidationErrors(jdlField, isAnEnum);
    });
  }

  function checkForValidationErrors(jdlField, isAnEnum) {
    const validator = new ValidationValidator();
    Object.keys(jdlField.validations).forEach(validationName => {
      const jdlValidation = jdlField.validations[validationName];
      validator.validate(jdlValidation);
      if (!fieldTypes.hasValidation(jdlField.type, jdlValidation.name, isAnEnum)) {
        throw new Error(`The validation '${jdlValidation.name}' isn't supported for the type '${jdlField.type}'.`);
      }
    });
  }

  function checkForRelationshipErrors(jdlApplication, options: any = {}) {
    if (jdlObject.getRelationshipQuantity() === 0) {
      return;
    }
    const { unidirectionalRelationships } = options;
    const skippedUserManagement = jdlApplication.getConfigurationOptionValue(SKIP_USER_MANAGEMENT);
    const validator = new RelationshipValidator();
    jdlObject.forEachRelationship(jdlRelationship => {
      validator.validate(jdlRelationship, { skippedUserManagement, unidirectionalRelationships });
      checkForAbsentEntities({
        jdlRelationship,
        doesEntityExist: entityName => !!jdlObject.getEntity(entityName),
        skippedUserManagementOption: skippedUserManagement,
      });
    });
  }

  function checkForEnumErrors() {
    if (jdlObject.getEnumQuantity() === 0) {
      return;
    }
    const validator = new EnumValidator();
    jdlObject.forEachEnum(jdlEnum => {
      validator.validate(jdlEnum);
    });
  }

  function checkDeploymentsErrors() {
    if (jdlObject.getDeploymentQuantity() === 0) {
      return;
    }
    const validator = new DeploymentValidator();
    jdlObject.forEachDeployment(deployment => {
      validator.validate(deployment);
    });
  }

  function checkForOptionErrors(jdlApplication) {
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
      checkForPaginationInAppWithCassandra(option, jdlApplication);
    });
  }

  function checkForRelationshipsBetweenApplications() {
    const applicationsPerEntityNames = getApplicationsPerEntityNames(jdlObject);
    jdlObject.forEachRelationship(jdlRelationship => {
      checkIfRelationshipIsBetweenApplications({
        jdlRelationship,
        applicationsPerEntityName: applicationsPerEntityNames,
      });
    });
  }
}

function checkForPaginationInAppWithCassandra(jdlOption, jdlApplication) {
  if (
    jdlApplication.getConfigurationOptionValue(DATABASE_TYPE) === databaseTypes.CASSANDRA &&
    jdlOption.name === binaryOptions.Options.PAGINATION
  ) {
    throw new Error("Pagination isn't allowed when the application uses Cassandra.");
  }
}

function checkForAbsentEntities({ jdlRelationship, doesEntityExist, skippedUserManagementOption }) {
  const absentEntities: any[] = [];
  if (!doesEntityExist(jdlRelationship.from)) {
    absentEntities.push(jdlRelationship.from);
  }
  if (!doesEntityExist(jdlRelationship.to) && (!isUserManagementEntity(jdlRelationship.to) || skippedUserManagementOption)) {
    absentEntities.push(jdlRelationship.to);
  }
  if (absentEntities.length !== 0) {
    throw new Error(
      `In the relationship between ${jdlRelationship.from} and ${jdlRelationship.to}, ` +
        `${absentEntities.join(' and ')} ${absentEntities.length === 1 ? 'is' : 'are'} not declared.`
    );
  }
}

function isUserManagementEntity(entityName) {
  return entityName.toLowerCase() === 'user' || entityName.toLowerCase() === 'authority';
}

function isTableNameReserved(tableName, jdlApplication: any = []) {
  return isReservedTableName(tableName, jdlApplication.getConfigurationOptionValue(DATABASE_TYPE));
}

function getTypeCheckingFunction(entityName, jdlApplication) {
  if (jdlApplication.getConfigurationOptionValue(APPLICATION_TYPE) === applicationTypes.GATEWAY) {
    return () => true;
  }
  return fieldTypes.getIsType(jdlApplication.getConfigurationOptionValue(DATABASE_TYPE));
}

function checkIfRelationshipIsBetweenApplications({ jdlRelationship, applicationsPerEntityName }) {
  let applicationsForSourceEntity = applicationsPerEntityName[jdlRelationship.from];
  let applicationsForDestinationEntity = applicationsPerEntityName[jdlRelationship.to];
  if (!applicationsForDestinationEntity || !applicationsForSourceEntity) {
    return;
  }
  applicationsForSourceEntity = applicationsForSourceEntity.map(jdlApplication => jdlApplication.getConfigurationOptionValue(BASE_NAME));
  applicationsForDestinationEntity = applicationsForDestinationEntity.map(jdlApplication =>
    jdlApplication.getConfigurationOptionValue(BASE_NAME)
  );
  const difference = applicationsForSourceEntity.filter(application => !applicationsForDestinationEntity.includes(application));
  if (difference.length !== 0) {
    throw new Error(
      `Entities for the ${jdlRelationship.type} relationship from '${jdlRelationship.from}' to '${jdlRelationship.to}' do not belong to the same application.`
    );
  }
}
function getApplicationsPerEntityNames(jdlObject) {
  const applicationsPerEntityName = {};
  jdlObject.forEachApplication(jdlApplication => {
    jdlApplication.forEachEntityName(entityName => {
      applicationsPerEntityName[entityName] = applicationsPerEntityName[entityName] || [];
      applicationsPerEntityName[entityName].push(jdlApplication);
    });
  });
  return applicationsPerEntityName;
}
