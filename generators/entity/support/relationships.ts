/**
 * Copyright 2013-2024 the original author or authors from the JHipster project.
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
const RELATIONSHIP_VALUE_ONE_TO_ONE = 'one-to-one';
const RELATIONSHIP_VALUE_ONE_TO_MANY = 'one-to-many';
const RELATIONSHIP_VALUE_MANY_TO_ONE = 'many-to-one';
const RELATIONSHIP_VALUE_MANY_TO_MANY = 'many-to-many';

export const ONE_TO_ONE = 'ONE_TO_ONE';
export const ONE_TO_MANY = 'ONE_TO_MANY';
export const MANY_TO_ONE = 'MANY_TO_ONE';
export const MANY_TO_MANY = 'MANY_TO_MANY';

type JHipsterOptionRelationshipTypeValue = 'one-to-one' | 'one-to-many' | 'many-to-one' | 'many-to-many';

export const RelationshipTypes: Record<'ONE_TO_ONE' | 'ONE_TO_MANY' | 'MANY_TO_ONE' | 'MANY_TO_MANY', JHipsterOptionRelationshipTypeValue> =
  {
    ONE_TO_ONE: RELATIONSHIP_VALUE_ONE_TO_ONE,
    ONE_TO_MANY: RELATIONSHIP_VALUE_ONE_TO_MANY,
    MANY_TO_ONE: RELATIONSHIP_VALUE_MANY_TO_ONE,
    MANY_TO_MANY: RELATIONSHIP_VALUE_MANY_TO_MANY,
  };

const RELATIONSHIP_SIDE_VALUE_LEFT = 'left';
const RELATIONSHIP_SIDE_VALUE_RIGHT = 'right';
export const LEFT = 'LEFT';
export const RIGHT = 'RIGHT';

type JHipsterOptionRelationshipSideValue = 'left' | 'right';

export const RelationshipDirections: Record<'LEFT' | 'RIGHT', JHipsterOptionRelationshipSideValue> = {
  LEFT: RELATIONSHIP_SIDE_VALUE_LEFT,
  RIGHT: RELATIONSHIP_SIDE_VALUE_RIGHT,
};
