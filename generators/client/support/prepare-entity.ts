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
import { mutateData } from '../../../lib/utils/object.ts';
import { type EntitySamplesBatch, generateEntitySamples } from '../../base-application/support/entity-samples.ts';
import type { Entity as ClientEntity, Field as ClientField } from '../types.ts';

import { isClientField } from './filter-entities.ts';
import { generateTestEntityId, stringifyTsEntity } from './template-utils.ts';
import getTypescriptKeyType from './types-utils.ts';

const SEED = 'post-prepare-client';

export function preparePostEntityClientDerivedProperties(entity: ClientEntity) {
  let clientFields = entity.fields.filter(field => isClientField(field));
  if (entity.builtInUser) {
    clientFields = clientFields.filter(field => ['id', 'login'].includes(field.fieldName));
  }
  const generateTsSamples = (seed: number, fields: EntitySamplesBatch<ClientField>['fields'], count?: number) =>
    generateEntitySamples(entity, { seed: `${SEED}-${seed}`, batches: [{ fields, format: 'ts', count }] })[0];
  const options = { sep: `\n  ` };

  const [partialSample] = generateTsSamples(1, faker =>
    clientFields.filter(field => field.id || field.fieldValidationRequired || (!field.transient && faker.datatype.boolean())),
  );
  entity.tsSampleWithPartialData = stringifyTsEntity(partialSample, options);

  const [requiredSample] = generateTsSamples(
    2,
    clientFields.filter(field => field.id || field.fieldValidationRequired),
  );
  entity.tsSampleWithRequiredData = stringifyTsEntity(requiredSample, options);

  const [fullSample] = generateTsSamples(
    3,
    clientFields.filter(field => !field.transient),
  );
  entity.tsSampleWithFullData = stringifyTsEntity(fullSample, options);

  if (entity.primaryKey) {
    const [newSample] = generateTsSamples(
      4,
      clientFields.filter(field => !field.id && field.fieldValidationRequired),
    );
    entity.tsSampleWithNewData = stringifyTsEntity({ ...newSample, [entity.primaryKey.name]: null }, options);

    mutateData(entity, {
      tsKeyType: getTypescriptKeyType(entity.primaryKey.type),
    });
    entity.primaryKey.tsSampleValues = [generateTestEntityId(entity.primaryKey, 0), generateTestEntityId(entity.primaryKey, 1)];
    entity.tsPrimaryKeySamples = generateTsSamples(5, entity.primaryKey.fields, 2).map(sample => stringifyTsEntity(sample));
  }
}
