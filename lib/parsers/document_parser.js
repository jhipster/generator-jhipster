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
const JDLMicroserviceApplication = require('../core/jdl_microservice_application');
const JDLMonolithApplication = require('../core/jdl_monolith_application');
const JDLGatewayApplication = require('../core/jdl_gateway_application');
const JDLUaaApplication = require('../core/jdl_uaa_application');
const JDLDeployment = require('../core/jdl_deployment');
const JDLEntity = require('../core/jdl_entity');
const JDLEnum = require('../core/jdl_enum');
const JDLField = require('../core/jdl_field');
const JDLRelationship = require('../core/jdl_relationship');
const JDLValidation = require('../core/jdl_validation');
const JDLUnaryOption = require('../core/jdl_unary_option');
const JDLBinaryOption = require('../core/jdl_binary_option');
const ApplicationTypes = require('../core/jhipster/application_types');
const UnaryOptions = require('../core/jhipster/unary_options');
const BinaryOptions = require('../core/jhipster/binary_options');
const Validations = require('../core/jhipster/validations');
const { lowerFirst, upperFirst } = require('../utils/string_utils');
const { formatComment } = require('../utils/format_utils');

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
  configuration.document.applications.forEach(application => {
    if (configuration.generatorVersion) {
      application.config.jhipsterVersion = configuration.generatorVersion;
    }
    const jdlApplication = createJDLApplication(application);
    jdlObject.addApplication(jdlApplication);
    fillApplicationsPerEntityName(jdlApplication);
  });
}

function fillDeployments() {
  configuration.document.deployments.forEach(deployment => {
    jdlObject.addDeployment(new JDLDeployment(deployment));
  });
}

function createJDLApplication(application) {
  let jdlApplication = null;
  switch (application.config.applicationType) {
    case ApplicationTypes.MICROSERVICE:
      jdlApplication = new JDLMicroserviceApplication({
        config: application.config,
        entities: getApplicationEntities(application)
      });
      break;
    case ApplicationTypes.GATEWAY:
      jdlApplication = new JDLGatewayApplication({
        config: application.config,
        entities: getApplicationEntities(application)
      });
      break;
    case ApplicationTypes.UAA:
      jdlApplication = new JDLUaaApplication({
        config: application.config,
        entities: getApplicationEntities(application)
      });
      break;
    default:
      jdlApplication = new JDLMonolithApplication({
        config: application.config,
        entities: getApplicationEntities(application)
      });
  }
  return jdlApplication;
}

function fillApplicationsPerEntityName(application) {
  application.entityNames.forEach(entity => {
    applicationsPerEntityName[entity] = applicationsPerEntityName[entity] || [];
    applicationsPerEntityName[entity].push(application);
  });
}

function getApplicationEntities(application) {
  let applicationEntities = application.entities.entityList;
  if (application.entities.entityList.includes('*')) {
    applicationEntities = configuration.document.entities.map(entity => entity.name);
  }
  if (application.entities.excluded.length !== 0) {
    applicationEntities = applicationEntities.filter(entity => !application.entities.excluded.includes(entity));
  }
  return applicationEntities;
}

function fillEnums() {
  for (let i = 0; i < configuration.document.enums.length; i++) {
    const enumObj = configuration.document.enums[i];
    jdlObject.addEnum(
      new JDLEnum({
        name: enumObj.name,
        values: enumObj.values,
        comment: formatComment(enumObj.javadoc)
      })
    );
  }
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
    const options = convertAnnotationsToOptions(field.annotations);
    const fieldName = lowerFirst(field.name);
    if (fieldName.toLowerCase() === 'id') {
      continue; // eslint-disable-line no-continue
    }
    const fieldObject = new JDLField({
      name: fieldName,
      type: field.type,
      validations: getValidations(field),
      options
    });
    if (field.javadoc) {
      fieldObject.comment = formatComment(field.javadoc);
    }
    fields[fieldName] = fieldObject;
  }
  return fields;
}

function getValidations(field) {
  const validations = {};
  for (let i = 0; i < field.validations.length; i++) {
    const validation = field.validations[i];
    if (validation.constant) {
      validation.value = configuration.document.constants[validation.value];
    }
    let value = validation.value;
    if (validation.key === Validations.PATTERN) {
      value = formatPatternValidation(value);
    }
    validations[validation.key] = new JDLValidation({
      name: validation.key,
      value
    });
  }
  return validations;
}

function formatPatternValidation(value) {
  if (!value.includes("'")) {
    return value;
  }
  const chunks = value.split("'").map(chunk => {
    if (!chunk.endsWith('\\')) {
      return `${chunk}\\`;
    }
    return chunk;
  });
  return chunks.join("\\'");
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
  fillUnaryOptions();
  fillBinaryOptions();
  if (
    configuration.applicationType === ApplicationTypes.MICROSERVICE &&
    Object.keys(configuration.document.microservice).length === 0
  ) {
    globallyAddMicroserviceOption(configuration.applicationName);
  }
}

function globallyAddMicroserviceOption(applicationName) {
  jdlObject.addOption(
    new JDLBinaryOption({
      name: BinaryOptions.Options.MICROSERVICE,
      value: applicationName,
      entityNames: configuration.document.entities.map(entity => entity.name)
    })
  );
}

function fillUnaryOptions() {
  if (configuration.document.noClient.list.length !== 0) {
    jdlObject.addOption(
      new JDLUnaryOption({
        name: UnaryOptions.SKIP_CLIENT,
        entityNames: configuration.document.noClient.list,
        excludedNames: configuration.document.noClient.excluded
      })
    );
  }
  if (configuration.document.noServer.list.length !== 0) {
    jdlObject.addOption(
      new JDLUnaryOption({
        name: UnaryOptions.SKIP_SERVER,
        entityNames: configuration.document.noServer.list,
        excludedNames: configuration.document.noServer.excluded
      })
    );
  }
  if (configuration.document.noFluentMethod.list.length !== 0) {
    jdlObject.addOption(
      new JDLUnaryOption({
        name: UnaryOptions.NO_FLUENT_METHOD,
        entityNames: configuration.document.noFluentMethod.list,
        excludedNames: configuration.document.noFluentMethod.excluded
      })
    );
  }
  if (configuration.document.filter.list.length !== 0) {
    jdlObject.addOption(
      new JDLUnaryOption({
        name: UnaryOptions.FILTER,
        entityNames: configuration.document.filter.list,
        excludedNames: configuration.document.filter.excluded
      })
    );
  }
  if (configuration.document.readOnly.list.length !== 0) {
    jdlObject.addOption(
      new JDLUnaryOption({
        name: UnaryOptions.READ_ONLY,
        entityNames: configuration.document.readOnly.list,
        excludedNames: configuration.document.readOnly.excluded
      })
    );
  }
}

function fillBinaryOptions() {
  Object.values(BinaryOptions.Options).forEach(optionValue => {
    if (
      configuration.applicationType === ApplicationTypes.MICROSERVICE &&
      optionValue === BinaryOptions.Options.CLIENT_ROOT_FOLDER
    ) {
      jdlObject.addOption(
        new JDLBinaryOption({
          name: BinaryOptions.Options.CLIENT_ROOT_FOLDER,
          value: configuration.applicationName,
          entityNames: configuration.document.entities.map(entity => entity.name)
        })
      );
    }
    Object.keys(configuration.document[optionValue]).forEach(documentOptionKey => {
      addBinaryOption(optionValue, documentOptionKey);
    });
  });
}

function addBinaryOption(key, value) {
  jdlObject.addOption(
    new JDLBinaryOption({
      name: key,
      value,
      entityNames: configuration.document[key][value].list,
      excludedNames: configuration.document[key][value].excluded
    })
  );
}
