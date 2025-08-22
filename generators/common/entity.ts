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
import { CommonDBTypes, RelationalOnlyDBTypes } from '../../lib/jhipster/field-types.ts';
import { buildMutateDataForProperty } from '../../lib/utils/derived-property.ts';
import type { MutateDataParam, MutateDataPropertiesWithRequiredProperties } from '../../lib/utils/object.ts';
import type {
  Entity as BaseApplicationEntity,
  Field as BaseApplicationField,
  Relationship as BaseApplicationRelationship,
} from '../base-application/types.ts';
import type { Entity as LanguagesEntity } from '../languages/types.ts';

const { BIG_DECIMAL, DOUBLE, FLOAT, INSTANT, INTEGER, LOCAL_DATE, LONG, STRING, UUID, ZONED_DATE_TIME, TEXT_BLOB } = CommonDBTypes;
const { BYTES, BYTE_BUFFER } = RelationalOnlyDBTypes;

type CommonAddedFieldProperties = {
  /** @deprecated replace with technology-specific implementation */
  fieldTypeTemporal: boolean;
  /** @deprecated replace with technology-specific implementation */
  fieldTypeCharSequence: boolean;
  /** @deprecated replace with technology-specific implementation */
  fieldTypeNumeric: boolean;
  /** @deprecated replace with technology-specific implementation */
  fieldSupportsSortBy?: boolean;
};

export type Field = BaseApplicationField & CommonAddedFieldProperties;

export const mutateField = {
  __override__: false,
  fieldTypeNumeric: ({ fieldType }) =>
    fieldType === INTEGER || fieldType === LONG || fieldType === FLOAT || fieldType === DOUBLE || fieldType === BIG_DECIMAL,
  fieldTypeBinary: ({ fieldType }) => fieldType === BYTES || fieldType === BYTE_BUFFER,
  fieldTypeTimed: ({ fieldType }) => fieldType === ZONED_DATE_TIME || fieldType === INSTANT,
  fieldTypeCharSequence: ({ fieldType }) => fieldType === STRING || fieldType === UUID || fieldType === TEXT_BLOB,
  fieldTypeTemporal: ({ fieldType }) => fieldType === ZONED_DATE_TIME || fieldType === INSTANT || fieldType === LOCAL_DATE,
} as const satisfies MutateDataPropertiesWithRequiredProperties<MutateDataParam<Field>, CommonAddedFieldProperties>;

export type { BaseApplicationRelationship as Relationship };

type CommonAddedEntityProperties = {
  entityApiUrl: string;
  entityApi: string;

  paginationPagination: boolean;
  paginationInfiniteScroll: boolean;
  paginationNo: boolean;
};

export const mutateEntity = {
  __override__: false,
  entityApi: ({ microserviceName }) => (microserviceName ? `services/${microserviceName.toLowerCase()}/` : ''),
  entityApiUrl: data => data.entityNamePluralizedAndSpinalCased,
  ...buildMutateDataForProperty('pagination', ['pagination', 'infinite-scroll', 'no']),
} as const satisfies MutateDataPropertiesWithRequiredProperties<MutateDataParam<Entity>, CommonAddedEntityProperties>;

export interface Entity<F extends Field = Field, R extends BaseApplicationRelationship = BaseApplicationRelationship>
  extends LanguagesEntity<F, R>,
    BaseApplicationEntity<F, R>,
    CommonAddedEntityProperties {
  restProperties?: (F | R)[];

  uniqueEnums?: F[];
}
