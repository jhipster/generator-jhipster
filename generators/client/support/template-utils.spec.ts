import { describe, expect, it } from 'esmocha';

import { entityOptions } from '../../../lib/jhipster/index.ts';

import { generateEntityClientImports, generateTestEntityId } from './template-utils.ts';

const { MapperTypes } = entityOptions;

const NO_DTO = MapperTypes.NO;

describe('generator - client - support - template-utils', () => {
  describe('generateEntityClientImports', () => {
    describe('with relationships to entities', () => {
      const relationships = [
        {
          otherEntity: {
            clientRootFolder: '',
            entityAngularName: 'EntityA',
          },
          persistableRelationship: true,
        },
        {
          otherEntity: {
            clientRootFolder: '',
            entityAngularName: 'EntityB',
          },
          relationshipEagerLoad: true,
        },
        {
          otherEntity: {
            clientRootFolder: '',
            entityAngularName: 'EntityC',
          },
        },
      ];

      it('return only imports for relevant relationships for fields', () => {
        const imports = generateEntityClientImports(relationships as any, NO_DTO);
        expect(imports.has('IEntityA')).toBe(true);
        expect(imports.has('IEntityB')).toBe(true);
        expect(imports.size).toEqual(2);
      });
    });

    describe('with relationships from or to the User', () => {
      const relationships = [
        {
          otherEntity: {
            clientRootFolder: '',
            entityAngularName: 'User',
          },
          persistableRelationship: true,
        },
        {
          otherEntity: {
            clientRootFolder: '',
            entityAngularName: 'AnEntity',
          },
          persistableRelationship: true,
        },
      ];
      describe('when called with 2 distinct relationships without dto option', () => {
        it('return a Map with 2 imports', () => {
          const imports = generateEntityClientImports(relationships as any, NO_DTO);
          expect(imports.has('IUser')).toBe(true);
          expect(imports.has('IAnEntity')).toBe(true);
          expect(imports.size).toEqual(relationships.length);
        });
      });
      describe('when called with 2 identical relationships without dto option', () => {
        const relationships = [
          {
            otherEntity: {
              clientRootFolder: '',
              entityAngularName: 'User',
            },
            persistableRelationship: true,
          },
          {
            otherEntity: {
              clientRootFolder: '',
              entityAngularName: 'User',
            },
            persistableRelationship: true,
          },
        ];
        it('return a Map with 1 import', () => {
          const imports = generateEntityClientImports(relationships as any, NO_DTO);
          expect(imports.has('IUser')).toBe(true);
          expect(imports.size).toEqual(1);
        });
      });
    });
  });

  describe('generateTestEntityId', () => {
    describe('when called with int', () => {
      it('return 123', () => {
        expect(generateTestEntityId('Integer')).toBe(123);
      });
    });
    describe('when called with String', () => {
      it("return 'ABC'", () => {
        expect(generateTestEntityId('String')).toBe("'ABC'");
      });
    });
    describe('when called with UUID', () => {
      it("return '9fec3727-3421-4967-b213-ba36557ca194'", () => {
        expect(generateTestEntityId('UUID')).toBe("'9fec3727-3421-4967-b213-ba36557ca194'");
      });
    });
  });
});
