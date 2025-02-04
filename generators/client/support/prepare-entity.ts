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
import type { Entity } from '../../../lib/types/application/entity.js';
import { isClientField } from './filter-entities.js';
import { generateTestEntityId, generateTsTestEntityForFields, stringifyTsEntity } from './template-utils.js';
import getTypescriptKeyType from './types-utils.js';

export default function prepareEntity() {}

const SEED = 'post-prepare-client';

export async function preparePostEntityClientDerivedProperties(entity: Entity) {
  let clientFields = entity.fields.filter(field => isClientField(field));
  if (entity.builtInUser) {
    clientFields = clientFields.filter(field => ['id', 'login'].includes(field.fieldName));
  }
  await entity.resetFakerSeed(`${SEED}-1`);
  const options = { sep: `\n  ` };
  const fieldsWithPartialData = clientFields.filter(
    field => field.id || field.fieldValidationRequired || (!field.transient && entity.faker.datatype.boolean()),
  );
  entity.tsSampleWithPartialData = stringifyTsEntity(generateTsTestEntityForFields(fieldsWithPartialData), options);

  await entity.resetFakerSeed(`${SEED}-2`);
  const fieldsWithRequiredData = clientFields.filter(field => field.id || field.fieldValidationRequired);
  entity.tsSampleWithRequiredData = stringifyTsEntity(generateTsTestEntityForFields(fieldsWithRequiredData), options);

  await entity.resetFakerSeed(`${SEED}-3`);
  const fieldsWithFullData = clientFields.filter(field => !field.transient);
  entity.tsSampleWithFullData = stringifyTsEntity(generateTsTestEntityForFields(fieldsWithFullData), options);

  if (entity.primaryKey) {
    await entity.resetFakerSeed(`${SEED}-4`);
    const fieldsWithNewData = clientFields.filter(field => !field.id && field.fieldValidationRequired);
    entity.tsSampleWithNewData = stringifyTsEntity(
      {
        ...generateTsTestEntityForFields(fieldsWithNewData),
        [entity.primaryKey.name]: null,
      },
      options,
    );

    await entity.resetFakerSeed(`${SEED}-5`);
    (entity as any).tsKeyType = getTypescriptKeyType(entity.primaryKey.type);
    entity.primaryKey.tsSampleValues = [generateTestEntityId(entity.primaryKey, 0), generateTestEntityId(entity.primaryKey, 1)];
    entity.tsPrimaryKeySamples = [
      stringifyTsEntity(generateTsTestEntityForFields(entity.primaryKey.fields)),
      stringifyTsEntity(generateTsTestEntityForFields(entity.primaryKey.fields)),
    ];
  }
}
