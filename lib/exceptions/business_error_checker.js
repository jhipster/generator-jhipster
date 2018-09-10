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

const ApplicationTypes = require('../core/jhipster/application_types');
const BinaryOptions = require('../core/jhipster/binary_options');
const DatabaseTypes = require('../core/jhipster/database_types');
const FieldTypes = require('../core/jhipster/field_types');
const AbstractJDLOption = require('../core/abstract_jdl_option');
const JDLBinaryOption = require('../core/jdl_binary_option');
const Set = require('../utils/objects/set');
const ReservedKeyWords = require('../core/jhipster/reserved_keywords');

const isReservedClassName = ReservedKeyWords.isReservedClassName;
const isReservedTableName = ReservedKeyWords.isReservedTableName;
const isReservedFieldName = ReservedKeyWords.isReservedFieldName;

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
    this.jdlObject = jdlObject;
    this.applicationSettings = applicationSettings || {};
    this.applicationsPerEntityName = {};
    this.typeCheckingFunction = null;
  }

  /**
   * Checks the jdlObject's correctness against application parameters.
   */
  checkForErrors() {
    if (!this.jdlObject) {
      return;
    }
    if (this.jdlObject.getApplicationQuantity() !== 0) {
      this.applicationsPerEntityName = getApplicationsPerEntityNames(this.jdlObject);
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
      if (jdlApplication.config.applicationType === ApplicationTypes.UAA && jdlApplication.config.skipUserManagement) {
        throw new Error('Skipping user management in a UAA app is forbidden.');
      }
      const applicationIsAMicroserviceWithoutOauth2 =
        jdlApplication.config.authenticationType !== 'oauth2' &&
        jdlApplication.config.applicationType === ApplicationTypes.MICROSERVICE;
      const applicationAGatewayWithUaa =
        jdlApplication.config.authenticationType === 'uaa' &&
        jdlApplication.config.applicationType === ApplicationTypes.GATEWAY;
      if (
        jdlApplication.config.databaseType === DatabaseTypes.NO &&
        !(applicationIsAMicroserviceWithoutOauth2 || applicationAGatewayWithUaa)
      ) {
        throw new Error(
          'Having no database type is only allowed for microservices without oauth2 authentication type ' +
            'and gateways with UAA authentication type.'
        );
      }
    });
  }

  checkForEntityErrors() {
    if (this.jdlObject.getApplicationQuantity() !== 0) {
      this.applicationsPerEntityName = getApplicationsPerEntityNames(this.jdlObject);
    }
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
        throw new Error(
          `The name '${jdlEntity.tableName}' is a reserved keyword and can not be used as an entity table name.`
        );
      } else if (
        !this.applicationSettings.databaseType &&
        isTableNameReserved(jdlEntity.tableName, this.applicationsPerEntityName[jdlEntity.name])
      ) {
        throw new Error(
          `The name '${jdlEntity.tableName}' is a reserved keyword and can not be used as an entity table name for at` +
            ` least one of these applications: ${this.applicationsPerEntityName[jdlEntity.name]
              .map(application => application.config.baseName)
              .join(', ')}.`
        );
      }
      this.checkForFieldErrors(jdlEntity.name, jdlEntity.fields);
    });
  }

  checkForFieldErrors(entityName, jdlFields) {
    if (this.jdlObject.getApplicationQuantity() !== 0) {
      this.applicationsPerEntityName = getApplicationsPerEntityNames(this.jdlObject);
    }
    Object.keys(jdlFields).forEach(fieldName => {
      const jdlField = jdlFields[fieldName];
      if (isReservedFieldName(jdlField.name)) {
        throw new Error(
          `The name '${jdlField.name}' is a reserved keyword and can not be used as an entity field name.`
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

      if (jdlRelationship.from.toLowerCase() === USER.toLowerCase()) {
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
      if (jdlRelationship.to.toLowerCase() !== USER.toLowerCase() && !this.jdlObject.getEntity(jdlRelationship.to)) {
        absentEntities.push(jdlRelationship.to);
      }
      if (absentEntities.length !== 0) {
        throw new Error(
          `In the relationship between ${jdlRelationship.from} and ${jdlRelationship.to}, ` +
            `${absentEntities.join(' and ')} ${absentEntities.length === 1 ? 'is' : 'are'} not declared.`
        );
      }
    });
  }

  checkForEnumErrors() {
    this.jdlObject.forEachEnum(jdlEnum => {
      if (isReservedClassName(jdlEnum.name)) {
        throw new Error(`The enum name '${jdlEnum.name}' is reserved keyword and can not be used as enum class name.`);
      }
    });
  }

  checkForOptionErrors() {
    if (this.jdlObject.getApplicationQuantity() !== 0) {
      this.applicationsPerEntityName = getApplicationsPerEntityNames(this.jdlObject);
    }
    this.jdlObject.forEachOption(jdlOption => {
      if (jdlOption.getType() === 'BINARY' && !jdlOption.value) {
        throw new Error(`The '${jdlOption.name}' option needs a value.`);
      }
      if (!!jdlOption.value && !JDLBinaryOption.isValid(jdlOption)) {
        throw new Error(`The '${jdlOption.name}' option is not valid for value '${jdlOption.value}'.`);
      }
      if (
        this.applicationSettings.databaseType &&
        jdlOption.getType() === 'BINARY' &&
        jdlOption.name === BinaryOptions.Options.PAGINATION &&
        this.applicationSettings.databaseType === DatabaseTypes.CASSANDRA
      ) {
        throw new Error("Pagination isn't allowed when the app uses Cassandra.");
      } else {
        jdlOption.entityNames.forEach(entityName => {
          const applications = this.applicationsPerEntityName[entityName];
          if (!applications) {
            return;
          }
          applications.forEach(jdlApplication => {
            if (
              jdlApplication.config.databaseType === DatabaseTypes.CASSANDRA &&
              jdlOption.name === BinaryOptions.Options.PAGINATION
            ) {
              throw new Error(
                "Pagination isn't allowed when the app uses Cassandra, for entity: " +
                  `'${entityName}' and application: '${jdlApplication.config.baseName}'.`
              );
            }
          });
        });
      }
    });
    checkForDTOWithoutService(this.jdlObject);
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
  if (applicationSettings.applicationType === ApplicationTypes.GATEWAY && !applications) {
    return () => true;
  }
  if (applicationSettings.databaseType && !applications) {
    return FieldTypes.getIsType(applicationSettings.databaseType);
  }
  if (
    !applications ||
    (applications.length === 1 && applications[0].config.applicationType === ApplicationTypes.GATEWAY)
  ) {
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

function checkForDTOWithoutService(jdlObject) {
  const dtoOptions = jdlObject.getOptionsForName(BinaryOptions.Options.DTO);
  if (dtoOptions.length !== 0) {
    const serviceEntities = jdlObject
      .getOptionsForName(BinaryOptions.Options.SERVICE)
      .reduce((accumulated, serviceOption) => {
        accumulated.addSetElements(AbstractJDLOption.resolveEntityNames(serviceOption, jdlObject.getEntityNames()));
        return accumulated;
      }, new Set());
    const dtoEntities = dtoOptions.reduce((accumulated, dtoOption) => {
      accumulated.addSetElements(AbstractJDLOption.resolveEntityNames(dtoOption, jdlObject.getEntityNames()));
      return accumulated;
    }, new Set());
    const difference = getDifferenceBetweenSets(dtoEntities, serviceEntities);
    if (difference.length !== 0) {
      throw new Error(
        `Selecting DTOs without services is forbidden, for entit${
          difference.length > 1 ? 'ies' : 'y'
        } ${difference.join(', ')}.`
      );
    }
  }
}

function getDifferenceBetweenSets(firstSet, secondSet) {
  const difference = [];

  firstSet.forEach(element => {
    if (!secondSet.has(element)) {
      difference.push(element);
    }
  });

  return difference;
}
