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

import { saveLegacyBackReferenceNames } from '../../base-application/support/relationship.ts';

import { addEntitiesOtherRelationships } from './relationship.ts';

const createEntities = (relationshipNames: string[], relationshipType = 'one-to-one') => {
  const member: any = { name: 'Member', databaseType: 'sql', relationships: [] };
  const order: any = {
    name: 'Order',
    databaseType: 'sql',
    relationships: relationshipNames.map(relationshipName => ({
      relationshipName,
      relationshipType,
      otherEntityName: 'member',
      otherEntity: member,
      ownerSide: true,
    })),
  };
  return { order, member };
};

/** The back reference names on Member, by the relationship of Order they point back to. */
const backReferences = (relationshipNames: string[], relationshipType?: string) => {
  const { order, member } = createEntities(relationshipNames, relationshipType);
  addEntitiesOtherRelationships([order, member]);
  return Object.fromEntries(
    member.relationships.map((relationship: any) => [relationship.otherEntityRelationshipName, relationship.relationshipName]),
  );
};

describe('generator - server - support - relationship', () => {
  describe('addEntitiesOtherRelationships', () => {
    it('should name the back reference of a single relationship after the relationship', () => {
      expect(backReferences(['publisher'])).toEqual({ publisher: 'orderAsPublisher' });
    });

    for (const relationshipType of ['one-to-one', 'many-to-many']) {
      it(`should give two unidirectional ${relationshipType} relationships to the same entity distinct back references`, () => {
        expect(backReferences(['recipient', 'publisher'], relationshipType)).toEqual({
          recipient: 'orderAsRecipient',
          publisher: 'orderAsPublisher',
        });
      });
    }

    it('should keep the name of a back reference whatever the other relationships and their order', () => {
      expect(backReferences(['publisher']).publisher).toBe('orderAsPublisher');
      expect(backReferences(['recipient', 'publisher']).publisher).toBe('orderAsPublisher');
      expect(backReferences(['publisher', 'recipient']).publisher).toBe('orderAsPublisher');
    });

    it('should keep the name a relationship gives and the backReferenceName option', () => {
      const { order, member } = createEntities(['recipient', 'publisher']);
      order.relationships[0].options = { backReferenceName: 'order' };
      order.relationships[1].otherEntityRelationshipName = 'publishedOrder';

      addEntitiesOtherRelationships([order, member]);

      expect(member.relationships.map((relationship: any) => relationship.relationshipName)).toEqual(['order', 'publishedOrder']);
    });
  });

  describe('saveLegacyBackReferenceNames', () => {
    it('should save the name older versions derived, so the back reference keeps it', () => {
      const { order, member } = createEntities(['publisher']);

      expect(saveLegacyBackReferenceNames(order)).toBe(true);
      expect(order.relationships[0].options).toEqual({ backReferenceName: 'order' });

      addEntitiesOtherRelationships([order, member]);
      expect(member.relationships[0].relationshipName).toBe('order');
    });

    it('should save no name for two relationships to the same entity, which older versions could not generate', () => {
      const { order } = createEntities(['recipient', 'publisher']);

      expect(saveLegacyBackReferenceNames(order)).toBe(false);
      expect(order.relationships.map((relationship: any) => relationship.options)).toEqual([undefined, undefined]);
    });

    it('should save no name for a relationship without a back reference, with a name or with one saved', () => {
      const { order } = createEntities(['owner', 'publisher', 'recipient', 'reviewer']);
      order.relationships[0].relationshipType = 'many-to-one';
      order.relationships[1].otherEntityRelationshipName = 'publishedOrder';
      order.relationships[2].options = { backReferenceName: 'receivedOrder' };
      order.relationships[3].otherEntityName = 'reviewer';

      saveLegacyBackReferenceNames(order);

      expect(order.relationships.map((relationship: any) => relationship.options)).toEqual([
        undefined,
        undefined,
        { backReferenceName: 'receivedOrder' },
        { backReferenceName: 'order' },
      ]);
    });

    it('should save no name for a one-to-one of an entity without SQL, which gets no back reference', () => {
      const { order } = createEntities(['publisher']);

      expect(saveLegacyBackReferenceNames(order, 'mongodb')).toBe(false);
    });
  });
});
