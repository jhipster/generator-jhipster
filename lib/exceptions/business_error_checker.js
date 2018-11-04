/** Copyright 2013-2018 the original author or authors from the JHipster project.
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

const logger = require('../utils/objects/logger');

const { checkApplication } = require('./application_validator');
const { checkOptions } = require('./option_validator');
const { GATEWAY } = require('../core/jhipster/application_types');
const { SKIP_USER_MANAGEMENT } = require('../core/jhipster/unary_options');
const FieldTypes = require('../core/jhipster/field_types');
const { isReservedClassName, isReservedFieldName, isReservedTableName } = require('../core/jhipster/reserved_keywords');

const USER = 'User';

/**
 * The BusinessErrorChecker class checks a passed JDL object doesn't break any business rule.
 */
class BusinessErrorChecker {
  /**
   * Constructor taking the jdl object to check against application settings.
   * @param jdlObject the jdl object to check.
   * @param applicationSettings the settings object, keys:
   *                              - applicationType
   *                              - databaseType
   */
  constructor(jdlObject, applicationSettings) {
    if (!jdlObject) {
      throw new Error('A JDL object must be passed to check for business errors.');
    }
    this.jdlObject = jdlObject;
    this.applicationSettings = applicationSettings || {};
    this.typeCheckingFunction = null;
    this.applicationsPerEntityName = getApplicationsPerEntityNames(jdlObject);
  }

  /**
   * Checks the jdlObject's correctness against application parameters.
   */
  checkForErrors() {
    if (!this.jdlObject) {
      return;
    }
    if (this.jdlObject.getApplicationQuantity() !== 0) {
      this.checkForApplicationErrors();
    }
    if (this.jdlObject.getEntityQuantity() !== 0) {
      this.checkForEntityErrors();
    }
    if (this.jdlObject.getRelationshipQuantity() !== 0) {
      this.checkForRelationshipErrors();
    }
    if (this.jdlObject.getEnumQuantity() !== 0) {
      this.checkForEnumErrors();
    }
    if (this.jdlObject.getOptionQuantity() !== 0) {
      this.checkForOptionErrors();
    }
  }

  checkForApplicationErrors() {
    this.jdlObject.forEachApplication(jdlApplication => {
      checkApplication(jdlApplication);
    });
  }

  checkForEntityErrors() {
    this.jdlObject.forEachEntity(jdlEntity => {
      if (isReservedClassName(jdlEntity.name)) {
        throw new Error(
          `The name '${jdlEntity.name}' is a reserved keyword and can not be used as an entity class name.`
        );
      }
      if (
        this.applicationSettings.databaseType &&
        isReservedTableName(jdlEntity.tableName, this.applicationSettings.databaseType)
      ) {
        logger.warn(
          `The table name '${
            jdlEntity.tableName
          }' is a reserved keyword, so it will be prefixed with the value of 'jhiPrefix'.`
        );
      } else if (
        !this.applicationSettings.databaseType &&
        isTableNameReserved(jdlEntity.tableName, this.applicationsPerEntityName[jdlEntity.name])
      ) {
        logger.warn(
          `The table name '${jdlEntity.tableName}' is a reserved keyword for at` +
            ` least one of these applications: ${this.applicationsPerEntityName[jdlEntity.name]
              .map(application => application.config.baseName)
              .join(', ')}, so it will be prefixed with the value of 'jhiPrefix'.`
        );
      }
      this.checkForFieldErrors(jdlEntity.name, jdlEntity.fields);
    });
  }

  checkForFieldErrors(entityName, jdlFields) {
    Object.keys(jdlFields).forEach(fieldName => {
      const jdlField = jdlFields[fieldName];
      if (isReservedFieldName(jdlField.name)) {
        logger.warn(
          `The name '${jdlField.name}' is a reserved keyword, so it will be prefixed with the value of 'jhiPrefix'.`
        );
      }
      this.typeCheckingFunction = getTypeCheckingFunction(
        entityName,
        this.applicationSettings,
        this.applicationsPerEntityName
      );
      if (!this.jdlObject.hasEnum(jdlField.type) && !this.typeCheckingFunction(jdlField.type)) {
        throw new Error(
          `The type '${jdlField.type}' is an unknown field type for field '${fieldName}' of entity '${entityName}'.`
        );
      }
      const isAnEnum = this.jdlObject.hasEnum(jdlField.type);
      this.checkForValidationErrors(jdlField, isAnEnum);
    });
  }

  checkForValidationErrors(jdlField, isAnEnum) {
    Object.keys(jdlField.validations).forEach(validationName => {
      const jdlValidation = jdlField.validations[validationName];
      if (!FieldTypes.hasValidation(jdlField.type, jdlValidation.name, isAnEnum)) {
        throw new Error(`The validation '${jdlValidation.name}' isn't supported for the type '${jdlField.type}'.`);
      }
    });
  }

  checkForRelationshipErrors() {
    this.jdlObject.forEachRelationship(jdlRelationship => {
      const absentEntities = [];

      const skipUserManagement = this.jdlObject.getOptionsForName(SKIP_USER_MANAGEMENT)[0];
      if (jdlRelationship.from.toLowerCase() === USER.toLowerCase() && !skipUserManagement) {
        throw new Error(
          `Relationships from the User entity is not supported in the declaration between '${
            jdlRelationship.from
          }' and '${jdlRelationship.to}'.`
        );
      }
      if (
        jdlRelationship.from.toLowerCase() === jdlRelationship.to.toLowerCase() &&
        (jdlRelationship.isInjectedFieldInFromRequired || jdlRelationship.isInjectedFieldInToRequired)
      ) {
        throw new Error(
          'Required relationships to the same entity are not supported, for relationship from ' +
            `'${jdlRelationship.from}' to '${jdlRelationship.to}'.`
        );
      }
      if (!this.jdlObject.getEntity(jdlRelationship.from)) {
        absentEntities.push(jdlRelationship.from);
      }
      if (
        !this.jdlObject.getEntity(jdlRelationship.to) &&
        (jdlRelationship.to.toLowerCase() !== USER.toLowerCase() || skipUserManagement)
      ) {
        absentEntities.push(jdlRelationship.to);
      }
      if (absentEntities.length !== 0) {
        throw new Error(
          `In the relationship between ${jdlRelationship.from} and ${jdlRelationship.to}, ` +
            `${absentEntities.join(' and ')} ${absentEntities.length === 1 ? 'is' : 'are'} not declared.`
        );
      }
    });
    this.checkForRelationshipsBetweenApplications();
  }

  checkForRelationshipsBetweenApplications() {
    if (this.jdlObject.getApplicationQuantity() === 0) {
      return;
    }
    this.applicationsPerEntityName = getApplicationsPerEntityNames(this.jdlObject);
    const issues = [];
    this.jdlObject.forEachRelationship(jdlRelationship => {
      let applicationsForSourceEntity = this.applicationsPerEntityName[jdlRelationship.from];
      let applicationsForDestinationEntity = this.applicationsPerEntityName[jdlRelationship.to];
      if (!applicationsForDestinationEntity || !applicationsForSourceEntity) {
        return;
      }
      applicationsForSourceEntity = applicationsForSourceEntity.map(jdlApplication => jdlApplication.config.baseName);
      applicationsForDestinationEntity = applicationsForDestinationEntity.map(
        jdlApplication => jdlApplication.config.baseName
      );
      const difference = applicationsForSourceEntity.filter(
        application => !applicationsForDestinationEntity.includes(application)
      );
      if (difference.length !== 0) {
        issues.push(
          `Entities for the ${jdlRelationship.type} relationship from '${jdlRelationship.from}' to '${
            jdlRelationship.to
          }'.`
        );
      }
    });
    if (issues.length !== 0) {
      throw new Error(issues.join('\n'));
    }
  }

  checkForEnumErrors() {
    this.jdlObject.forEachEnum(jdlEnum => {
      if (isReservedClassName(jdlEnum.name)) {
        throw new Error(`The enum name '${jdlEnum.name}' is reserved keyword and can not be used as enum class name.`);
      }
    });
  }

  checkForOptionErrors() {
    checkOptions({
      jdlObject: this.jdlObject,
      applicationSettings: this.applicationSettings,
      applicationsPerEntityName: this.applicationsPerEntityName
    });
  }
}

module.exports = BusinessErrorChecker;

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

function isTableNameReserved(tableName, applicationsPerEntityName = []) {
  return applicationsPerEntityName.some(application => isReservedTableName(tableName, application.config.databaseType));
}

function getTypeCheckingFunction(entityName, applicationSettings, applicationsPerEntityName) {
  const applications = applicationsPerEntityName[entityName];
  if (applicationSettings.applicationType === GATEWAY && !applications) {
    return () => true;
  }
  if (applicationSettings.databaseType && !applications) {
    return FieldTypes.getIsType(applicationSettings.databaseType);
  }
  if (!applications || (applications.length === 1 && applications[0].config.applicationType === GATEWAY)) {
    return () => true;
  }
  let typeCheckingFunction = null;
  applications.forEach(application => {
    if (!typeCheckingFunction) {
      // first iteration
      typeCheckingFunction = FieldTypes.getIsType(application.config.databaseType);
    } else {
      const newIsType = FieldTypes.getIsType(application.config.databaseType);
      if (newIsType !== typeCheckingFunction) {
        logger.warn(
          `Multiple applications are declared to have entity '${entityName}', check field type to ensure` +
            ' compatibility.'
        );
      }
      typeCheckingFunction = newIsType;
    }
  });
  return typeCheckingFunction;
}
