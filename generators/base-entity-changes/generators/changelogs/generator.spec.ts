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
import { before, describe, expect, it } from 'expect-node';
import { basename, join, resolve } from 'node:path';

import Generator from './generator.ts';
import { hasFormerEntityChangelogs, isNewEntityChangelog } from './support/index.ts';

import { shouldSupportFeatures } from '#test-support';
import { defaultHelpers as helpers, result } from '#testing';

const generator = `${basename(resolve(import.meta.dirname, '../../'))}:${basename(import.meta.dirname)}`;

const order = {
  name: 'Order',
  changelogDate: '20200101000100',
  fields: [{ fieldName: 'code', fieldType: 'String' }],
  relationships: [],
};

const changelogObjects = (): Record<string, any> =>
  (result.fs.readJSON(join(result.cwd, '.yo-rc.json')) as { objects?: Record<string, any> } | undefined)?.objects ?? {};

describe(`generator - ${generator}`, () => {
  shouldSupportFeatures(Generator);

  describe('with an entity without changelog', () => {
    before(async () => {
      await helpers.runJHipster(generator).withJHipsterConfig({}, [order]);
    });

    it('tells it is a changelog of this generation', () => {
      expect(isNewEntityChangelog(result.generator as Generator, { changelogDate: '20200101000100', entityName: 'Order' })).toBe(true);
    });

    it('tells the application had no changelogs', () => {
      expect(hasFormerEntityChangelogs(result.generator as Generator)).toBe(false);
    });

    it('records the changelog creating it, at its changelog date', () => {
      expect(Object.keys(changelogObjects())).toEqual(['20200101000100_Order']);
      expect(changelogObjects()['20200101000100_Order']).toMatchObject({
        type: 'changelog',
        operation: 'create',
        entityName: 'Order',
        changelogDate: '20200101000100',
        entity: { fields: [{ fieldName: 'code', fieldType: 'String' }] },
      });
    });
  });

  describe('with an entity created as an incremental changelog', () => {
    before(async () => {
      await helpers.runJHipster(generator).withJHipsterConfig({}, [
        {
          ...order,
          changelogDate: undefined,
          annotations: { incrementalChangelogDate: '20200101000200' },
        },
      ]);
    });

    it('records the changelog creating it at its incremental changelog date', () => {
      expect(Object.keys(changelogObjects())).toEqual(['20200101000200_Order']);
    });
  });

  describe('with the entities of a project on the disk, without changelogs', () => {
    before(async () => {
      await helpers.runJHipster(generator).withJHipsterConfig({}, [order]).commitFiles();
    });

    it('tells they are not changelogs of this generation', () => {
      expect(isNewEntityChangelog(result.generator as Generator, { changelogDate: '20200101000100', entityName: 'Order' })).toBe(false);
    });

    it('tells the application had no changelogs', () => {
      expect(hasFormerEntityChangelogs(result.generator as Generator)).toBe(false);
    });

    it('records the changelogs creating them, from the disk', () => {
      expect(changelogObjects()['20200101000100_Order']).toMatchObject({ operation: 'create', entityName: 'Order' });
      expect(Object.keys(changelogObjects())).toHaveLength(1);
    });
  });

  describe('with an entity changed after its changelog', () => {
    const changed = {
      ...order,
      fields: [
        { fieldName: 'code', fieldType: 'Integer' },
        { fieldName: 'total', fieldType: 'BigDecimal' },
      ],
    };

    before(async () => {
      await helpers
        .runJHipster(generator)
        .withJHipsterConfig({}, [changed])
        .withYoRcConfig('objects', {
          '20200101000100_Order': {
            type: 'changelog',
            operation: 'create',
            entityName: 'Order',
            changelogDate: '20200101000100',
            entity: {
              name: 'Order',
              changelogDate: '20200101000100',
              fields: [...order.fields, { fieldName: 'note', fieldType: 'String' }],
              relationships: [],
            },
          },
        });
    });

    it('tells the application had changelogs', () => {
      expect(hasFormerEntityChangelogs(result.generator as Generator)).toBe(true);
    });

    it('records a changelog of the changes, the recorded one kept', () => {
      const objects = changelogObjects();
      expect(Object.keys(objects)).toHaveLength(2);
      const update = Object.values(objects).find(object => object.operation === 'update');
      expect(update).toMatchObject({
        type: 'changelog',
        entityName: 'Order',
        addedFields: ['total'],
        removedFields: ['note'],
        changedFields: ['code'],
        changedProperties: [],
        addedRelationships: [],
        removedRelationships: [],
        recreatedRelationships: [],
        optionsChangedRelationships: [],
      });
      expect(update.changelogDate > '20200101000100').toBe(true);
    });
  });

  describe('with relationships and properties changed after its changelog', () => {
    const customer = { name: 'Customer', changelogDate: '20200101000000', fields: [], relationships: [] };
    const relationship = (relationshipName: string, options: Record<string, any> = {}) => ({
      relationshipName,
      otherEntityName: 'customer',
      relationshipType: 'many-to-one' as const,
      ...options,
    });

    before(async () => {
      await helpers
        .runJHipster(generator)
        .withJHipsterConfig({}, [
          customer,
          {
            ...order,
            relationships: [
              relationship('buyer', { relationshipType: 'one-to-one' as const }),
              relationship('seller', { options: { onDelete: 'CASCADE' } }),
              relationship('owner', { options: { id: true } }),
            ],
            entityTableName: 'customer_order',
            documentation: 'The orders of a customer',
          } as any,
        ])
        .withYoRcConfig('objects', {
          '20200101000000_Customer': {
            type: 'changelog',
            operation: 'create',
            entityName: 'Customer',
            changelogDate: '20200101000000',
            entity: customer,
          },
          '20200101000100_Order': {
            type: 'changelog',
            operation: 'create',
            entityName: 'Order',
            changelogDate: '20200101000100',
            entity: { ...order, relationships: [relationship('buyer'), relationship('seller'), relationship('owner')] },
          },
        });
    });

    it('tells the relationships to recreate from the ones changed only in their options', () => {
      const update = Object.values(changelogObjects()).find(object => object.operation === 'update');
      expect(update).toMatchObject({ recreatedRelationships: ['buyer', 'owner'], optionsChangedRelationships: ['seller'] });
    });

    it('tells the properties of the entity that changed its table, the other ones aside', () => {
      const update = Object.values(changelogObjects()).find(object => object.operation === 'update');
      expect(update).toMatchObject({ changedProperties: ['entityTableName'] });
    });
  });

  describe('with an entity changed outside of its database schema after its changelog', () => {
    const customer = { name: 'Customer', changelogDate: '20200101000000', fields: [], relationships: [] };
    const recorded = {
      ...order,
      fields: [{ fieldName: 'code', fieldType: 'String', fieldValidateRules: ['required'] }],
      relationships: [{ relationshipName: 'customer', otherEntityName: 'customer', relationshipType: 'many-to-one' }],
    };

    before(async () => {
      await helpers
        .runJHipster(generator)
        .withJHipsterConfig({}, [
          customer,
          {
            ...recorded,
            pagination: 'pagination',
            dto: 'mapstruct',
            documentation: 'The orders',
            fields: [
              {
                ...recorded.fields[0],
                fieldValidateRules: ['required', 'minlength'],
                fieldValidateRulesMinlength: 2,
                documentation: 'A code',
              },
              { fieldName: 'label', fieldType: 'String', transient: true },
            ],
            relationships: [{ ...recorded.relationships[0], otherEntityField: 'name' }],
          } as any,
        ])
        .withYoRcConfig('objects', {
          '20200101000000_Customer': {
            type: 'changelog',
            operation: 'create',
            entityName: 'Customer',
            changelogDate: '20200101000000',
            entity: customer,
          },
          '20200101000100_Order': {
            type: 'changelog',
            operation: 'create',
            entityName: 'Order',
            changelogDate: '20200101000100',
            entity: recorded,
          },
        });
    });

    it('records no changelog', () => {
      expect(Object.keys(changelogObjects())).toEqual(['20200101000000_Customer', '20200101000100_Order']);
    });
  });

  describe('with a column constraint changed after its changelog', () => {
    before(async () => {
      await helpers
        .runJHipster(generator)
        .withJHipsterConfig({}, [{ ...order, fields: [{ fieldName: 'code', fieldType: 'String', fieldValidateRules: ['unique'] }] }])
        .withYoRcConfig('objects', {
          '20200101000100_Order': {
            type: 'changelog',
            operation: 'create',
            entityName: 'Order',
            changelogDate: '20200101000100',
            entity: order,
          },
        });
    });

    it('records a changelog of the changed field', () => {
      const update = Object.values(changelogObjects()).find(object => object.operation === 'update');
      expect(update).toMatchObject({ changedFields: ['code'], addedFields: [], removedFields: [] });
    });
  });

  describe('with an entity removed after its changelog', () => {
    before(async () => {
      await helpers
        .runJHipster(generator)
        .withJHipsterConfig()
        .withYoRcConfig('objects', {
          '20200101000100_Order': {
            type: 'changelog',
            operation: 'create',
            entityName: 'Order',
            changelogDate: '20200101000100',
            entity: order,
          },
        });
    });

    it('records the changelog removing it', () => {
      const removal = Object.values(changelogObjects()).find(object => object.operation === 'remove');
      expect(removal).toMatchObject({ type: 'changelog', entityName: 'Order' });
      expect(removal).not.toHaveProperty('entity');
    });
  });

  describe('generated again without changes', () => {
    before(async () => {
      await helpers.runJHipster(generator).withJHipsterConfig({}, [order]);
      await result.create(`jhipster:${generator}`).run();
    });

    it('records no other changelog', () => {
      expect(Object.keys(changelogObjects())).toEqual(['20200101000100_Order']);
    });
  });
});
