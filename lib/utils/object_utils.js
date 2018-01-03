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

const BuildException = require('../exceptions/exception_factory').BuildException;
const exceptions = require('../exceptions/exception_factory').exceptions;

module.exports = {
  merge,
  values,
  areEntitiesEqual: areJHipsterEntitiesEqual
};

/**
 * Merge two objects.
 * The order is important here: o1.merge(o2) means that the keys values of o2
 * will replace those identical to o1.
 * The keys that don't belong to the other object will be added.
 * @param object2 the object to be merged with.
 * @returns {Object} the object result of the merge
 */
function merge(object1, object2) {
  if (!object1 || Object.keys(object1).length === 0) {
    return object2;
  }
  if (!object2 || Object.keys(object2).length === 0) {
    return object1;
  }
  const merged = {};
  Object.keys(object1).forEach((key) => {
    merged[key] = object1[key];
  });
  Object.keys(object2).forEach((key) => {
    merged[key] = object2[key];
  });
  return merged;
}

function values(object) {
  if (object == null) {
    throw new BuildException(exceptions.NullPointer, 'The passed object must not be nil.');
  }
  const values = [];
  for (let i = 0, keys = Object.keys(object); i < keys.length; i++) {
    values.push(object[keys[i]]);
  }
  return values;
}

function areJHipsterEntitiesEqual(firstEntity, secondEntity) {
  if (firstEntity.fields.length !== secondEntity.fields.length
    || firstEntity.relationships.length !== secondEntity.relationships.length
    || firstEntity.javadoc !== secondEntity.javadoc
    || firstEntity.entityTableName !== secondEntity.entityTableName) {
    return false;
  }
  return areFieldsEqual(firstEntity.fields, secondEntity.fields)
    && areRelationshipsEqual(firstEntity.relationships, secondEntity.relationships)
    && areOptionsTheSame(firstEntity, secondEntity);
}

function areFieldsEqual(firstFields, secondFields) {
  return firstFields.every((field, index) => {
    if (Object.keys(field).length !== Object.keys(secondFields[index]).length) {
      return false;
    }
    const secondEntityField = secondFields[index];
    return Object.keys(field).every((key) => {
      if (field[key].constructor === Array) {
        return field[key].toString() === secondEntityField[key].toString();
      }
      return field[key] === secondEntityField[key];
    });
  });
}

function areRelationshipsEqual(firstRelationships, secondRelationships) {
  return firstRelationships.every((relationship, index) => {
    if (Object.keys(relationship).length !== Object.keys(secondRelationships[index]).length) {
      return false;
    }
    const secondEntityRelationship = secondRelationships[index];
    return Object.keys(relationship).every(key => relationship[key] === secondEntityRelationship[key]);
  });
}

function areOptionsTheSame(firstEntity, secondEntity) {
  return firstEntity.dto === secondEntity.dto && firstEntity.pagination === secondEntity.pagination
    && firstEntity.service === secondEntity.service && firstEntity.searchEngine === secondEntity.searchEngine;
}
