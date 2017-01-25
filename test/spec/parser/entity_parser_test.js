'use strict';

const expect = require('chai').expect,
  fail = expect.fail,
  JDLParser = require('../../../lib/parser/jdl_parser'),
  EntityParser = require('../../../lib/parser/entity_parser'),
  parseFromFiles = require('../../../lib/reader/jdl_reader').parseFromFiles;

describe('::convert', function () {
  describe('when passing invalid parameters', function () {
    describe('such as undefined', function () {
      it('throws an error', function () {
        try {
          EntityParser.parse();
          fail();
        } catch (error) {
          expect(error.name).to.eq('NullPointerException');
        }
      });
    });
    describe('such as an no databaseType', function () {
      var input = parseFromFiles(['./test/test_files/valid_jdl.jdl']);
      it('throws an error', function () {
        try {
          EntityParser.parse({jdlObject: JDLParser.parse(input, 'sql')});
          fail();
        } catch (error) {
          expect(error.name).to.eq('NullPointerException');
        }
      });
    });
    describe('such as invalid databaseType', function () {
      var input = parseFromFiles(['./test/test_files/valid_jdl.jdl']);
      it('throws an error', function () {
        try {
          EntityParser.parse({
            jdlObject: JDLParser.parse(input, 'sql'),
            databaseType: 'mongodb'
          });
          fail();
        } catch (error) {
          expect(error.name).to.eq('NoSQLModelingException');
        }
      });
    });
  });
  describe('when passing valid arguments', function () {
    describe('when converting JDL to entity json for SQL type', function () {
      var input = parseFromFiles(['./test/test_files/complex_jdl.jdl']);
      var content = EntityParser.parse({
        jdlObject: JDLParser.parse(input, 'mysql'),
        databaseType: 'mysql'
      });
      it('converts it', function () {
        expect(content).not.to.be.null;
        expect(Object.keys(content).length).to.eq(8);
        for (let i = 0, entities = Object.keys(content); i < entities.length; i++) {
          expect(content[entities[i]].fluentMethods).to.eq(true);
        }
        expect(content.Department.relationships.length).to.eq(2);
        expect(content.Department.relationships[1].javadoc).to.eq('A relationship');
        expect(content.Department.fields.length).to.eq(2);
        expect(content.Department.entityTableName).to.eq('department');
        expect(content.Employee.javadoc).to.eq('The Employee entity.\nSecond line in javadoc.');
        expect(content.Employee.pagination).to.eq('infinite-scroll');
        expect(content.Employee.relationships[3].javadoc).to.eq('Another side of the same relationship');
        expect(content.Job.relationships[0].otherEntityRelationshipName).to.eq('job');
        expect(content.Task.relationships[0].otherEntityRelationshipName).to.eq('chore');
      });
    });
    describe('when converting JDL to entity json for MongoDB type', function () {
      var input = parseFromFiles(['./test/test_files/mongo_jdl.jdl']);
      var content = EntityParser.parse({
        jdlObject: JDLParser.parse(input, 'mongodb'),
        databaseType: 'mongodb'
      });
      it('converts it', function () {
        expect(content).not.to.be.null;
        expect(Object.keys(content).length).to.eq(8);
        expect(content.Department.relationships.length).to.eq(0);
        expect(content.Department.fields.length).to.eq(2);
        expect(content.Department.entityTableName).to.eq('department');
        expect(content.Employee.javadoc).to.eq('The Employee entity.');
        expect(content.Employee.pagination).to.eq('infinite-scroll');

      });
    });
    describe('when converting JDL to entity json for Cassandra type', function () {
      var input = parseFromFiles(['./test/test_files/cassandra_jdl.jdl']);
      var content = EntityParser.parse({
        jdlObject: JDLParser.parse(input, 'cassandra'),
        databaseType: 'cassandra'
      });
      it('converts it', function () {
        expect(content).not.to.be.null;
        expect(Object.keys(content).length).to.eq(8);
        expect(content.Department.relationships.length).to.eq(0);
        expect(content.Department.fields.length).to.eq(2);
        expect(content.Department.entityTableName).to.eq('department');
        expect(content.Employee.javadoc).to.eq('The Employee entity.');
        expect(content.Employee.pagination).to.eq('no');
      });
    });
    describe('when converting a JDL to JSON with a required relationship', function () {
      var input = parseFromFiles(['./test/test_files/required_relationships.jdl']);
      var content = EntityParser.parse({
        jdlObject: JDLParser.parse(input, 'sql'),
        databaseType: 'sql'
      });
      it('converts it', function () {
        expect(content.A.relationships).to.deep.eq([{
          otherEntityField: 'id',
          otherEntityName: 'b',
          otherEntityRelationshipName: 'a',
          ownerSide: true,
          relationshipName: 'b',
          relationshipType: 'one-to-one',
          relationshipValidateRules: 'required'
        }]);
      });
    });
    describe('when converting a JDL to JSON with fluent methods', function () {
      var input = parseFromFiles(['./test/test_files/fluent_methods.jdl']);
      var content = EntityParser.parse({
        jdlObject: JDLParser.parse(input, 'sql'),
        databaseType: 'sql'
      });
      it('converts it', function () {
        expect(content.A.fluentMethods).to.be.false;
        expect(content.B.fluentMethods).to.be.true;
        expect(content.C.fluentMethods).to.be.true;
        input = parseFromFiles(['./test/test_files/fluent_methods2.jdl']);
        content = EntityParser.parse({
          jdlObject: JDLParser.parse(input, 'sql'),
          databaseType: 'sql'
        });
        expect(content.A.fluentMethods).to.be.true;
        expect(content.B.fluentMethods).to.be.false;
        expect(content.C.fluentMethods).to.be.false;
      });
    });
    describe('when converting a JDL to JSON with all different types of bi-directional relationships', function () {
      var input = parseFromFiles(['./test/test_files/different_relationship_types.jdl']);
      var content = EntityParser.parse({
        jdlObject: JDLParser.parse(input, 'sql'),
        databaseType: 'sql'
      });
      it('converts it', function () {
        expect(content.A.relationships).to.deep.eq(
          [
            {
              'relationshipName': 'bbbb',
              'otherEntityName': 'b',
              'relationshipType': 'one-to-one',
              'otherEntityField': 'id',
              'ownerSide': true,
              'otherEntityRelationshipName': 'aaaa'
            },
            {
              'relationshipName': 'b',
              'otherEntityName': 'b',
              'relationshipType': 'one-to-many',
              'otherEntityRelationshipName': 'a'
            },
            {
              'relationshipName': 'bb',
              'otherEntityName': 'b',
              'relationshipType': 'many-to-one',
              'otherEntityField': 'id'
            },
            {
              'relationshipName': 'bbb',
              'otherEntityName': 'b',
              'relationshipType': 'many-to-many',
              'otherEntityField': 'id',
              'ownerSide': true,
              'otherEntityRelationshipName': 'aaa'
            }
          ]
        );
        expect(content.B.relationships).to.deep.eq(
          [
            {
              'relationshipName': 'aaaa',
              'otherEntityName': 'a',
              'relationshipType': 'one-to-one',
              'ownerSide': false,
              'otherEntityRelationshipName': 'bbbb'
            },
            {
              'relationshipName': 'a',
              'otherEntityName': 'a',
              'relationshipType': 'many-to-one',
              'otherEntityField': 'id'
            },
            {
              'relationshipName': 'aa',
              'otherEntityName': 'a',
              'relationshipType': 'one-to-many',
              'otherEntityRelationshipName': 'bb'
            },
            {
              'relationshipName': 'aaa',
              'otherEntityName': 'a',
              'relationshipType': 'many-to-many',
              'ownerSide': false,
              'otherEntityRelationshipName': 'bbb'
            }
          ]
        );
      });
    });
  });
});
