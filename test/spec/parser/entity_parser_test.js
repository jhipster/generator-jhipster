'use strict';

const expect = require('chai').expect,
    fs = require('fs'),
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
          expect(error.name).to.eq('NullPointerException')
        }
      });
    });
    describe('such as an no databaseType', function () {
      it('throws an error', function () {
        try {
          var input = parseFromFiles(['./test/test_files/valid_jdl.jdl']);
          EntityParser.parse({jdlObject: JDLParser.parse(input, 'sql')});
          fail();
        } catch (error) {
          expect(error.name).to.eq('NullPointerException')
        }
      });
    });
    describe('such as invalid databaseType', function () {
      it('throws an error', function () {
        try {
          var input = parseFromFiles(['./test/test_files/valid_jdl.jdl']);
          EntityParser.parse({jdlObject: JDLParser.parse(input, 'sql'), databaseType: 'mongodb'});
          fail();
        } catch (error) {
          expect(error.name).to.eq('NoSQLModelingException')
        }
      });
    });
  });
  describe('when passing valid arguments', function () {
    describe('when converting JDL to entity json for SQL type', function () {
      it('converts it', function () {
        var input = parseFromFiles(['./test/test_files/complex_jdl.jdl']);
        var content = EntityParser.parse({jdlObject: JDLParser.parse(input, 'mysql'), databaseType: 'mysql'});
        expect(content).not.to.be.null;
        expect(Object.keys(content).length).to.eq(8);
        for (let i = 0, entities = Object.keys(content); i < entities.length; i++) {
          expect(content[entities[i]].fluentMethods).to.eq(true);
        }
        expect(content.Department.relationships.length).to.eq(2);
        expect(content.Department.fields.length).to.eq(2);
        expect(content.Department.entityTableName).to.eq('department');
        expect(content.Employee.javadoc).to.eq('The Employee entity.');
        expect(content.Employee.pagination).to.eq('infinite-scroll');
        expect(content.Job.relationships[0].otherEntityRelationshipName).to.eq('job');
        expect(content.Task.relationships[0].otherEntityRelationshipName).to.eq('chore');
      });
    });
    describe('when converting JDL to entity json for MongoDB type', function () {
      it('converts it', function () {
        var input = parseFromFiles(['./test/test_files/mongo_jdl.jdl']);
        var content = EntityParser.parse({jdlObject: JDLParser.parse(input, 'mongodb'), databaseType: 'mongodb'});
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
      it('converts it', function () {
        var input = parseFromFiles(['./test/test_files/cassandra_jdl.jdl']);
        var content = EntityParser.parse({jdlObject: JDLParser.parse(input, 'cassandra'), databaseType: 'cassandra'});
        expect(content).not.to.be.null;
        expect(Object.keys(content).length).to.eq(8);
        expect(content.Department.relationships.length).to.eq(0);
        expect(content.Department.fields.length).to.eq(2);
        expect(content.Department.entityTableName).to.eq('department');
        expect(content.Employee.javadoc).to.eq('The Employee entity.');
        expect(content.Employee.pagination).to.eq('no');
      });
    });
    describe('when converting JDL to entity json with a required relationship', function() {
      it('converts it', function() {
        var input = parseFromFiles(['./test/test_files/required_relationships.jdl']);
        var content = EntityParser.parse({jdlObject: JDLParser.parse(input, 'sql'), databaseType: 'sql'});
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
  });
});
