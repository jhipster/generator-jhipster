import path from 'path';
import { expect } from 'chai';
import { jestExpect } from 'mocha-expect-snapshot';
import BaseGeneratorClass from '../generators/base/index.mjs';
import { databaseTypes, entityOptions, fieldTypes } from '../jdl/jhipster/index.mjs';

// eslint-disable-next-line import/no-named-default
import { getDBTypeFromDBValue } from '../generators/server/support/index.mjs';
import { generateEntityClientImports, getTypescriptType, generateTestEntityId } from '../generators/client/support/index.mjs';

// eslint-disable-next-line import/no-named-default
import { default as JHipsterClientGeneratorClass } from '../generators/client/generator.mjs';
import { getEntityParentPathAddition } from '../generators/client/support/index.mjs';

const { CASSANDRA, MONGODB, MYSQL, SQL } = databaseTypes;
const { MapperTypes } = entityOptions;
const { CommonDBTypes } = fieldTypes;

const BaseGenerator = BaseGeneratorClass.prototype;
const ClientGenerator = JHipsterClientGeneratorClass.prototype;

const NO_DTO = MapperTypes.NO;

BaseGenerator.log = msg => {
  // eslint-disable-next-line no-console
  console.log(msg);
};

describe('generator - base-private', () => {
  describe('getDBTypeFromDBValue', () => {
    describe('when called with sql DB name', () => {
      it('return SQL', () => {
        expect(getDBTypeFromDBValue(MYSQL)).to.equal(SQL);
      });
    });
    describe('when called with mongo DB', () => {
      it('return mongodb', () => {
        expect(getDBTypeFromDBValue(MONGODB)).to.equal(MONGODB);
      });
    });
    describe('when called with cassandra', () => {
      it('return cassandra', () => {
        expect(getDBTypeFromDBValue(CASSANDRA)).to.equal(CASSANDRA);
      });
    });
  });

  describe('generateEntityClientImports', () => {
    describe('with relationships from or to the User', () => {
      const relationships = [
        {
          otherEntityAngularName: 'User',
        },
        {
          otherEntityAngularName: 'AnEntity',
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
          },
          {
            otherEntityAngularName: 'User',
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
        expect(generateTestEntityId('int')).to.equal(123);
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
        expect(getEntityParentPathAddition(ClientGenerator.logger, ClientGenerator.env, '/')).to.equal('');
      });
    });
    describe('when passing /foo/', () => {
      it('returns ../', () => {
        expect(getEntityParentPathAddition(ClientGenerator.logger, ClientGenerator.env, '/foo/')).to.equal('../');
      });
    });
    describe('when passing undefined', () => {
      it('returns an empty string', () => {
        expect(getEntityParentPathAddition(ClientGenerator.logger, ClientGenerator.env)).to.equal('');
      });
    });
    describe('when passing empty', () => {
      it('returns an empty string', () => {
        expect(getEntityParentPathAddition(ClientGenerator.logger, ClientGenerator.env, '')).to.equal('');
      });
    });
    describe('when passing foo', () => {
      it('returns ../', () => {
        expect(getEntityParentPathAddition(ClientGenerator.logger, ClientGenerator.env, 'foo')).to.equal('../');
      });
    });
    describe('when passing foo/bar', () => {
      it('returns ../../', () => {
        expect(getEntityParentPathAddition(ClientGenerator.logger, ClientGenerator.env, 'foo/bar')).to.equal(`..${path.sep}../`);
      });
    });
    describe('when passing ../foo', () => {
      it('returns an empty string', () => {
        expect(getEntityParentPathAddition(ClientGenerator.logger, ClientGenerator.env, '../foo')).to.equal('');
      });
    });
    describe('when passing ../foo/bar', () => {
      it('returns ../', () => {
        expect(getEntityParentPathAddition(ClientGenerator.logger, ClientGenerator.env, '../foo/bar')).to.equal('../');
      });
    });
    describe('when passing ../foo/bar/foo2', () => {
      it('returns ../../', () => {
        expect(getEntityParentPathAddition(ClientGenerator.logger, ClientGenerator.env, '../foo/bar/foo2')).to.equal(`..${path.sep}../`);
      });
    });
    describe('when passing ../../foo', () => {
      it('throw an error', () => {
        expect(() => getEntityParentPathAddition(ClientGenerator.logger, ClientGenerator.env, '../../foo')).to.throw();
      });
    });
  });

  describe('getTypescriptType', () => {
    describe('when called with sql DB name', () => {
      it('return SQL', () => {
        jestExpect(Object.fromEntries(Object.values(CommonDBTypes).map(dbType => [dbType, getTypescriptType(dbType)])))
          .toMatchInlineSnapshot(`
{
  "AnyBlob": "string",
  "BigDecimal": "number",
  "Blob": "string",
  "Boolean": "boolean",
  "Double": "number",
  "Duration": "string",
  "Enum": "Enum",
  "Float": "number",
  "ImageBlob": "string",
  "Instant": "dayjs.Dayjs",
  "Integer": "number",
  "LocalDate": "dayjs.Dayjs",
  "Long": "number",
  "String": "string",
  "TextBlob": "string",
  "UUID": "string",
  "ZonedDateTime": "dayjs.Dayjs",
}
`);
      });
    });
  });
});
