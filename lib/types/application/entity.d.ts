/**
 * Copyright 2013-2024 the original author or authors from the JHipster project.
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
import type { Entity as BaseEntity } from '../base/entity.js';
import type { SpringEntity } from '../../../generators/server/types.js';
import type { Field as BaseField } from '../base/field.js';
import type { Relationship as BaseRelationship } from '../base/relationship.js';
import type { FieldType } from '../../application/field-types.ts';
import type { Field } from './field.js';
import type { Relationship } from './relationship.js';

type AngularEntity = {
  entityAngularAuthorities?: string;
  entityAngularReadAuthorities?: string;
};

export type PrimaryKey<F extends BaseField = Field> = {
  name: string;
  fields: F[];
  derivedFields: F[];
  type: FieldType;
  composite: boolean;
  derived: boolean;
  javaValueGenerator?: string;
  javaBuildSpecification?: string;
};

export interface Entity<F extends BaseField = Field, R extends BaseRelationship = never>
  extends Omit<Required<BaseEntity<F>>, 'relationships'>,
    SpringEntity,
    AngularEntity {
  changelogDateForRecent: any;
  relationships: (IsNever<R> extends true ? Relationship<Omit<Entity, 'relationships'>> : R)[];
  otherRelationships: (IsNever<R> extends true ? Relationship<Omit<Entity, 'relationships'>> : R)[];

  primaryKey?: PrimaryKey<F>;

  builtIn?: boolean;
  builtInUser?: boolean;
  builtInAuthority?: boolean;
  adminEntity?: boolean;
  entityAuthority?: string;
  entityReadAuthority?: string;
  hasCyclicRequiredRelationship?: boolean;
  jpaMetamodelFiltering?: boolean;

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

  entityFileName: string;
  entityFolderName: string;
  entityModelFileName: string;
  entityParentPathAddition: string;
  entityPluralFileName: string;
  entityServiceFileName: string;

  /** Generate only the model at client side for relationships. */
  entityClientModelOnly?: boolean;
  entityAngularName: string;
  entityAngularNamePlural: string;
  entityReactName: string;

  entityApiUrl: string;
  entityStateName: string;
  entityUrl: string;

  entityTranslationKey: string;
  entityTranslationKeyMenu: string;

  i18nKeyPrefix: string;
  i18nAlertHeaderPrefix: string;

  entityApi: string;
  entityPage: string;

  anyFieldIsBigDecimal: boolean;
  /**
   * Any file is of type Bytes or ByteBuffer
   */
  anyFieldIsBlobDerived: boolean;
  /**
   * Any field is of type ZonedDateTime, Instant or LocalDate
   */
  anyFieldIsDateDerived: boolean;
  anyFieldIsDuration: boolean;
  anyFieldIsInstant: boolean;
  anyFieldIsLocalDate: boolean;
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

  dtoMapstruct: boolean;

  propertyJavaFilteredType?: string;

  faker: any;
}
