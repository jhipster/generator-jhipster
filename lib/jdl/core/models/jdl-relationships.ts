/**
 * Copyright 2013-2026 the original author or authors from the JHipster project.
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

import { relationshipTypes } from '../basic-types/index.ts';
import { relationshipTypeExists } from '../basic-types/relationship-types.ts';
import type { JDLRelationshipType } from '../basic-types/relationships.ts';

import type JDLRelationship from './jdl-relationship.ts';

export default class JDLRelationships {
  relationships: Record<JDLRelationshipType, Map<string, JDLRelationship>>;

  constructor() {
    this.relationships = {
      OneToOne: new Map(),
      OneToMany: new Map(),
      ManyToOne: new Map(),
      ManyToMany: new Map(),
    };
  }

  add(relationship: JDLRelationship): void {
    if (!relationship) {
      throw new Error('A relationship must be passed so as to be added.');
    }
    this.relationships[relationship.type].set(relationship.getId(), relationship);
  }

  getOneToOne(relationshipId: string): JDLRelationship | undefined {
    return this.get(relationshipTypes.ONE_TO_ONE, relationshipId);
  }

  getOneToMany(relationshipId: string): JDLRelationship | undefined {
    return this.get(relationshipTypes.ONE_TO_MANY, relationshipId);
  }

  getManyToOne(relationshipId: string): JDLRelationship | undefined {
    return this.get(relationshipTypes.MANY_TO_ONE, relationshipId);
  }

  getManyToMany(relationshipId: string): JDLRelationship | undefined {
    return this.get(relationshipTypes.MANY_TO_MANY, relationshipId);
  }

  get(type: JDLRelationshipType, relationshipId: string): JDLRelationship | undefined {
    if (!relationshipTypeExists(type)) {
      throw new Error(`A valid relationship type must be passed so as to retrieve the relationship, got '${type}'.`);
    }
    if (!relationshipId) {
      throw new Error('A relationship id must be passed so as to retrieve the relationship.');
    }
    return this.relationships[type].get(relationshipId);
  }

  oneToOneQuantity(): number {
    return this.relationships.OneToOne.size;
  }

  oneToManyQuantity(): number {
    return this.relationships.OneToMany.size;
  }

  manyToOneQuantity(): number {
    return this.relationships.ManyToOne.size;
  }

  manyToManyQuantity(): number {
    return this.relationships.ManyToMany.size;
  }

  size(): number {
    return this.oneToOneQuantity() + this.oneToManyQuantity() + this.manyToOneQuantity() + this.manyToManyQuantity();
  }

  forEach(passedFunction: (relationship: JDLRelationship) => void) {
    if (!passedFunction) {
      return;
    }
    this.toArray().forEach(jdlRelationship => {
      passedFunction(jdlRelationship);
    });
  }

  toArray(): JDLRelationship[] {
    const relationships: any[] = [];
    Object.keys(this.relationships).forEach(type => {
      this.relationships[type as JDLRelationshipType].forEach(relationship => {
        relationships.push(relationship);
      });
    });
    return relationships;
  }

  toString(): string {
    if (this.size() === 0) {
      return '';
    }
    return Object.entries(this.relationships)
      .map(([key, relationships]) => (relationships.size > 0 ? relationshipTypeToString(relationships, key) : undefined))
      .filter(Boolean)
      .join('\n');
  }
}

function relationshipTypeToString(relationships: Map<string, JDLRelationship>, type: string) {
  const relationshipsLines = [...relationships.values()].map(relationship => relationship.toString().split('\n').slice(1, -1)).flat();
  return `relationship ${type} {
${relationshipsLines.join('\n')}
}`;
}
