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
import type { Entity as SpringBootEntity } from '../spring-boot/types.js';
import type { Entity as AngularEntity } from '../angular/types.d.ts';
import type { Entity as LiquibaseEntity } from '../liquibase/index.js';
import type { Entity as SpringDataRelationalEntity } from '../spring-data-relational/types.d.ts';
import type { Entity as BaseApplicationEntity } from './types.js';
import type { FieldAll } from './field-all.js';
import type { RelationshipAll } from './relationship-all.js';

export interface EntityAll<F extends FieldAll = FieldAll, R extends RelationshipAll = RelationshipAll>
  extends BaseApplicationEntity<F, R>,
    AngularEntity<F, R>,
    LiquibaseEntity<F, R>,
    SpringDataRelationalEntity<F, R>,
    SpringBootEntity<F, R> {
  entityApiUrl: string;
  entityApi: string;

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

  saveUserSnapshot?: boolean;

  /** Properties from application required for entities published through gateways */
  useMicroserviceJson?: boolean;
  microserviceAppName?: string;
  applicationType?: string;
  microfrontend?: boolean;
}

export interface UserEntity extends EntityAll {
  hasImageField?: boolean;
  adminUserDto?: string;
}
