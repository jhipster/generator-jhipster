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

/** Generates again, with the entities given changed. */
const generateAgain = (entities: Record<string, any>[]) =>
  result
    .create(`jhipster:${generator}`)
    .withFiles(Object.fromEntries(entities.map(entity => [`.jhipster/${entity.name}.json`, entity])))
    .run();

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
        entity: {
          fields: [
            { fieldName: 'id', fieldType: 'Long', id: true },
            { fieldName: 'code', fieldType: 'String' },
          ],
        },
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
        .withJHipsterConfig({}, [{ ...order, fields: [...order.fields, { fieldName: 'note', fieldType: 'String' }] }]);
      await generateAgain([changed]);
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

    it('keeps the entity in the last changelog only, at its final properties', () => {
      const objects = changelogObjects();
      expect(objects['20200101000100_Order']).not.toHaveProperty('entity');
      const update = Object.values(objects).find(object => object.operation === 'update');
      expect(update.entity.fields.map((field: Record<string, any>) => field.fieldName)).toEqual(['id', 'code', 'total']);
      expect(update.entity.fields[0]).toMatchObject({ fieldName: 'id', id: true });
    });

    it('gives the previous state to the changelog of this generation', () => {
      const update = (result.generator as Generator).changelogs.find(changelog => changelog.operation === 'update');
      expect(update?.previousEntity?.fields.map((field: Record<string, any>) => field.fieldName)).toEqual(['id', 'code', 'note']);
      expect(Object.values(changelogObjects()).find(object => object.operation === 'update')).not.toHaveProperty('previousEntity');
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
          { ...order, relationships: [relationship('buyer'), relationship('seller'), relationship('owner')] },
        ]);
      await generateAgain([
        {
          ...order,
          relationships: [
            relationship('buyer', { relationshipType: 'one-to-one' }),
            relationship('seller', { options: { onDelete: 'CASCADE' } }),
            relationship('owner', { options: { id: true } }),
          ],
          entityTableName: 'customer_order',
          documentation: 'The orders of a customer',
        },
      ]);
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
      await helpers.runJHipster(generator).withJHipsterConfig({}, [customer, recorded as any]);
      await generateAgain([
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
        },
      ]);
    });

    it('records no changelog', () => {
      expect(Object.keys(changelogObjects())).toEqual(['20200101000000_Customer', '20200101000100_Order']);
    });
  });

  describe('with a column constraint changed after its changelog', () => {
    before(async () => {
      await helpers.runJHipster(generator).withJHipsterConfig({}, [order]);
      await generateAgain([{ ...order, fields: [{ fieldName: 'code', fieldType: 'String', fieldValidateRules: ['unique'] }] }]);
    });

    it('records a changelog of the changed field', () => {
      const update = Object.values(changelogObjects()).find(object => object.operation === 'update');
      expect(update).toMatchObject({ changedFields: ['code'], addedFields: [], removedFields: [] });
    });
  });

  describe('with a relational database', () => {
    const customer = { name: 'Customer', changelogDate: '20200101000000', fields: [], relationships: [] };

    before(async () => {
      await helpers
        .runJHipster(generator)
        // An application with a backend: the server prepares the database of its entities.
        .onGenerator(async generator => {
          await (generator as Generator).dependsOnBootstrap('server');
        })
        .withJHipsterConfig({ databaseType: 'sql', prodDatabaseType: 'postgresql' }, [
          customer,
          {
            ...order,
            fields: [{ fieldName: 'code', fieldType: 'String', fieldValidateRules: ['required', 'unique'] }],
            relationships: [
              { relationshipName: 'customers', otherEntityName: 'customer', relationshipType: 'many-to-many', relationshipSide: 'left' },
            ],
          } as any,
        ]);
    });

    it('records the entity at the final properties of its database', () => {
      const { entity } = changelogObjects()['20200101000100_Order'];
      expect(entity.entityTableName).toBe('order');
      expect(entity.fields[1]).toMatchObject({
        fieldName: 'code',
        columnName: 'code',
        columnRequired: true,
        unique: true,
        uniqueConstraintName: 'ux_order__code',
      });
      expect(entity.relationships[0]).toMatchObject({
        relationshipName: 'customers',
        ownerSide: true,
        joinTable: { name: 'rel_order__customers' },
      });
      expect(entity.relationships[0].joinTable.joinColumns).toEqual([{ name: 'order_id', referencedColumnName: 'id' }]);
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
