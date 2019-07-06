/**
 * Copyright 2013-2019 the original author or authors from the JHipster project.
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

const RelationshipTypes = require('./jhipster/relationship_types');
const JDLRelationship = require('./jdl_relationship');

class JDLRelationships {
  constructor() {
    this.relationships = {
      OneToOne: new Map(),
      OneToMany: new Map(),
      ManyToOne: new Map(),
      ManyToMany: new Map()
    };
  }

  add(relationship) {
    if (!relationship) {
      throw new Error('A relationship must be passed so as to be added.');
    }
    if (!JDLRelationship.isValid(relationship)) {
      throw new Error('A valid relationship must be passed so as to be added.');
    }
    this.relationships[relationship.type].set(relationship.getId(), relationship);
  }

  getOneToOne(relationshipId) {
    return this.get(RelationshipTypes.ONE_TO_ONE, relationshipId);
  }

  getOneToMany(relationshipId) {
    return this.get(RelationshipTypes.ONE_TO_MANY, relationshipId);
  }

  getManyToOne(relationshipId) {
    return this.get(RelationshipTypes.MANY_TO_ONE, relationshipId);
  }

  getManyToMany(relationshipId) {
    return this.get(RelationshipTypes.MANY_TO_MANY, relationshipId);
  }

  get(type, relationshipId) {
    if (!RelationshipTypes.exists(type)) {
      throw new Error(`A valid relationship type must be passed so as to retrieve the relationship, got '${type}'.`);
    }
    if (!relationshipId) {
      throw new Error('A relationship id must be passed so as to retrieve the relationship.');
    }
    return this.relationships[type].get(relationshipId);
  }

  oneToOneQuantity() {
    return this.relationships.OneToOne.size;
  }

  oneToManyQuantity() {
    return this.relationships.OneToMany.size;
  }

  manyToOneQuantity() {
    return this.relationships.ManyToOne.size;
  }

  manyToManyQuantity() {
    return this.relationships.ManyToMany.size;
  }

  size() {
    return this.oneToOneQuantity() + this.oneToManyQuantity() + this.manyToOneQuantity() + this.manyToManyQuantity();
  }

  forEach(passedFunction) {
    if (!passedFunction) {
      return;
    }
    this.toArray().forEach(jdlRelationship => {
      passedFunction(jdlRelationship);
    });
  }

  toArray() {
    const relationships = [];
    Object.keys(this.relationships).forEach(type => {
      this.relationships[type].forEach(relationship => {
        relationships.push(relationship);
      });
    });
    return relationships;
  }

  toString() {
    if (this.size() === 0) {
      return '';
    }
    let string = '';
    Object.keys(this.relationships).forEach(type => {
      if (this.relationships[type].size !== 0) {
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
  relationships.forEach(internalRelationship => {
    let lines = internalRelationship.toString().split('\n');
    lines = lines.slice(1, lines.length - 1);
    relationship += `${lines.join('\n')},\n`;
  });
  relationship = `${relationship.slice(0, relationship.length - 2)}\n}`;
  return relationship;
}
