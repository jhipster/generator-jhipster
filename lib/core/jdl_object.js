/**
 * Copyright 2013-2018 the original author or authors from the JHipster project.
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

const JDLApplication = require('./jdl_application');
const JDLEntity = require('./jdl_entity');
const JDLEnum = require('./jdl_enum');
const JDLRelationship = require('./jdl_relationship');
const JDLRelationships = require('./jdl_relationships');
const AbstractJDLOption = require('./abstract_jdl_option');
const JDLOptions = require('./jdl_options');
const BinaryOptions = require('./jhipster/binary_options');

/**
 * The JDL object class, containing applications, entities etc.
 * TODO: create loop methods for entities, enums etc.
 */
class JDLObject {
  constructor() {
    this.applications = {};
    this.entities = {};
    this.enums = {};
    this.relationships = new JDLRelationships();
    this.options = new JDLOptions();
  }

  getOptions() {
    return this.options.getOptions();
  }

  /**
   * Adds or replaces an application.
   * @param application the application.
   */
  addApplication(application) {
    const errors = JDLApplication.checkValidity(application);
    if (errors.length !== 0) {
      throw new Error(`The application must be valid in order to be added.\nErrors: ${errors.join(', ')}`);
    }
    this.applications[application.config.baseName] = application;
  }

  getApplicationQuantity() {
    return Object.keys(this.applications).length;
  }

  /**
   * Adds or replaces an entity.
   * @param entity the entity to add.
   */
  addEntity(entity) {
    const errors = JDLEntity.checkValidity(entity);
    if (errors.length !== 0) {
      throw new Error(`The entity must be valid in order to be added.\nErrors: ${errors.join(', ')}`);
    }
    this.entities[entity.name] = entity;
  }

  getEntityQuantity() {
    return Object.keys(this.entities).length;
  }

  getEntityNames() {
    return Object.keys(this.entities);
  }

  /**
   * Adds or replaces an enum.
   * @param enumToAdd the enum to add.
   */
  addEnum(enumToAdd) {
    const errors = JDLEnum.checkValidity(enumToAdd);
    if (errors.length !== 0) {
      throw new Error(`The enum must be valid in order to be added.\nErrors: ${errors.join(', ')}`);
    }
    this.enums[enumToAdd.name] = enumToAdd;
  }

  getEnumQuantity() {
    return Object.keys(this.enums).length;
  }

  addRelationship(relationship) {
    const errors = JDLRelationship.checkValidity(relationship);
    if (errors.length !== 0) {
      throw new Error(`The relationship must be valid in order to be added.\nErrors: ${errors.join(', ')}`);
    }
    this.relationships.add(relationship);
  }

  getRelationshipQuantity() {
    return this.relationships.size();
  }

  addOption(option) {
    const errors = AbstractJDLOption.checkValidity(option);
    if (errors.length !== 0) {
      throw new Error(`The option must be valid in order to be added.\nErrors: ${errors.join(', ')}`);
    }
    this.options.addOption(option);
  }

  getOptionsForName(optionName) {
    return this.options.getOptionsForName(optionName);
  }

  isEntityInMicroservice(entityName) {
    const options = this.getOptionsForName(BinaryOptions.Options.MICROSERVICE);
    return options.some(option => option.entityNames.has('*') || option.entityNames.has(entityName));
  }

  getOptionQuantity() {
    return this.options.size();
  }

  toString() {
    let string = '';
    if (Object.keys(this.applications).length !== 0) {
      string += `${applicationsToString(this.applications)}\n`;
    }
    if (Object.keys(this.entities).length !== 0) {
      string += `${entitiesToString(this.entities)}\n`;
    }
    if (Object.keys(this.enums).length !== 0) {
      string += `${enumsToString(this.enums)}\n`;
    }
    if (this.relationships.size() !== 0) {
      string += `${relationshipsToString(this.relationships)}\n`;
    }
    if (this.options.size() !== 0) {
      string += `${optionsToString(this.options)}`;
    }
    return string;
  }
}

function applicationsToString(applications) {
  let string = '';
  Object.keys(applications).forEach((applicationName) => {
    string += `${applications[applicationName].toString()}\n`;
  });
  return string;
}

function entitiesToString(entities) {
  let string = '';
  Object.keys(entities).forEach((entityName) => {
    string += `${entities[entityName].toString()}\n`;
  });
  return string.slice(0, string.length - 1);
}
function enumsToString(enums) {
  let string = '';
  Object.keys(enums).forEach((enumName) => {
    string += `${enums[enumName].toString()}\n`;
  });
  return string;
}
function relationshipsToString(relationships) {
  const string = relationships.toString();
  if (string === '') {
    return '';
  }
  return `${relationships.toString()}\n`;
}
function optionsToString(options) {
  const string = options.toString();
  if (string === '') {
    return '';
  }
  return `${string}\n`;
}

module.exports = JDLObject;
