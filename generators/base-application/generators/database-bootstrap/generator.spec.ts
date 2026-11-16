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
import { basename, dirname, resolve } from 'node:path';

import Generator from './generator.ts';

import { shouldSupportFeatures } from '#test-support';
import { defaultHelpers as helpers, result } from '#testing';

const generator = `${basename(resolve(dirname(import.meta.dirname), '../'))}:${basename(import.meta.dirname)}`;

describe(`generator - ${generator}`, () => {
  shouldSupportFeatures(Generator);

  describe('with defaults options', () => {
    before(async () => {
      await helpers.runJHipster(generator).withMockedJHipsterGenerators().withJHipsterConfig();
    });

    it('should write no file of its own - snapshot', () => {
      expect(result.getStateSnapshot()).toMatchSnapshot();
    });

    it('should derive the table prefix of JHipster from the prefix', () => {
      expect(result.application!.jhiTablePrefix).toBe('jhi');
    });

    it('should give the port of the production database, postgresql', () => {
      expect(result.application!.prodDatabasePort).toBe(5432);
    });
  });

  describe('with a relational database of another vendor', () => {
    before(async () => {
      await helpers.runJHipster(generator).withMockedJHipsterGenerators().withJHipsterConfig({ prodDatabaseType: 'mysql' });
    });

    it('should give the port of the vendor', () => {
      expect(result.application!.prodDatabasePort).toBe(3306);
    });
  });

  describe('with a database that is not relational', () => {
    before(async () => {
      await helpers.runJHipster(generator).withMockedJHipsterGenerators().withJHipsterConfig({ databaseType: 'mongodb' });
    });

    it('should give the port of its type', () => {
      expect(result.application!.prodDatabasePort).toBe(27017);
    });
  });

  describe('with relationships without the other side', () => {
    const author = { name: 'Author', changelogDate: '20200101000000', fields: [], relationships: [] as any[] };
    const editor = { name: 'Editor', changelogDate: '20200101000050', fields: [], relationships: [] as any[] };
    const book = {
      name: 'Book',
      changelogDate: '20200101000100',
      fields: [],
      relationships: [
        { relationshipName: 'authors', otherEntityName: 'author', relationshipType: 'one-to-many' },
        { relationshipName: 'editor', otherEntityName: 'editor', relationshipType: 'one-to-one', relationshipSide: 'left' },
      ],
    };
    const otherSides = (entityName: string) =>
      (result.entities![entityName] as any).relationships.map((relationship: any) => relationship.relationshipName);
    const ignored = () =>
      (result.entities!.Book as any).relationships.map((relationship: any) => relationship.relationshipIgnoreBackReference);

    describe('in a relational database', () => {
      before(async () => {
        await helpers
          .runJHipster(generator)
          .withMockedJHipsterGenerators()
          .withJHipsterConfig({ databaseType: 'sql' }, [author, editor, book]);
      });

      it('should add the other side of a one-to-many and of a one-to-one', () => {
        expect(otherSides('Author')).toEqual(['book']);
        expect(otherSides('Editor')).toEqual(['book']);
      });
    });

    describe('in a document database', () => {
      before(async () => {
        await helpers
          .runJHipster(generator)
          .withMockedJHipsterGenerators()
          .withJHipsterConfig({ databaseType: 'mongodb' }, [author, editor, book]);
      });

      it('should add the other side of a one-to-many only', () => {
        expect(otherSides('Author')).toEqual(['book']);
        expect(otherSides('Editor')).toEqual([]);
      });
    });

    describe('in a graph database', () => {
      before(async () => {
        await helpers
          .runJHipster(generator)
          .withMockedJHipsterGenerators()
          .withJHipsterConfig({ databaseType: 'neo4j' }, [author, editor, book]);
      });

      it('should add no other side and ignore the back reference of the relationships', () => {
        expect(otherSides('Author')).toEqual([]);
        expect(otherSides('Editor')).toEqual([]);
        expect(ignored()).toEqual([true, true]);
      });
    });
  });

  describe('with entities, without a backend generator', () => {
    before(async () => {
      await helpers
        .runJHipster(generator)
        .withMockedJHipsterGenerators()
        .withJHipsterConfig({ databaseType: 'sql' }, [
          { name: 'Customer', changelogDate: '20200101000000', fields: [], relationships: [] },
          {
            name: 'CustomerOrder',
            changelogDate: '20200101000100',
            fields: [{ fieldName: 'orderCode', fieldType: 'String' }],
            relationships: [
              { relationshipName: 'customers', otherEntityName: 'customer', relationshipType: 'many-to-many', relationshipSide: 'left' },
            ],
          },
        ]);
    });

    it('should prepare the table, the columns and the join table of an entity', () => {
      const entity = result.entities!.CustomerOrder as Record<string, any>;
      expect(entity.entityTableName).toBe('customer_order');
      expect(entity.fields.find((field: Record<string, any>) => field.fieldName === 'orderCode').columnName).toBe('order_code');
      expect(entity.relationships[0].joinTable.name).toBe('rel_customer_order__customers');
    });
  });

  describe('with a prefix of its own', () => {
    before(async () => {
      await helpers.runJHipster(generator).withMockedJHipsterGenerators().withJHipsterConfig({ jhiPrefix: 'myPrefix' });
    });

    it('should derive the table prefix from it, in snake case', () => {
      expect(result.application!.jhiTablePrefix).toBe('my_prefix');
    });
  });
});
