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

import { addEntitiesOtherRelationships } from './relationship.ts';

const createEntities = (relationshipType: string) => {
  const member: any = { name: 'Member', databaseType: 'sql', relationships: [] };
  const order: any = {
    name: 'Order',
    databaseType: 'sql',
    relationships: ['recipient', 'publisher'].map(relationshipName => ({
      relationshipName,
      relationshipType,
      otherEntityName: 'member',
      otherEntity: member,
      ownerSide: true,
    })),
  };
  return { order, member };
};

describe('generator - server - support - relationship', () => {
  describe('addEntitiesOtherRelationships', () => {
    for (const relationshipType of ['one-to-one', 'many-to-many']) {
      describe(`with two unidirectional ${relationshipType} relationships to the same entity`, () => {
        it('should give the back references of the other entity distinct names', () => {
          const { order, member } = createEntities(relationshipType);

          addEntitiesOtherRelationships([order, member]);

          expect(member.relationships.map((relationship: any) => relationship.relationshipName)).toEqual(['order', 'orderAsPublisher']);
          expect(order.relationships.map((relationship: any) => relationship.otherEntityRelationshipName)).toEqual([
            'order',
            'orderAsPublisher',
          ]);
        });
      });
    }

    it('should keep the back reference name a relationship gives', () => {
      const { order, member } = createEntities('one-to-one');
      order.relationships[1].otherEntityRelationshipName = 'publishedOrder';

      addEntitiesOtherRelationships([order, member]);

      expect(member.relationships.map((relationship: any) => relationship.relationshipName)).toEqual(['order', 'publishedOrder']);
    });
  });
});
