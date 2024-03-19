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

import { SpringEntity } from '../../server/types.js';
import Field from './field.js';
import Relationship from './relationship.js';

export type BaseEntity = {
  name: string;
  changelogDate?: string;
  dto?: string;

  primaryKey?: Record<string, any>;
  fields?: Field[];
  relationships?: Relationship[];

  readOnly?: boolean;
  embedded?: boolean;
  skipClient?: boolean;
  skipServer?: boolean;
};

type AngularEntity = {
  entityAngularAuthorities?: string;
  entityAngularReadAuthorities?: string;
};

type Entity = Required<BaseEntity> &
  SpringEntity &
  AngularEntity & {
    builtIn?: boolean;
    builtInUser?: boolean;
    builtInAuthority?: boolean;
    microserviceName?: string;
    adminEntity?: boolean;
    entityAuthority?: string;
    entityReadAuthority?: string;
    hasCyclicRequiredRelationship?: boolean;

    entityNameCapitalized: string;
    entityClass: string;
    entityInstance: string;
    entityTableName: string;
    entityNamePlural: string;

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

    dtoMapstruct: boolean;
  };

export default Entity;
