import path from 'path';
import { expect } from 'chai';
import { describe, it } from 'esmocha';
import { entityOptions } from '../../../lib/jhipster/index.js';

import { generateEntityClientImports, generateTestEntityId, getEntityParentPathAddition } from './template-utils.js';

const { MapperTypes } = entityOptions;

const NO_DTO = MapperTypes.NO;

describe('generator - client - support - template-utils', () => {
  describe('generateEntityClientImports', () => {
    describe('with relationships to entities', () => {
      const relationships = [
        {
          otherEntityAngularName: 'EntityA',
          persistableRelationship: true,
        },
        {
          otherEntityAngularName: 'EntityB',
          relationshipEagerLoad: true,
        },
        {
          otherEntityAngularName: 'EntityC',
        },
      ];

      it('return only imports for relevant relationships for fields', () => {
        const imports = generateEntityClientImports(relationships, NO_DTO);
        expect(imports).to.have.all.keys('IEntityA', 'IEntityB');
        expect(imports.size).to.eql(2);
      });
    });

    describe('with relationships from or to the User', () => {
      const relationships = [
        {
          otherEntityAngularName: 'User',
          persistableRelationship: true,
        },
        {
          otherEntityAngularName: 'AnEntity',
          persistableRelationship: true,
        },
      ];
      describe('when called with 2 distinct relationships without dto option', () => {
        it('return a Map with 2 imports', () => {
          const imports = generateEntityClientImports(relationships, NO_DTO);
          expect(imports).to.have.all.keys('IUser', 'IAnEntity');
          expect(imports.size).to.eql(relationships.length);
        });
      });
      describe('when called with 2 identical relationships without dto option', () => {
        const relationships = [
          {
            otherEntityAngularName: 'User',
            persistableRelationship: true,
          },
          {
            otherEntityAngularName: 'User',
            persistableRelationship: true,
          },
        ];
        it('return a Map with 1 import', () => {
          const imports = generateEntityClientImports(relationships, NO_DTO);
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

  describe('getEntityParentPathAddition', () => {
    describe('when passing /', () => {
      it('returns an empty string', () => {
        expect(getEntityParentPathAddition('/')).to.equal('');
      });
    });
    describe('when passing /foo/', () => {
      it('returns ../', () => {
        expect(getEntityParentPathAddition('/foo/')).to.equal('../');
      });
    });
    describe('when passing undefined', () => {
      it('returns an empty string', () => {
        // @ts-expect-error testing invalid argument
        expect(getEntityParentPathAddition()).to.equal('');
      });
    });
    describe('when passing empty', () => {
      it('returns an empty string', () => {
        expect(getEntityParentPathAddition('')).to.equal('');
      });
    });
    describe('when passing foo', () => {
      it('returns ../', () => {
        expect(getEntityParentPathAddition('foo')).to.equal('../');
      });
    });
    describe('when passing foo/bar', () => {
      it('returns ../../', () => {
        expect(getEntityParentPathAddition('foo/bar')).to.equal(`..${path.sep}../`);
      });
    });
    describe('when passing ../foo', () => {
      it('returns an empty string', () => {
        expect(getEntityParentPathAddition('../foo')).to.equal('');
      });
    });
    describe('when passing ../foo/bar', () => {
      it('returns ../', () => {
        expect(getEntityParentPathAddition('../foo/bar')).to.equal('../');
      });
    });
    describe('when passing ../foo/bar/foo2', () => {
      it('returns ../../', () => {
        expect(getEntityParentPathAddition('../foo/bar/foo2')).to.equal(`..${path.sep}../`);
      });
    });
    describe('when passing ../../foo', () => {
      it('throw an error', () => {
        expect(() => getEntityParentPathAddition('../../foo')).to.throw();
      });
    });
  });
});
