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

import type { DatabaseEntity, DatabaseField } from '../types.d.ts';

import { prepareFieldColumnForDatabase } from './prepare-field.ts';

const prepareColumn = (field: Partial<DatabaseField>, { jhiTablePrefix = 'jhi', prodDatabaseType = 'postgresql' } = {}) => {
  const warnings: string[] = [];
  const entity = { entityTableName: 'book' } as DatabaseEntity;
  prepareFieldColumnForDatabase({
    application: { jhiTablePrefix, databaseType: 'sql', prodDatabaseType },
    entity,
    field: field as DatabaseField,
    log: { warn: message => warnings.push(message) },
  });
  return { field: field as DatabaseField, warnings };
};

describe('generator - base-application:database-bootstrap - prepare-field', () => {
  describe('prepareFieldColumnForDatabase', () => {
    it('should name the column of a field in snake case', () => {
      const { field } = prepareColumn({ fieldName: 'publishedAt' });
      expect(field).toMatchObject({ fieldNameAsDatabaseColumn: 'published_at', columnName: 'published_at' });
    });

    it('should prefix a reserved keyword of the database with the table prefix of JHipster', () => {
      expect(prepareColumn({ fieldName: 'order' }).field.columnName).toBe('jhi_order');
    });

    it('should warn of a reserved keyword without a table prefix, and keep its name', () => {
      const { field, warnings } = prepareColumn({ fieldName: 'order' }, { jhiTablePrefix: '' });
      expect(field.columnName).toBe('order');
      expect(warnings).toHaveLength(1);
    });

    it('should keep the column a field already has', () => {
      expect(prepareColumn({ fieldName: 'title', fieldNameAsDatabaseColumn: 'book_title' }).field.columnName).toBe('book_title');
    });

    it('should name the unique constraint of a unique field', () => {
      expect(prepareColumn({ fieldName: 'isbn', unique: true }).field.uniqueConstraintName).toBe('ux_book__isbn');
    });
  });
});
