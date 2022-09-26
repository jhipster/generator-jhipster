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
import { mutateData } from '../../../lib/utils/object.ts';
import type { Entity as ClientEntity } from '../types.ts';

import { isClientField } from './filter-entities.ts';
import {
  generateTestEntityId,
  generateTsTestEntityForFields,
  generateTsTestPrimaryKeyRouteParams,
  stringifyTsEntity,
} from './template-utils.ts';
import getTypescriptKeyType from './types-utils.ts';

const SEED = 'post-prepare-client';

/**
 * Generate test data for required non-collection relationships (just their IDs).
 * Uses path to maintain proper nested structure for composite keys.
 */
const generateRequiredRelationshipIds = (entity: ClientEntity): Record<string, any> => {
  const result: Record<string, any> = {};
  const requiredRelationships = entity.relationships?.filter(
    rel => rel.relationshipRequired && !rel.collection && rel.persistableRelationship && !rel.id,
  );
  for (const rel of requiredRelationships ?? []) {
    const otherPk = rel.otherEntity?.primaryKey;
    if (otherPk) {
      if (otherPk.composite) {
        // For composite keys, build nested structure using field.path
        const nestedObj: Record<string, any> = {};
        for (const field of otherPk.fields ?? []) {
          const path = field.path ?? [field.fieldName];
          let current = nestedObj;
          for (let i = 0; i < path.length - 1; i++) {
            current[path[i]] ??= {};
            current = current[path[i]];
          }
          current[path[path.length - 1]] = field.generateFakeData!('ts');
        }
        result[rel.propertyName] = nestedObj;
      } else {
        result[rel.propertyName] = { [otherPk.name]: generateTestEntityId(otherPk, 'random') };
      }
    }
  }
  return result;
};

export function preparePostEntityClientDerivedProperties(entity: ClientEntity) {
  let clientFields = entity.fields.filter(field => isClientField(field));
  if (entity.builtInUser) {
    clientFields = clientFields.filter(field => ['id', 'login'].includes(field.fieldName));
  }

  const options = { sep: `\n  ` };
  const { primaryKey } = entity;

  // For composite keys, primaryKey.fields includes relationship-derived fields not in entity.fields
  const pkFields = primaryKey?.fields ?? [];

  // For derived non-composite primary keys (one-to-one), copy the nested value to the flat ID field
  const addDerivedIdCopy = (sample: Record<string, any>): Record<string, any> => {
    if (!primaryKey?.derived || primaryKey.composite) return sample;
    const field = pkFields[0];
    if (field?.derivedPath) {
      // Navigate through the nested structure to get the actual value
      const value = field.derivedPath.reduce((obj, key) => obj?.[key], sample);
      if (value !== undefined) {
        sample[primaryKey.name] = value;
      }
    }
    return sample;
  };

  // Generate required relationship IDs once for reuse
  const requiredRelIds = generateRequiredRelationshipIds(entity);

  entity.resetFakerSeed!(`${SEED}-1`);
  const fieldsWithPartialData = clientFields.filter(
    field => !field.id && (field.fieldValidationRequired || (!field.transient && entity.faker!.datatype.boolean())),
  );
  entity.tsSampleWithPartialData = stringifyTsEntity(
    addDerivedIdCopy({ ...generateTsTestEntityForFields([...pkFields, ...fieldsWithPartialData]), ...requiredRelIds }),
    options,
  );

  entity.resetFakerSeed!(`${SEED}-2`);
  const fieldsWithRequiredData = clientFields.filter(field => !field.id && field.fieldValidationRequired);
  entity.tsSampleWithRequiredData = stringifyTsEntity(
    addDerivedIdCopy({ ...generateTsTestEntityForFields([...pkFields, ...fieldsWithRequiredData]), ...requiredRelIds }),
    options,
  );

  entity.resetFakerSeed!(`${SEED}-3`);
  const fieldsWithFullData = clientFields.filter(field => !field.id && !field.transient);
  entity.tsSampleWithFullData = stringifyTsEntity(
    addDerivedIdCopy({ ...generateTsTestEntityForFields([...pkFields, ...fieldsWithFullData]), ...requiredRelIds }),
    options,
  );

  if (primaryKey) {
    entity.resetFakerSeed!(`${SEED}-4`);
    const fieldsWithNewData = clientFields.filter(field => !field.id && field.fieldValidationRequired);
    // For auto-generated non-derived simple keys, use null; otherwise generate values
    const useNullId = !primaryKey.composite && !primaryKey.derived && primaryKey.autoGenerate;
    entity.tsSampleWithNewData = useNullId
      ? stringifyTsEntity({ ...generateTsTestEntityForFields(fieldsWithNewData), [primaryKey.name]: null, ...requiredRelIds }, options)
      : stringifyTsEntity({ ...generateTsTestEntityForFields([...pkFields, ...fieldsWithNewData]), ...requiredRelIds }, options);

    entity.resetFakerSeed!(`${SEED}-5`);
    mutateData(entity, {
      tsKeyType: getTypescriptKeyType(primaryKey.type),
    });
    primaryKey.tsSampleValues = [generateTestEntityId(primaryKey, 0), generateTestEntityId(primaryKey, 1)];
    entity.tsPrimaryKeySamples = [
      stringifyTsEntity(addDerivedIdCopy(generateTsTestEntityForFields(primaryKey.fields, 0))),
      stringifyTsEntity(addDerivedIdCopy(generateTsTestEntityForFields(primaryKey.fields, 1))),
    ];
    entity.tsPrimaryKeyRouteParamsSamples = [
      stringifyTsEntity(generateTsTestPrimaryKeyRouteParams(primaryKey.fields, 0)),
      stringifyTsEntity(generateTsTestPrimaryKeyRouteParams(primaryKey.fields, 1)),
    ];
  }
}
