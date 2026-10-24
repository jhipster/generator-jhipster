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
import { describe, expect, it } from 'expect-node';

import { hasCyclicRequiredRelationship } from './required-relationships.ts';

type TestEntity = { name: string; relationships: { relationshipRequired?: boolean; id?: boolean; otherEntity: TestEntity }[] };

const entity = (name: string): TestEntity => ({ name, relationships: [] });
const requires = (from: TestEntity, to: TestEntity, kind: 'relationshipRequired' | 'id' = 'relationshipRequired') =>
  from.relationships.push({ [kind]: true, otherEntity: to });

describe('generator - base-application - support - hasCyclicRequiredRelationship', () => {
  it('is false without a cycle', () => {
    const [a, b, c] = [entity('A'), entity('B'), entity('C')];
    requires(a, b);
    requires(b, c);
    requires(a, c);
    expect(hasCyclicRequiredRelationship(a)).toBe(false);
  });

  it('is true for a cycle through the entity', () => {
    const [a, b] = [entity('A'), entity('B')];
    requires(a, b);
    requires(b, a);
    expect(hasCyclicRequiredRelationship(a)).toBe(true);
  });

  it('is true for a cycle only reachable from the entity', () => {
    const [a, b, c] = [entity('A'), entity('B'), entity('C')];
    requires(a, b);
    requires(b, c);
    requires(c, b);
    expect(hasCyclicRequiredRelationship(a)).toBe(true);
  });

  it('is true for a required relationship with the entity itself', () => {
    const a = entity('A');
    requires(a, a);
    expect(hasCyclicRequiredRelationship(a)).toBe(true);
  });

  it('follows the relationships that are part of the id', () => {
    const [a, b] = [entity('A'), entity('B')];
    requires(a, b, 'id');
    requires(b, a);
    expect(hasCyclicRequiredRelationship(a)).toBe(true);
  });

  it('ignores the relationships that are not required', () => {
    const [a, b] = [entity('A'), entity('B')];
    requires(a, b);
    b.relationships.push({ otherEntity: a });
    expect(hasCyclicRequiredRelationship(a)).toBe(false);
  });
});
