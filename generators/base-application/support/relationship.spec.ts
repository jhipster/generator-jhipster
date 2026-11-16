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

import type { Entity } from '../types.ts';

import { loadEntitiesOtherSide } from './relationship.ts';

// The json entities of `relationship OneToOne { Country to Capital }` and `relationship OneToMany { Country to Region }`,
// as the jdl writes them: naming no field, the relationships are bidirectional.
const entitiesEmbeddingWithBackReference = () =>
  [
    {
      name: 'Country',
      relationships: [
        { relationshipName: 'capital', otherEntityName: 'capital', otherEntityRelationshipName: 'country', relationshipType: 'one-to-one' },
        { relationshipName: 'region', otherEntityName: 'region', otherEntityRelationshipName: 'country', relationshipType: 'one-to-many' },
      ],
    },
    {
      name: 'Capital',
      embedded: true,
      relationships: [
        { relationshipName: 'country', otherEntityName: 'country', otherEntityRelationshipName: 'capital', relationshipType: 'one-to-one' },
      ],
    },
    {
      name: 'Region',
      embedded: true,
      relationships: [
        { relationshipName: 'country', otherEntityName: 'country', otherEntityRelationshipName: 'region', relationshipType: 'many-to-one' },
      ],
    },
  ] as unknown as Entity[];

describe('generator - base-application - support - loadEntitiesOtherSide', () => {
  describe('with back references at embedded entities', () => {
    it('drops the back references of the embedded entities', () => {
      const [country, capital, region] = entitiesEmbeddingWithBackReference();
      loadEntitiesOtherSide([country, capital, region]);
      expect(capital.relationships).toEqual([]);
      expect(region.relationships).toEqual([]);
    });

    it('keeps the relationships embedding the entities, without other side', () => {
      const [country, capital, region] = entitiesEmbeddingWithBackReference();
      loadEntitiesOtherSide([country, capital, region]);
      expect(country.relationships.map(({ relationshipName }) => relationshipName)).toEqual(['capital', 'region']);
      expect(country.relationships.map(({ otherEntity }) => otherEntity)).toEqual([capital, region]);
      expect(country.relationships.map(({ otherRelationship }) => otherRelationship)).toEqual([undefined, undefined]);
    });

    it('warns about the dropped back references', () => {
      const result = loadEntitiesOtherSide(entitiesEmbeddingWithBackReference());
      expect(result.warning).toEqual([
        "Ignoring the relationship 'country' of the embedded entity 'Capital': relationships with embedded entities are unidirectional",
        "Ignoring the relationship 'country' of the embedded entity 'Region': relationships with embedded entities are unidirectional",
      ]);
    });
  });

  it('keeps a relationship of an embedded entity to an entity not embedding it', () => {
    const [country, , region] = entitiesEmbeddingWithBackReference();
    country.relationships = [];
    const result = loadEntitiesOtherSide([country, region]);
    expect(region.relationships.map(({ relationshipName }) => relationshipName)).toEqual(['country']);
    expect(region.relationships[0].otherEntity).toBe(country);
    expect(result.warning).toEqual([]);
  });
});
