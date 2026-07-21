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

import { before, describe, expect, it } from 'esmocha';

import { defaultHelpers as helpers, entitiesSimple, runResult } from '#testing';

const expectedNonRecursiveObject = (object: any, except: string[] = []) => {
  const properties = Object.keys(object).filter(key => !except.includes(key));
  const arrayProperties = properties.filter(key => Array.isArray(object[key]));
  const objectProperties = properties.filter(
    key => !arrayProperties.includes(key) && typeof object[key] === 'object' && object[key] !== null,
  );
  const functionProperties = properties.filter(key => typeof object[key] === 'function');

  return {
    ...Object.fromEntries(arrayProperties.map(key => [key, expect.any(Array)])),
    ...Object.fromEntries(objectProperties.map(key => [key, expect.any(Object)])),
    ...Object.fromEntries(functionProperties.map(key => [key, expect.any(Function)])),
  };
};

// autoCrlf is only set on win32 (lib/jhipster/default-application-options.ts) and never appears
// in Linux CI-generated snapshots, so it must be excluded from cross-platform snapshot comparisons.
const omitEnvironmentSpecific = (object: any) => {
  const { autoCrlf: _autoCrlf, ...rest } = object;
  return rest;
};

const expectedField = (field: any) => expectedNonRecursiveObject(field, ['path', 'fieldValidateRules']);

const expectedRelationship = (relationship: any) => expectedNonRecursiveObject(relationship, []);

const expectedPrimaryKeyId = (id: any) => expectedNonRecursiveObject(id);

const expectedPrimaryKey = (primaryKey: any) => ({
  ...expectedNonRecursiveObject(primaryKey, ['ids']),
  ids: primaryKey.ids.map(expectedPrimaryKeyId),
});

const expectedEntity = (entity: any) => ({
  ...expectedNonRecursiveObject(entity, ['fields', 'relationships', 'primaryKey']),
  fields: entity?.fields?.map(expectedField),
  relationships: entity?.relationships?.map(expectedRelationship),
  primaryKey: expectedPrimaryKey(entity.primaryKey),
});

export const testBootstrapApplication = (generator: string, config: any = {}) => {
  describe(`bootstrapping`, () => {
    describe('default config', () => {
      before(async () => {
        await helpers.runJHipster(generator).withJHipsterConfig(config);
      });

      it('should prepare application', () => {
        const application = omitEnvironmentSpecific(runResult.application);
        expect(application).toMatchSnapshot(expectedNonRecursiveObject(application));
      });
    });
  });
};

export const testBootstrapEntities = (generator: string, config: any = {}) => {
  describe(`bootstrapping`, () => {
    describe('default config', () => {
      before(async () => {
        await helpers.runJHipster(generator).withJHipsterConfig(config, entitiesSimple);
      });

      it('should prepare entity names', () => {
        expect(Object.keys(runResult.entities!)).toMatchSnapshot();
      });
      it('should prepare application', () => {
        const application = omitEnvironmentSpecific(runResult.application);
        expect(application).toMatchSnapshot(expectedNonRecursiveObject(application));
      });
      it('should prepare entities', () => {
        const expected = Object.fromEntries(Object.entries(runResult.entities!).map(([name, entity]) => [name, expectedEntity(entity)]));
        expect(runResult.entities).toMatchSnapshot(expected);
      });
    });
  });
};
