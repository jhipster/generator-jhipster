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

const JDLRelationship = require('./jdl_relationship');
const BuildException = require('../exceptions/exception_factory').BuildException;
const exceptions = require('../exceptions/exception_factory').exceptions;

class JDLRelationships {
  constructor() {
    this.relationships = {
      OneToOne: {},
      OneToMany: {},
      ManyToOne: {},
      ManyToMany: {}
    };
    this.size = 0;
  }

  add(relationship) {
    if (!relationship) {
      throw new BuildException(exceptions.NullPointer, 'A relationship must be passed.');
    }
    if (!JDLRelationship.isValid(relationship)) {
      throw new BuildException(exceptions.InvalidObject, 'A valid relationship must be passed.');
    }
    this.relationships[relationship.type][relationship.getId()] = relationship;
    this.size++;
  }

  toArray() {
    const relationships = [];
    Object.keys(this.relationships).forEach((type) => {
      Object.keys(this.relationships[type]).forEach((relationshipId) => {
        relationships.push(this.relationships[type][relationshipId]);
      });
    });
    return relationships;
  }

  toString() {
    if (Object.keys(this.relationships).length === 0) {
      return '';
    }
    let string = '';
    Object.keys(this.relationships).forEach((type) => {
      if (Object.keys(this.relationships[type]).length !== 0) {
        const result = relationshipTypeToString(this.relationships[type], type);
        string += `${result}\n`;
      }
    });
    return string.slice(0, string.length - 1);
  }
}

module.exports = JDLRelationships;

function relationshipTypeToString(relationships, type) {
  let relationship = `relationship ${type} {\n`;
  Object.keys(relationships).forEach((internalRelationship) => {
    let lines = relationships[internalRelationship].toString().split('\n');
    lines = lines.slice(1, lines.length - 1);
    relationship += `${lines.join('\n')},\n`;
  });
  relationship = `${relationship.slice(0, relationship.length - 2)}\n}`;
  return relationship;
}
