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
import { kebabCase, upperFirst } from 'lodash-es';
import pluralize from 'pluralize';

import type { MutateDataParam, MutateDataPropertiesWithRequiredProperties } from '../../lib/utils/object.ts';
import { normalizePathEnd } from '../../lib/utils/path.ts';
import { upperFirstCamelCase } from '../../lib/utils/string.ts';
import type { Relationship as BaseApplicationRelationship } from '../base-application/types.d.ts';
import type { Entity as CommonEntity, Field as CommonField, Relationship as CommonRelationship } from '../common/types.ts';
import type { Entity as LanguagesEntity, Field as LanguagesField, Relationship as LanguagesRelationship } from '../languages/types.d.ts';

import { getTypescriptType } from './support/types-utils.ts';

// DerivedPropertiesOnlyOf<'fieldTsType', FieldTsType> &
type ClientAddedFieldProperties = {
  tsType: string;
};

export const mutateField = {
  __override__: false,
  tsType: ({ fieldType, fieldIsEnum }) => (fieldIsEnum ? fieldType : getTypescriptType(fieldType)),

  // ...buildMutateDataForProperty('tsType', fieldTsTypes, { prefix: 'fieldTsType' }),
} as const satisfies MutateDataPropertiesWithRequiredProperties<MutateDataParam<Field>, ClientAddedFieldProperties>;

export type Field = CommonField & LanguagesField & ClientAddedFieldProperties;

export interface Relationship extends CommonRelationship, LanguagesRelationship {}

type ClientAddedEntityProperties = {
  entityFileName: string;
  entityFolderName: string;
  entityModelFileName: string;
  entityPluralFileName: string;
  entityServiceFileName: string;

  /** Generate only the model at client side for relationships. */
  entityClientModelOnly?: boolean;
  entityTsName: string;
  entityAngularName: string;
  entityAngularNamePlural: string;
  entityReactName: string;
  entityStateName: string;
  entityUrl: string;
  entityPage?: string;

  tsKeyType?: string;
  tsSampleWithPartialData?: string;
  tsSampleWithRequiredData?: string;
  tsSampleWithFullData?: string;
  tsSampleWithNewData?: string;
  tsPrimaryKeySamples?: string[];

  entityAngularJSSuffix: string;
};

export const mutateEntity = {
  __override__: false,
  entityAngularJSSuffix: data => {
    const entityAngularJSSuffix = data.entityAngularJSSuffix ?? data.angularJSSuffix ?? '';
    return entityAngularJSSuffix.startsWith('-') || !entityAngularJSSuffix ? entityAngularJSSuffix : `-${entityAngularJSSuffix}`;
  },
  entityTsName: data => upperFirst(data.entityNameCapitalized) + upperFirstCamelCase(data.entityAngularJSSuffix!),
  entityFileName: data => kebabCase(data.entityNameCapitalized + upperFirst(data.entityAngularJSSuffix)),
  entityFolderName: data => `${normalizePathEnd(data.clientRootFolder)}${data.entityFileName}`,
  entityModelFileName: data => data.entityFolderName,
  entityPluralFileName: data => `${data.entityNamePluralizedAndSpinalCased}${data.entityAngularJSSuffix}`,
  entityServiceFileName: data => data.entityFileName,
  entityStateName: data => kebabCase(data.entityTsName),
  entityUrl: data => data.entityStateName,

  entityAngularName: data => data.entityTsName,
  entityAngularNamePlural: data => pluralize(data.entityAngularName),
  entityReactName: data => data.entityTsName,
} as const satisfies MutateDataPropertiesWithRequiredProperties<MutateDataParam<Entity>, ClientAddedEntityProperties>;

export interface Entity<F extends Field = Field, R extends BaseApplicationRelationship = BaseApplicationRelationship>
  extends CommonEntity<F, R>,
    LanguagesEntity<F, R>,
    ClientAddedEntityProperties {}
