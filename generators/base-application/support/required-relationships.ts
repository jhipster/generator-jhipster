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

/** What the detection of required relationships reads of an entity: its relationships and their other entity. */
type EntityWithRequiredRelationships = {
  relationships?: { relationshipRequired?: boolean; id?: boolean; otherEntity: EntityWithRequiredRelationships }[];
};

/** Whether a relationship must be set to create its entity: required, or part of its id. */
export const isRequiredRelationship = (relationship: { relationshipRequired?: boolean; id?: boolean }): boolean =>
  Boolean(relationship.relationshipRequired || relationship.id);

/**
 * Whether a chain of required relationships from an entity comes back to an entity of the chain: the entity itself, or
 * one it requires (A → B → C → B), so creating it requires creating an entity that requires itself.
 */
export const hasCyclicRequiredRelationship = (
  entity: EntityWithRequiredRelationships,
  path: Set<EntityWithRequiredRelationships> = new Set(),
): boolean => {
  if (path.has(entity)) return true;
  path.add(entity);
  const cyclic = (entity.relationships ?? []).some(
    relationship => isRequiredRelationship(relationship) && hasCyclicRequiredRelationship(relationship.otherEntity, path),
  );
  path.delete(entity);
  return cyclic;
};
