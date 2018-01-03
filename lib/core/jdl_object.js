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

const JDLEntity = require('./jdl_entity');
const JDLEnum = require('./jdl_enum');
const JDLRelationship = require('./jdl_relationship');
const JDLRelationships = require('./jdl_relationships');
const JDLAbstractRelationship = require('./abstract_jdl_option');
const JDLOptions = require('./jdl_options');
const BuildException = require('../exceptions/exception_factory').BuildException;
const exceptions = require('../exceptions/exception_factory').exceptions;

class JDLObject {
  constructor() {
    this.entities = {};
    this.enums = {};
    this.relationships = new JDLRelationships();
    this.options = new JDLOptions();
  }

  getOptions() {
    return this.options.getOptions();
  }

  /**
   * Adds or replaces an entity.
   * @param entity the entity to add.
   */
  addEntity(entity) {
    const errors = JDLEntity.checkValidity(entity);
    if (errors.length !== 0) {
      throw new BuildException(
        exceptions.InvalidObject,
        `The entity must be valid in order to be added.\nErrors: ${errors.join(', ')}`);
    }
    this.entities[entity.name] = entity;
  }

  /**
   * Adds or replaces an enum.
   * @param enumToAdd the enum to add.
   */
  addEnum(enumToAdd) {
    const errors = JDLEnum.checkValidity(enumToAdd);
    if (errors.length !== 0) {
      throw new BuildException(
        exceptions.InvalidObject,
        `The enum must be valid in order to be added.\nErrors: ${errors.join(', ')}`);
    }
    this.enums[enumToAdd.name] = enumToAdd;
  }

  addRelationship(relationship) {
    const errors = JDLRelationship.checkValidity(relationship);
    if (errors.length !== 0) {
      throw new BuildException(
        exceptions.InvalidObject,
        `The relationship must be valid in order to be added.\nErrors: ${errors.join(', ')}`);
    }
    this.relationships.add(relationship);
  }

  addOption(option) {
    const errors = JDLAbstractRelationship.checkValidity(option);
    if (errors.length !== 0) {
      throw new BuildException(
        exceptions.InvalidObject,
        `The option must be valid in order to be added.\nErrors: ${errors.join(', ')}`);
    }
    this.options.addOption(option);
  }

  toString() {
    let string = '';
    string += `${entitiesToString(this.entities)}\n`;
    string += `${enumsToString(this.enums)}\n`;
    string += `${relationshipsToString(this.relationships)}\n`;
    string += `${optionsToString(this.options)}`;
    return string;
  }
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
