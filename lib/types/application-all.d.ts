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
import type { Entity as AngularEntity } from '../../generators/angular/types.d.ts';
import type {
  Application as BaseApplication,
  Entity as BaseApplicationEntity,
  RelationshipWithEntity,
} from '../../generators/base-application/types.d.ts';
import type { Application as ClientApplication, Field as ClientField } from '../../generators/client/types.d.ts';
import type { Application as DockerApplication } from '../../generators/docker/types.d.ts';
import type { Application as GitApplication } from '../../generators/git/types.d.ts';
import type { Application as I18nApplication } from '../../generators/languages/types.d.ts';
import type {
  Application as LiquibaseApplication,
  Entity as LiquibaseEntity,
  Field as LiquibaseField,
  Relationship as LiquibaseRelationship,
} from '../../generators/liquibase/types.d.ts';
import type { Application as ProjectNameApplication } from '../../generators/project-name/types.d.ts';
import type { Relationship as ServerRelationship } from '../../generators/server/types.d.ts';
import type { Application as SpringBootApplication, Entity as SpringBootEntity } from '../../generators/spring-boot/types.d.ts';
import type { Application as SpringCacheApplication } from '../../generators/spring-cache/types.d.ts';
import type { Application as SpringCloudApplication } from '../../generators/spring-cloud/types.d.ts';
import type {
  Application as SpringDataRelationalApplication,
  Entity as SpringDataRelationalEntity,
  Field as SpringDataRelationalField,
  Relationship as SpringDataRelationalRelationship,
} from '../../generators/spring-data/generators/relational/types.d.ts';

export type FieldAll = SpringDataRelationalField & LiquibaseField & ClientField;

export interface RelationshipAll extends SpringDataRelationalRelationship, ServerRelationship, LiquibaseRelationship {
  bagRelationship?: boolean;
}

export interface EntityAll<F extends FieldAll = FieldAll, R extends RelationshipAll = RelationshipAll>
  extends
    BaseApplicationEntity<F, R>,
    AngularEntity<F, R>,
    LiquibaseEntity<F, R>,
    SpringDataRelationalEntity<F, R>,
    SpringBootEntity<F, R> {
  updatableEntity?: boolean;
  eagerLoad?: boolean;
  implementsEagerLoadApis?: boolean;
  requiresPersistableImplementation?: boolean;

  fieldsContainNoOwnerOneToOne?: boolean;
  anyPropertyHasValidation?: boolean;
  entityContainsCollectionField?: boolean;
  relationshipsContainEagerLoad?: boolean;
  containsBagRelationships?: boolean;

  otherEntityPrimaryKeyTypes?: string[];
  otherEntityPrimaryKeyTypesIncludesUUID?: boolean;

  otherEntities?: this[];
  otherEntitiesWithPersistableRelationship?: this[];

  regularEagerRelations?: RelationshipWithEntity<R, this>[];
  eagerRelations?: RelationshipWithEntity<R, this>[];
  reactiveRegularEagerRelations?: RelationshipWithEntity<R, this>[];
  persistableRelationships?: RelationshipWithEntity<R, this>[];

  relationshipsByOtherEntity?: Record<string, RelationshipWithEntity<R, this>[]>;
  differentRelationships?: Record<string, RelationshipWithEntity<R, this>[]>;
}

export interface UserEntity extends EntityAll {
  hasImageField?: boolean;
  adminUserDto?: string;
}

export type ApplicationAll<E extends EntityAll = EntityAll> = BaseApplication<E> &
  I18nApplication<E> &
  SpringBootApplication<E> &
  SpringDataRelationalApplication<E> &
  SpringCacheApplication<E> &
  SpringCloudApplication<E> &
  ClientApplication<E> &
  DockerApplication &
  LiquibaseApplication<E> &
  GitApplication &
  ProjectNameApplication;
