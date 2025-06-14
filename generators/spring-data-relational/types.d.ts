/**
 * Copyright 2013-2025 the original author or authors from the JHipster project.
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
import type { HandleCommandTypes } from '../../lib/command/types.js';
import type {
  Application as JavaApplication,
  Entity as JavaEntity,
  Field as JavaField,
  Relationship as JavaRelationship,
} from '../java/index.ts';
import type command from './command.ts';

type CommandTypes = HandleCommandTypes<typeof command>;

export { JavaField as Field };

export interface Relationship extends JavaRelationship {
  relationshipSqlSafeName?: string;
}

export interface Entity<F extends JavaField = JavaField, R extends Relationship = Relationship> extends JavaEntity<F, R> {
  entityJpqlInstance: string;
}

type LiquibaseApplication = {
  incrementalChangelog: boolean;
};

export type Application<E extends Entity> = JavaApplication<E> &
  LiquibaseApplication &
  CommandTypes['Application'] & {
    //OptionWithDerivedProperties<'databaseType', ['sql', 'no', 'cassandra', 'couchbase', 'mongodb', 'neo4j']> &
    devDatabaseExtraOptions: string;
    prodDatabaseExtraOptions: string;

    enableHibernateCache: boolean;
    devDatabaseType: string;
    prodDatabaseType: string;
    devDatabaseTypeMysql: boolean;
    devDatabaseTypeH2Any?: boolean;

    devDatabaseName?: string;
    devJdbcUrl?: string;
    devJdbcDriver?: string;
    devLiquibaseUrl?: string;
    devHibernateDialect?: string;
    devR2dbcUrl?: string;
    devDatabaseUsername?: string;
    devDatabasePassword?: string;

    prodDatabaseName?: string;
    prodJdbcUrl?: string;
    prodJdbcDriver?: string;
    prodHibernateDialect?: string;
    prodLiquibaseUrl?: string;
    prodR2dbcUrl?: string;
    prodDatabaseUsername?: string;
    prodDatabasePassword?: string;
  };
