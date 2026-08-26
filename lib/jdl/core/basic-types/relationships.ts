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

export const JDL_RELATIONSHIP_ONE_TO_ONE = 'OneToOne';
export const JDL_RELATIONSHIP_ONE_TO_MANY = 'OneToMany';
export const JDL_RELATIONSHIP_MANY_TO_ONE = 'ManyToOne';
export const JDL_RELATIONSHIP_MANY_TO_MANY = 'ManyToMany';

export const RELATIONSHIP_ONE_TO_ONE = 'one-to-one';
export const RELATIONSHIP_ONE_TO_MANY = 'one-to-many';
export const RELATIONSHIP_MANY_TO_ONE = 'many-to-one';
export const RELATIONSHIP_MANY_TO_MANY = 'many-to-many';

export type RelationshipType =
  typeof RELATIONSHIP_ONE_TO_ONE | typeof RELATIONSHIP_ONE_TO_MANY | typeof RELATIONSHIP_MANY_TO_ONE | typeof RELATIONSHIP_MANY_TO_MANY;

export type JDLRelationshipType =
  | typeof JDL_RELATIONSHIP_ONE_TO_ONE
  | typeof JDL_RELATIONSHIP_ONE_TO_MANY
  | typeof JDL_RELATIONSHIP_MANY_TO_ONE
  | typeof JDL_RELATIONSHIP_MANY_TO_MANY;

export const relationshipTypes: Record<'ONE_TO_ONE' | 'ONE_TO_MANY' | 'MANY_TO_ONE' | 'MANY_TO_MANY', JDLRelationshipType> = {
  ONE_TO_ONE: JDL_RELATIONSHIP_ONE_TO_ONE,
  ONE_TO_MANY: JDL_RELATIONSHIP_ONE_TO_MANY,
  MANY_TO_ONE: JDL_RELATIONSHIP_MANY_TO_ONE,
  MANY_TO_MANY: JDL_RELATIONSHIP_MANY_TO_MANY,
};

export type RelationshipSide = 'left' | 'right';
