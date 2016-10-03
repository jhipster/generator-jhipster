'use strict';

const expect = require('chai').expect,
    Reader = require('../../../lib/reader/json_file_reader'),
    Parser = require('../../../lib/parser/json_parser'),
    RelationshipTypes = require('../../../lib/core/jhipster/relationship_types').RELATIONSHIP_TYPES,
    UnaryOptions = require('../../../lib/core/jhipster/unary_options').UNARY_OPTIONS,
    BinaryOptions = require('../../../lib/core/jhipster/binary_options').BINARY_OPTIONS,
    BinaryOptionValues = require('../../../lib/core/jhipster/binary_options').BINARY_OPTION_VALUES;

describe('::parse', function () {
  describe('when parsing a Json entity to JDL', function () {
    it('parses entity javadoc', function () {
      var entities = {
        'Employee': Reader.readEntityJSON('./test/test_files/jhipster_app/.jhipster/Employee.json')
      };
      var content = Parser.parseEntities(entities);
      expect(content.entities.Employee.comment).eq('The Employee entity.');
    });
    it('parses tableName', function () {
      var entities = {
        'Employee': Reader.readEntityJSON('./test/test_files/jhipster_app/.jhipster/Employee.json')
      };
      var content = Parser.parseEntities(entities);
      expect(content.entities.Employee.tableName).eq('emp');
    });
    it('parses mandatory fields', function () {
      var entities = {
        'Country': Reader.readEntityJSON('./test/test_files/jhipster_app/.jhipster/Country.json')
      };
      var content = Parser.parseEntities(entities);
      expect(content.entities.Country.fields.countryId.type).eq('Long');
      expect(content.entities.Country.fields.countryName.type).eq('String');

    });
    it('parses field javadoc', function () {
      var entities = {
        'Country': Reader.readEntityJSON('./test/test_files/jhipster_app/.jhipster/Country.json')
      };
      var content = Parser.parseEntities(entities);
      expect(content.entities.Country.fields.countryId.comment).eq('The country Id');
      expect(content.entities.Country.fields.countryName.comment).to.be.undefined;
    });
    it('parses validations', function () {
      var entities = {
        'Department': Reader.readEntityJSON('./test/test_files/jhipster_app/.jhipster/Department.json'),
        'Employee': Reader.readEntityJSON('./test/test_files/jhipster_app/.jhipster/Employee.json')
      };
      var content = Parser.parseEntities(entities);
      expect(content.entities.Department.fields.departmentName.validations.required.name).eq('required');
      expect(content.entities.Department.fields.departmentName.validations.required.value).to.be.undefined;
      expect(content.entities.Employee.fields.salary.validations.min.value).eq(10000);
      expect(content.entities.Employee.fields.salary.validations.max.value).eq(1000000);
      expect(content.entities.Employee.fields.employeeId.validations).to.be.empty;
    });
    it('parses enums', function () {
      var entities = {
        'JobHistory': Reader.readEntityJSON('./test/test_files/jhipster_app/.jhipster/JobHistory.json')
      };
      var content = Parser.parseEntities(entities);
      expect(content.enums.Language.name).eq('Language');
      expect(content.enums.Language.values.has('FRENCH')).to.be.true;
      expect(content.enums.Language.values.has('ENGLISH')).to.be.true;
      expect(content.enums.Language.values.has('SPANISH')).to.be.true;
    });
    it('parses options', function () {
      var entities = {
        'Employee': Reader.readEntityJSON('./test/test_files/jhipster_app/.jhipster/Employee.json')
      };
      var content = Parser.parseEntities(entities);
      expect(content.options.filter( o => o.name === BinaryOptions.DTO && o.value === BinaryOptionValues.dto.MAPSTRUCT && o.entityNames.has('Employee')).length).eq(1);
      expect(content.options.filter( o => o.name === BinaryOptions.PAGINATION && o.value === BinaryOptionValues.pagination['INFINITE-SCROLL'] && o.entityNames.has('Employee')).length).eq(1);
      expect(content.options.filter( o => o.name === BinaryOptions.SERVICE && o.value === BinaryOptionValues.service.SERVICE_CLASS && o.entityNames.has('Employee')).length).eq(1);
      expect(content.options.filter( o => o.name === BinaryOptions.SEARCH_ENGINE && o.value === BinaryOptionValues.searchEngine.ELASTIC_SEARCH && o.entityNames.has('Employee')).length).eq(1);
      expect(content.options.filter( o => o.name === BinaryOptions.MICROSERVICE && o.value === 'mymicroservice' && o.entityNames.has('Employee')).length).eq(1);
      expect(content.options.filter( o => o.name === BinaryOptions.ANGULAR_SUFFIX && o.value === 'myentities' && o.entityNames.has('Employee')).length).eq(1);
      expect(content.options.filter( o => o.name === UnaryOptions.NO_FLUENT_METHOD && o.entityNames.has('Employee')).length).eq(1);
    });
  });

  describe('when parsing Json entities to JDL', function () {
    it('parses them', function () {
      var entities = {
        'Country': Reader.readEntityJSON('./test/test_files/jhipster_app/.jhipster/Country.json'),
        'Department': Reader.readEntityJSON('./test/test_files/jhipster_app/.jhipster/Department.json')
      };
      var content = Parser.parseEntities(entities);
      expect(content.entities.Country).not.to.be.undefined;
      expect(content.entities.Department).not.to.be.undefined;
    });
    it('parses unidirectional OneToOne relationships', function () {
      var entities = {
        'Location': Reader.readEntityJSON('./test/test_files/jhipster_app/.jhipster/Location.json'),
        'Department': Reader.readEntityJSON('./test/test_files/jhipster_app/.jhipster/Department.json')
      };
      var content = Parser.parseEntities(entities);
      expect(content.relationships.relationships.OneToOne).has.property('OneToOne_Department{location}_Location');
    });
    it('parses bidirectional OneToOne relationships', function () {
      var entities = {
        'Country': Reader.readEntityJSON('./test/test_files/jhipster_app/.jhipster/Country.json'),
        'Region': Reader.readEntityJSON('./test/test_files/jhipster_app/.jhipster/Region.json')
      };
      var content = Parser.parseEntities(entities);
      expect(content.relationships.relationships.OneToOne).has.property('OneToOne_Country{region}_Region{country}');
    });
    it('parses bidirectional OneToMany relationships', function () {
      var entities = {
        'Department': Reader.readEntityJSON('./test/test_files/jhipster_app/.jhipster/Department.json'),
        'Employee': Reader.readEntityJSON('./test/test_files/jhipster_app/.jhipster/Employee.json')
      };
      var content = Parser.parseEntities(entities);
      expect(content.relationships.relationships.OneToMany).has.property('OneToMany_Department{employee}_Employee{department(foo)}');
    });
    it('parses unidirectional ManyToOne relationships', function () {
      var entities = {
        'Employee': Reader.readEntityJSON('./test/test_files/jhipster_app/.jhipster/Employee.json')
      };
      var content = Parser.parseEntities(entities);
      expect(content.relationships.relationships.ManyToOne).has.property('ManyToOne_Employee{manager}_Employee');
    });
    it('parses ManyToMany relationships', function () {
      var entities = {
        'Job': Reader.readEntityJSON('./test/test_files/jhipster_app/.jhipster/Job.json'),
        'Task': Reader.readEntityJSON('./test/test_files/jhipster_app/.jhipster/Task.json')
      };
      var content = Parser.parseEntities(entities);
      expect(content.relationships.relationships.ManyToMany).has.property('ManyToMany_Job{task(title)}_Task{job}');
    });
    it('parses required relationships in owner', function () {
      var entities = {
        'Department': Reader.readEntityJSON('./test/test_files/jhipster_app/.jhipster/Department.json'),
        'Employee': Reader.readEntityJSON('./test/test_files/jhipster_app/.jhipster/Employee.json')
      };
      var content = Parser.parseEntities(entities);
      expect(content.relationships.relationships.OneToMany['OneToMany_Department{employee}_Employee{department(foo)}'].isInjectedFieldInFromRequired).to.be.true;
      expect(content.relationships.relationships.OneToMany['OneToMany_Department{employee}_Employee{department(foo)}'].isInjectedFieldInToRequired).to.be.undefined;
    });
    it('parses required relationships in owned', function () {
      var entities = {
        'Job': Reader.readEntityJSON('./test/test_files/jhipster_app/.jhipster/Job.json'),
        'Task': Reader.readEntityJSON('./test/test_files/jhipster_app/.jhipster/Task.json')
      };
      var content = Parser.parseEntities(entities);
      expect(content.relationships.relationships.ManyToMany['ManyToMany_Job{task(title)}_Task{job}'].isInjectedFieldInToRequired).to.be.true;
      expect(content.relationships.relationships.ManyToMany['ManyToMany_Job{task(title)}_Task{job}'].isInjectedFieldInFromRequired).to.be.undefined;
    });
  });

  describe('when parsing app config file to JDL', function () {
    it('parses server options', function () {
      var yoRcJson = Reader.readEntityJSON('./test/test_files/jhipster_app/.yo-rc.json');
      var content = Parser.parseServerOptions(yoRcJson);
      expect(content.options.filter( o => o.name === UnaryOptions.SKIP_CLIENT && o.entityNames.has('*')).length).eq(1);
      expect(content.options.filter( o => o.name === UnaryOptions.SKIP_SERVER && o.entityNames.has('*')).length).eq(1);
    });
  });

});
