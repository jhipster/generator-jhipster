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

const { merge } = require('../utils/object_utils');
const CustomSet = require('../utils/objects/custom_set');
const DeprecationUtils = require('../utils/deprecation_utils');
const ErrorCases = require('../exceptions/error_cases').ErrorCases;

class AbstractJDLOption {
  constructor(args) {
    const merged = merge(defaults(), args);
    if (!merged.name) {
      throw new Error("The option's name must be passed to create an option.");
    }
    this.name = merged.name;
    this.entityNames = new CustomSet(merged.entityNames);
    if (this.entityNames.size === 0) {
      this.entityNames.add('*');
    }
    this.excludedNames = new CustomSet(merged.excludedNames);
  }

  addEntity(entity) {
    DeprecationUtils.displayMethodDeprecationMessage({
      deprecatedMethod: 'AbstractJDLOption#addEntity',
      preferredMethod: 'AbstractJDLOption#addEntityName'
    });
    if (!entity) {
      throw new Error('An entity has to be passed so as to be added to the option.');
    }
    if (!entity.name) {
      throw new Error('The entity must have a name so as to be added to the option.');
    }
    return this.addEntityName(entity.name);
  }

  addEntityName(entityName) {
    if (!entityName) {
      throw new Error('An entity name has to be passed so as to be added to the option.');
    }
    if (this.excludedNames.has(entityName)) {
      return false;
    }
    if (this.entityNames.has('*')) {
      this.entityNames.delete('*');
    }
    return this.entityNames.add(entityName);
  }

  addEntitiesFromAnotherOption(option) {
    if (!option || !AbstractJDLOption.isValid(option)) {
      return false;
    }
    this.entityNames.addAll(option.entityNames);
    this.excludedNames.addAll(option.excludedNames);
    return true;
  }

  excludeEntity(entity) {
    DeprecationUtils.displayMethodDeprecationMessage({
      deprecatedMethod: 'AbstractJDLOption#excludeEntity',
      preferredMethod: 'AbstractJDLOption#excludeEntityName'
    });
    if (!entity) {
      throw new Error('An entity has to be passed so as to be excluded from the option.');
    }
    if (!entity.name) {
      throw new Error('The entity must have a name so as to be excluded from the option.');
    }
    this.excludeEntityName(entity.name);
  }

  excludeEntityName(entityName) {
    if (!entityName) {
      throw new Error('An entity name has to be passed so as to be excluded from the option.');
    }
    if (this.entityNames.has(entityName)) {
      return;
    }
    this.excludedNames.add(entityName);
  }

  getType() {
    throw new Error('Unsupported operation');
  }

  setEntityNames(newEntityNames) {
    this.entityNames = new CustomSet(newEntityNames);
  }

  static checkValidity(object) {
    const errors = [];
    if (!object) {
      errors.push(ErrorCases.options.NoOption);
      return errors;
    }
    if (!object.name) {
      errors.push(ErrorCases.options.NoName);
    }
    if (!object.entityNames) {
      errors.push(ErrorCases.options.NoEntityNames);
    }
    if (object.entityNames && object.entityNames.has(null)) {
      errors.push(ErrorCases.options.NilInEntityNames);
    }
    if (!object.excludedNames) {
      errors.push(ErrorCases.options.NoExcludedNames);
    }
    if (object.excludedNames && object.excludedNames.has(null)) {
      errors.push(ErrorCases.options.NilInExcludedNames);
    }
    try {
      object.getType();
    } catch (error) {
      errors.push(ErrorCases.options.NoType);
    }
    return errors;
  }

  static isValid(object) {
    const errors = this.checkValidity(object);
    return errors.length === 0;
  }

  /**
   * Resolves the option's list of entity names (without '*' and taking into account the excluded names).
   * @param option the option.
   * @param entityNames all the entity names declared in a JDL Object.
   * @returns the resolved list.
   */
  static resolveEntityNames(option, entityNames) {
    if (!option) {
      throw new Error('An option has to be passed to resolve its entity names.');
    }
    if (!entityNames) {
      throw new Error("Entity names have to be passed to resolve the option's entities.");
    }
    const resolvedEntityNames = option.entityNames.has('*') ? new CustomSet(entityNames) : option.entityNames;

    if (option.excludedNames.size !== 0) {
      return resolvedEntityNames.filter(entityName => !option.excludedNames.has(entityName));
    }

    return resolvedEntityNames;
  }
}

module.exports = AbstractJDLOption;

function defaults() {
  return {
    entityNames: new CustomSet(['*']),
    excludedNames: new CustomSet()
  };
}
