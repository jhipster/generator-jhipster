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

const EntityValidator = require('./entity-validator');
const FieldValidator = require('./field-validator');
const FieldTypes = require('../jhipster/field-types');
const ApplicationTypes = require('../jhipster/application-types');
const ValidationValidator = require('./validation-validator');
const RelationshipValidator = require('./relationship-validator');
const EnumValidator = require('./enum-validator');
const DeploymentValidator = require('./deployment-validator');
const UnaryOptionValidator = require('./unary-option-validator');
const BinaryOptionValidator = require('./binary-option-validator');
const DatabaseTypes = require('../jhipster/database-types');
const BinaryOptions = require('../jhipster/binary-options');
const ApplicationValidator = require('./application-validator');

const { isReservedFieldName } = require('../jhipster/reserved-keywords');
const { isReservedTableName } = require('../jhipster/reserved-keywords');
const { isReservedPaginationWords } = require('../jhipster/reserved-keywords');

module.exports = {
  createValidator,
};

/**
 * Constructor taking the jdl object to check against application settings.
 * @param {JDLObject} jdlObject -  the jdl object to check.
 * @param {Object} logger - the logger to use, default to the console.
 */
function createValidator(jdlObject, logger = console, options = {}) {
  if (!jdlObject) {
    throw new Error('A JDL object must be passed to check for business errors.');
  }
  const { unidirectionalRelationships } = options;

  return {
    checkForErrors: () => {
      checkForApplicationErrors();
      jdlObject.forEachApplication(jdlApplication => {
        const blueprints = jdlApplication.getConfigurationOptionValue('blueprints');
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
        jdlApplication.getConfigurationOptionValue('databaseType') &&
        isReservedTableName(jdlEntity.tableName, jdlApplication.getConfigurationOptionValue('databaseType'))
      ) {
        logger.warn(`The table name '${jdlEntity.tableName}' is a reserved keyword, so it will be prefixed with the value of 'jhiPrefix'.`);
      } else if (!jdlApplication.getConfigurationOptionValue('databaseType') && isTableNameReserved(jdlEntity.tableName, jdlApplication)) {
        logger.warn(
          `The table name '${jdlEntity.tableName}' is a reserved keyword for application: ` +
            `${jdlApplication.getConfigurationOptionValue('baseName')}` +
            "so it will be prefixed with the value of 'jhiPrefix'."
        );
      }
      checkForFieldErrors(jdlEntity.name, jdlEntity.fields, jdlApplication);
    });
  }

  function checkForFieldErrors(entityName, jdlFields, jdlApplication) {
    const validator = new FieldValidator();
    const filtering =
      jdlApplication.getConfigurationOptionValue('databaseType') === 'sql' &&
      jdlApplication.getConfigurationOptionValue('reactive') === false;
    Object.keys(jdlFields).forEach(fieldName => {
      const jdlField = jdlFields[fieldName];
      validator.validate(jdlField);
      if (isReservedFieldName(jdlField.name)) {
        logger.warn(`The name '${jdlField.name}' is a reserved keyword, so it will be prefixed with the value of 'jhiPrefix'.`);
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
      if (!FieldTypes.hasValidation(jdlField.type, jdlValidation.name, isAnEnum)) {
        throw new Error(`The validation '${jdlValidation.name}' isn't supported for the type '${jdlField.type}'.`);
      }
    });
  }

  function checkForRelationshipErrors(jdlApplication, options = {}) {
    if (jdlObject.getRelationshipQuantity() === 0) {
      return;
    }
    const { unidirectionalRelationships } = options;
    const skippedUserManagement = jdlApplication.getConfigurationOptionValue('skipUserManagement');
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
    jdlApplication.getConfigurationOptionValue('databaseType') === DatabaseTypes.CASSANDRA &&
    jdlOption.name === BinaryOptions.Options.PAGINATION
  ) {
    throw new Error("Pagination isn't allowed when the application uses Cassandra.");
  }
}

function checkForAbsentEntities({ jdlRelationship, doesEntityExist, skippedUserManagementOption }) {
  const absentEntities = [];
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

function isTableNameReserved(tableName, jdlApplication = []) {
  return isReservedTableName(tableName, jdlApplication.getConfigurationOptionValue('databaseType'));
}

function getTypeCheckingFunction(entityName, jdlApplication) {
  if (jdlApplication.getConfigurationOptionValue('applicationType') === ApplicationTypes.GATEWAY) {
    return () => true;
  }
  return FieldTypes.getIsType(jdlApplication.getConfigurationOptionValue('databaseType'));
}

function checkIfRelationshipIsBetweenApplications({ jdlRelationship, applicationsPerEntityName }) {
  let applicationsForSourceEntity = applicationsPerEntityName[jdlRelationship.from];
  let applicationsForDestinationEntity = applicationsPerEntityName[jdlRelationship.to];
  if (!applicationsForDestinationEntity || !applicationsForSourceEntity) {
    return;
  }
  applicationsForSourceEntity = applicationsForSourceEntity.map(jdlApplication => jdlApplication.getConfigurationOptionValue('baseName'));
  applicationsForDestinationEntity = applicationsForDestinationEntity.map(jdlApplication =>
    jdlApplication.getConfigurationOptionValue('baseName')
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
