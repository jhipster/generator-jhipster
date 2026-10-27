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
import type {
  Entity as BaseApplicationEntity,
  Field as BaseApplicationField,
  Relationship as BaseApplicationRelationship,
} from '../../types.d.ts';

/**
 * The properties the preparation of the database adds to the application, whichever database it is.
 */
export type Application = {
  /** The prefix of the tables of JHipster itself, from `jhiPrefix`. */
  jhiTablePrefix: string;
};

/** What a relational database adds to a property of an entity, be it a field or a relationship. */
export type DatabaseProperty = {
  columnName?: string;
  columnRequired?: boolean;
  nullable?: boolean;
};

export type DatabaseField = BaseApplicationField & DatabaseProperty;

/** A column of a join table, one for each field of the primary key of the entity it references. */
export type DatabaseJoinColumn = {
  name: string;
  /** The column of the primary key it references. */
  referencedColumnName: string;
  /** The field of the primary key it references. */
  field: DatabaseField;
};

export interface DatabaseRelationship extends BaseApplicationRelationship, DatabaseProperty {
  shouldWriteJoinTable?: boolean;

  joinTable?: {
    name: string;
    constraintName?: string;
    otherConstraintName?: string;
    /** The columns referencing the entity of the relationship, one for each field of its primary key. */
    joinColumns: DatabaseJoinColumn[];
    /** The columns referencing the other entity, one for each field of its primary key. */
    inverseJoinColumns: DatabaseJoinColumn[];
  };

  joinColumnNames?: string[];
}

export interface DatabaseEntity<
  F extends DatabaseField = DatabaseField,
  R extends DatabaseRelationship = DatabaseRelationship,
> extends BaseApplicationEntity<F, R> {
  entityTableName: string;
}
