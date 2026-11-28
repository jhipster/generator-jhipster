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

import type { DatabaseEntity, DatabaseRelationship } from '../types.d.ts';

import { prepareRelationshipForDatabase } from './prepare-relationship.ts';

const primaryKeyOf = (...columnNames: string[]) => ({ fields: columnNames.map(columnName => ({ columnName })) });

const prepareManyToMany = ({ databaseTypeSql = true, ownerSide = true } = {}) => {
  const entity = { entityTableName: 'book', primaryKey: primaryKeyOf('id') } as unknown as DatabaseEntity;
  const relationship = {
    relationshipName: 'authorTag',
    relationshipManyToMany: true,
    ownerSide,
    otherEntity: { entityTableName: 'tag', primaryKey: primaryKeyOf('code', 'locale') },
  } as unknown as DatabaseRelationship;
  prepareRelationshipForDatabase({ application: { databaseTypeSql }, entity, relationship });
  return relationship;
};

describe('generator - base-application:database-bootstrap - prepare-relationship', () => {
  describe('a many-to-many owner side of a relational database', () => {
    const { joinTable } = prepareManyToMany();

    it('should name the join table', () => {
      expect(joinTable!.name).toBe('rel_book__author_tag');
    });

    it('should prepare a column for each field of the primary key of the entity, prefixed by its table', () => {
      expect(joinTable!.joinColumns.map(({ name, referencedColumnName }) => ({ name, referencedColumnName }))).toEqual([
        { name: 'book_id', referencedColumnName: 'id' },
      ]);
    });

    it('should prepare a column for each field of the primary key of the other entity, prefixed by the relationship', () => {
      expect(joinTable!.inverseJoinColumns.map(({ name, referencedColumnName }) => ({ name, referencedColumnName }))).toEqual([
        { name: 'author_tag_code', referencedColumnName: 'code' },
        { name: 'author_tag_locale', referencedColumnName: 'locale' },
      ]);
    });
  });

  describe('a many-to-many owner side of another database', () => {
    it('should have no join table', () => {
      expect(prepareManyToMany({ databaseTypeSql: false }).joinTable).toBeUndefined();
    });
  });

  describe('a many-to-many side that is not the owner', () => {
    it('should have no join table', () => {
      expect(prepareManyToMany({ ownerSide: false }).joinTable).toBeUndefined();
    });
  });

  describe('the column of a many-to-one', () => {
    const prepareManyToOne = ({
      prodDatabaseType = 'mysql',
      relationshipName = 'authorizationRequestDocumentAsSupportingAttachmentFilesHistory',
      otherEntityRelationshipName = 'supportingAttachmentFilesHistory',
      backReferenceNameDerived = true,
    } = {}) => {
      const warnings: string[] = [];
      const entity = { name: 'Attachment', entityTableName: 'attachment', primaryKey: primaryKeyOf('id') } as unknown as DatabaseEntity;
      const relationship = {
        relationshipName,
        otherEntityName: 'authorizationRequestDocument',
        otherEntityRelationshipName,
        relationshipManyToOne: true,
        ownerSide: true,
        backReferenceNameDerived,
        otherEntity: { entityTableName: 'authorization_request_document', primaryKey: primaryKeyOf('id') },
      } as unknown as DatabaseRelationship;
      prepareRelationshipForDatabase({
        application: { databaseTypeSql: true, prodDatabaseType },
        entity,
        relationship,
        log: { warn: message => warnings.push(message) },
      });
      return { relationship, warnings };
    };

    it('should cut the column of a derived back reference to the limit of MySQL, with a warning', () => {
      const { relationship, warnings } = prepareManyToOne();
      expect(`${relationship.columnName}_id`).toBe('authorization_request_docu_as_supporting_attachment_files__37_id');
      expect(`${relationship.columnName}_id`.length).toBeLessThanOrEqual(64);
      expect(relationship.columnNameTruncated).toBe(true);
      expect(warnings).toEqual([
        'The generated column name "authorization_request_document_as_supporting_attachment_files_history_id" is too long for MySQL (which has a 64 character limit). It will be truncated to "authorization_request_docu_as_supporting_attachment_files__37_id"!',
      ]);
    });

    it('should give distinct columns within the limit of PostgreSQL to derived back references sharing their first characters', () => {
      const columns = ['One', 'Two'].map(
        suffix =>
          `${
            prepareManyToOne({
              prodDatabaseType: 'postgresql',
              relationshipName: `authorizationRequestDocumentAsSupportingAttachmentFilesHistory${suffix}`,
              otherEntityRelationshipName: `supportingAttachmentFilesHistory${suffix}`,
            }).relationship.columnName
          }_id`,
      );
      expect(columns).toEqual([
        'authorization_request_docu_as_supporting_attachment_files_5f_id',
        'authorization_request_docu_as_supporting_attachment_files_01_id',
      ]);
      expect(Math.max(...columns.map(column => column.length))).toBeLessThanOrEqual(63);
    });

    it('should keep the column of a relationship named by the user, with a warning', () => {
      const { relationship, warnings } = prepareManyToOne({ backReferenceNameDerived: false });
      expect(relationship.columnName).toBe('authorization_request_document_as_supporting_attachment_files_history');
      expect(relationship.columnNameTruncated).toBe(false);
      expect(warnings).toEqual([
        'The column name "authorization_request_document_as_supporting_attachment_files_history_id" of Attachment.authorizationRequestDocumentAsSupportingAttachmentFilesHistory is too long for MySQL (which has a 64 character limit). Use a shorter relationship name.',
      ]);
    });

    it('should keep a column within the limit', () => {
      const { relationship, warnings } = prepareManyToOne({
        relationshipName: 'orderAsPublisher',
        otherEntityRelationshipName: 'publisher',
      });
      expect(relationship.columnName).toBe('order_as_publisher');
      expect(relationship.columnNameTruncated).toBe(false);
      expect(warnings).toEqual([]);
    });

    it('should keep the column for a database without a limit', () => {
      const { relationship, warnings } = prepareManyToOne({ prodDatabaseType: 'mssql' });
      expect(relationship.columnName).toBe('authorization_request_document_as_supporting_attachment_files_history');
      expect(warnings).toEqual([]);
    });
  });
});
