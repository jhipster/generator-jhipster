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
import { camelCase } from 'lodash-es';

import type { MutateDataParam, MutateDataPropertiesWithRequiredProperties } from '../../lib/utils/object.ts';
import type {
  Entity as BaseApplicationEntity,
  Field as BaseApplicationField,
  Relationship as BaseApplicationRelationship,
} from '../base-application/types.ts';

export type { BaseApplicationField as Field, BaseApplicationRelationship as Relationship };

type LanguagesAddedEntityProperties = {
  /** i18n variant ex: 'male', 'female' when applied */
  entityI18nVariant: string;
  entityTranslationKey: string;
  entityTranslationKeyMenu: string;
};

export interface Entity<
  F extends BaseApplicationField = BaseApplicationField,
  R extends BaseApplicationRelationship = BaseApplicationRelationship,
>
  extends BaseApplicationEntity<F, R>, LanguagesAddedEntityProperties {
  i18nKeyPrefix: string;
  i18nAlertHeaderPrefix: string;
}

export const mutateEntity = {
  __override__: false,
  entityI18nVariant: 'default',
  entityTranslationKey: data =>
    data.clientRootFolder ? camelCase(`${data.clientRootFolder}-${data.entityInstance}`) : data.entityInstance,
  entityTranslationKeyMenu: data =>
    camelCase(data.clientRootFolder ? `${data.clientRootFolder}-${data.entityNameKebabCase}` : data.entityNameKebabCase),
} as const satisfies MutateDataPropertiesWithRequiredProperties<MutateDataParam<Entity>, LanguagesAddedEntityProperties>;
