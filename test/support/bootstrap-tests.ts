import { expect } from 'esmocha';

import { defaultHelpers as helpers, entitiesSimple, runResult } from '../../lib/testing/index.ts';

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

export const testBootstrapEntities = (generator: string) => {
  describe(`bootstraping`, () => {
    describe('default config', () => {
      before(async () => {
        await helpers.runJHipster(generator).withJHipsterConfig({}, entitiesSimple);
      });

      it('should prepare entity names', () => {
        expect(Object.keys(runResult.entities!)).toMatchSnapshot();
      });
      it('should prepare application', () => {
        expect(runResult.application).toMatchSnapshot(expectedNonRecursiveObject(runResult.application));
      });
      it('should prepare entities', () => {
        const expected = Object.fromEntries(Object.entries(runResult.entities!).map(([name, entity]) => [name, expectedEntity(entity)]));
        expect(runResult.entities).toMatchSnapshot(expected);
      });
    });
  });
};
