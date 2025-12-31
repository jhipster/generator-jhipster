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
import type { HandleCommandTypes } from '../../../../lib/command/types.ts';
import type { Entity as BaseApplicationEntity } from '../../../base-application/types.ts';
import type {
  Application as SpringBootApplication,
  Config as SpringBootConfig,
  Entity as SpringBootEntity,
  Field as SpringBootField,
  Options as SpringBootOptions,
  Relationship as SpringBootRelationship,
  Source as SpringBootSource,
} from '../../../spring-boot/types.ts';

import type command from './command.ts';

type CommandTypes = HandleCommandTypes<typeof command>;

export type Config = SpringBootConfig & CommandTypes['Config'];
export type Options = SpringBootOptions & CommandTypes['Options'];

export { SpringBootSource as Source };

export type Field = SpringBootField & {
  jpaGeneratedValue?: boolean | 'identity' | 'sequence';
  jpaGeneratedValueSequence?: boolean;
  jpaGeneratedValueIdentity?: boolean;
  jpaSequenceGeneratorName?: string;
};

export interface Relationship extends SpringBootRelationship {
  relationshipSqlSafeName?: string;
}

export interface Entity<F extends SpringBootField = SpringBootField, R extends Relationship = Relationship> extends SpringBootEntity<F, R> {
  entityJpqlInstance: string;
}

type LiquibaseApplication = {
  incrementalChangelog: boolean;
};

export type Application<E extends BaseApplicationEntity = Entity> = SpringBootApplication<E> &
  LiquibaseApplication &
  CommandTypes['Application'] & {
    devDatabaseExtraOptions: string;
    prodDatabaseExtraOptions: string;

    enableHibernateCache: boolean;
    devDatabaseType: string;
    prodDatabaseType: string;
    devDatabaseTypeMysql: boolean;
    devDatabaseTypeH2Any?: boolean;

    devDatabaseName?: string;
    devJdbcUrl?: string;
    devJdbcDriver?: string | null;
    devLiquibaseUrl?: string;
    devHibernateDialect?: string | null;
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
