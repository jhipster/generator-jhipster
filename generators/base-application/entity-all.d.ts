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

import type { IsNever } from 'type-fest';
import type { Entity as BaseEntity } from '../../lib/jhipster/types/entity.js';
import type { ServerEntity } from '../server/types.js';
import type { Field as BaseField } from '../../lib/jhipster/types/field.js';
import type { Relationship as BaseRelationship } from '../../lib/jhipster/types/relationship.js';
import type { Entity as JavascriptEntity } from '../javascript/entity.d.ts';
import type { FieldType } from './internal/types/field-types.ts';
import type { FakerWithRandexp } from './support/faker.ts';
import type { Field } from './field-all.js';
import type { Relationship } from './relationship-all.js';

export type PrimaryKey<F extends BaseField = Field> = {
  name: string;
  fields: F[];
  derivedFields: F[];
  type: FieldType;
  composite: boolean;
  derived: boolean;
  javaValueGenerator?: string;
  javaBuildSpecification?: string;

  tsSampleValues?: (string | number)[];
  javaSampleValues?: string[];
};

export interface Entity<F extends BaseField = Field, R extends BaseRelationship = never>
  extends Omit<Required<BaseEntity<F>>, 'relationships'>,
    JavascriptEntity,
    ServerEntity {
  changelogDateForRecent: any;
  /** @experimental */
  auditableEntity?: boolean;
  relationships: (IsNever<R> extends true ? Relationship<Entity<F, never>> : R)[];
  otherRelationships: (IsNever<R> extends true ? Relationship<Entity<F, never>> : R)[];

  primaryKey?: PrimaryKey<F>;

  builtIn?: boolean;
  builtInUser?: boolean;
  builtInUserManagement?: boolean;
  builtInAuthority?: boolean;
  adminEntity?: boolean;
  entityAuthority?: string;
  entityReadAuthority?: string;
  hasCyclicRequiredRelationship?: boolean;

  entityJavadoc?: string;

  entityNameCapitalized: string;
  entityClass: string;
  entityInstance: string;
  entityTableName: string;
  entityNamePlural: string;
  entityAbsoluteClass: string;
  entityAbsoluteFolder: string;

  dtoClass?: string;
  dtoInstance?: string;

  persistClass: string;
  persistInstance: string;
  restClass: string;
  restInstance: string;

  entityNamePluralizedAndSpinalCased: string;
  entityClassPlural: string;
  entityInstancePlural: string;

  entityI18nVariant: string;
  entityClassHumanized: string;
  entityClassPluralHumanized: string;

  entityApiUrl: string;
  entityApi: string;

  entityTranslationKey: string;
  entityTranslationKeyMenu: string;

  i18nKeyPrefix: string;
  i18nAlertHeaderPrefix: string;

  anyFieldIsBigDecimal: boolean;
  /**
   * Any file is of type Bytes or ByteBuffer
   */
  anyFieldIsBlobDerived: boolean;
  entityJavaFilterableProperties: any[];
  entityJavaCustomFilters: any[];
  /**
   * Any field is of type ZonedDateTime, Instant or LocalDate
   */
  anyFieldIsDateDerived: boolean;
  anyFieldIsDuration: boolean;
  anyFieldIsInstant: boolean;
  anyFieldIsLocalDate: boolean;
  anyFieldIsLocalTime: boolean;
  /**
   * Any field is of type ZonedDateTime or Instant
   */
  anyFieldIsTimeDerived: boolean;
  anyFieldIsUUID: boolean;
  anyFieldIsZonedDateTime: boolean;

  anyFieldHasDocumentation: boolean;
  anyFieldHasImageContentType: boolean;
  anyFieldHasTextContentType: boolean;
  /**
   * Any field has image or any contentType
   */
  anyFieldHasFileBasedContentType: boolean;

  /**
   * Any relationship is required or id
   */
  anyRelationshipIsRequired: boolean;
  hasRelationshipWithBuiltInUser: boolean;

  serviceClass: boolean;
  serviceImpl: boolean;
  serviceNo: boolean;

  dtoMapstruct: boolean;
  dtoAny: boolean;

  propertyJavaFilteredType?: string;

  resetFakerSeed(suffix?: string): void;
  generateFakeData?: (type?: any) => any;
  faker: FakerWithRandexp;

  saveUserSnapshot?: boolean;

  /** Properties from application required for entities published through gateways */
  useMicroserviceJson?: boolean;
  microserviceAppName?: string;
  applicationType?: string;
  microfrontend?: boolean;
}

export interface UserEntity extends Entity {
  hasImageField?: boolean;
  adminUserDto?: string;
}
