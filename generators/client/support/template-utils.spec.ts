import { expect } from 'chai';
import { describe, it } from 'esmocha';
import { entityOptions } from '../../../lib/jhipster/index.js';

import { generateEntityClientImports, generateTestEntityId } from './template-utils.js';

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
        expect(imports).to.have.all.keys('IEntityA', 'IEntityB');
        expect(imports.size).to.eql(2);
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
          expect(imports).to.have.all.keys('IUser', 'IAnEntity');
          expect(imports.size).to.eql(relationships.length);
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
          expect(imports).to.have.key('IUser');
          expect(imports.size).to.eql(1);
        });
      });
    });
  });

  describe('generateTestEntityId', () => {
    describe('when called with int', () => {
      it('return 123', () => {
        expect(generateTestEntityId('Integer')).to.equal(123);
      });
    });
    describe('when called with String', () => {
      it("return 'ABC'", () => {
        expect(generateTestEntityId('String')).to.equal("'ABC'");
      });
    });
    describe('when called with UUID', () => {
      it("return '9fec3727-3421-4967-b213-ba36557ca194'", () => {
        expect(generateTestEntityId('UUID')).to.equal("'9fec3727-3421-4967-b213-ba36557ca194'");
      });
    });
  });
});
