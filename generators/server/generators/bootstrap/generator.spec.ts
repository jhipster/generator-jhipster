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
import { basename, resolve } from 'node:path';

import { testBootstrapEntities } from '../../../../test/support/bootstrap-tests.ts';

import Generator from './generator.ts';

import { shouldSupportFeatures } from '#test-support';
import { defaultHelpers as helpers, runResult } from '#testing';

const generator = `${basename(resolve(import.meta.dirname, '../../'))}:${basename(import.meta.dirname)}`;

describe(`generator - ${generator}`, () => {
  shouldSupportFeatures(Generator);

  it('bootstrap migration', async () => {
    await helpers
      .runJHipster('jhipster:bootstrap-application-server')
      .prepareEnvironment()
      .withMockedGenerators(['jhipster:server:bootstrap']);
    expect(runResult.getComposedGenerators()).toContain('jhipster:server:bootstrap');
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
      (runResult.entities![entityName] as any).relationships.map((relationship: any) => relationship.relationshipName);
    const ignored = () =>
      (runResult.entities!.Book as any).relationships.map((relationship: any) => relationship.relationshipIgnoreBackReference);

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

  describe('with', () => {
    describe('default config', () => {
      before(async () => {
        await helpers.runJHipster(generator).withJHipsterConfig();
      });

      it('should succeed - snapshot', () => {
        expect(runResult.getSnapshot()).toMatchInlineSnapshot(`
{
  ".yo-rc.json": {
    "contents": "{
  "generator-jhipster": {
    "baseName": "jhipster",
    "creationTimestamp": 1577836800000,
    "entities": []
  }
}
",
    "stateCleared": "modified",
  },
}
`);
      });
    });
  });

  describe('with a relational database of a blueprint', () => {
    before(async () => {
      await helpers
        .runJHipster(generator)
        .withJHipsterConfig({ baseName: 'sample', backendType: 'nodejs', prodDatabaseType: 'sqlite', devDatabaseType: 'sqlite' } as any)
        .withMockedJHipsterGenerators();
    });

    it('should leave the properties of the Java databases undefined', () => {
      const {
        prodDatabaseName,
        prodDatabaseUsername,
        prodDatabasePassword,
        prodJdbcUrl,
        prodR2dbcUrl,
        prodJdbcDriver,
        prodHibernateDialect,
      } = runResult.application as any;
      expect({
        prodDatabaseName,
        prodDatabaseUsername,
        prodDatabasePassword,
        prodJdbcUrl,
        prodR2dbcUrl,
        prodJdbcDriver,
        prodHibernateDialect,
      }).toEqual({
        prodDatabaseName: 'sample',
        prodDatabaseUsername: 'sample',
        prodDatabasePassword: '',
        prodJdbcUrl: undefined,
        prodR2dbcUrl: undefined,
        prodJdbcDriver: undefined,
        prodHibernateDialect: undefined,
      });
    });
  });

  testBootstrapEntities(generator);
});
