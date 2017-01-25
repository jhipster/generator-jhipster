'use strict';

const expect = require('chai').expect,
  fail = expect.fail,
  Reader = require('../../../lib/reader/json_file_reader'),
  Parser = require('../../../lib/parser/json_parser'),
  UnaryOptions = require('../../../lib/core/jhipster/unary_options').UNARY_OPTIONS,
  BinaryOptions = require('../../../lib/core/jhipster/binary_options').BINARY_OPTIONS,
  BinaryOptionValues = require('../../../lib/core/jhipster/binary_options').BINARY_OPTION_VALUES;

describe('::parse', function () {
  var entities = {
    Employee: Reader.readEntityJSON('./test/test_files/jhipster_app/.jhipster/Employee.json'),
    Country: Reader.readEntityJSON('./test/test_files/jhipster_app/.jhipster/Country.json'),
    Department: Reader.readEntityJSON('./test/test_files/jhipster_app/.jhipster/Department.json'),
    JobHistory: Reader.readEntityJSON('./test/test_files/jhipster_app/.jhipster/JobHistory.json'),
    Location: Reader.readEntityJSON('./test/test_files/jhipster_app/.jhipster/Location.json'),
    Region: Reader.readEntityJSON('./test/test_files/jhipster_app/.jhipster/Region.json'),
    Job: Reader.readEntityJSON('./test/test_files/jhipster_app/.jhipster/Job.json'),
    Task: Reader.readEntityJSON('./test/test_files/jhipster_app/.jhipster/Task.json')
  };
  entities.Employee.relationships.filter(r => r.relationshipName === 'department')[0].javadoc = undefined;
  var content = Parser.parseEntities(entities);
  describe('when parsing a JSON entity to JDL', function () {
    it('parses entity javadoc', function () {
      expect(content.entities.Employee.comment).eq('The Employee entity.');
    });
    it('parses tableName', function () {
      expect(content.entities.Employee.tableName).eq('emp');
    });
    it('parses mandatory fields', function () {
      expect(content.entities.Country.fields.countryId.type).eq('Long');
      expect(content.entities.Country.fields.countryName.type).eq('String');
    });
    it('parses field javadoc', function () {
      expect(content.entities.Country.fields.countryId.comment).eq('The country Id');
      expect(content.entities.Country.fields.countryName.comment).to.be.undefined;
    });
    it('parses validations', function () {
      expect(content.entities.Department.fields.departmentName.validations.required.name).eq('required');
      expect(content.entities.Department.fields.departmentName.validations.required.value).to.be.undefined;
      expect(content.entities.Employee.fields.salary.validations.min.value).eq(10000);
      expect(content.entities.Employee.fields.salary.validations.max.value).eq(1000000);
      expect(content.entities.Employee.fields.employeeId.validations).to.be.empty;
    });
    it('parses enums', function () {
      expect(content.enums.Language.name).eq('Language');
      expect(content.enums.Language.values.has('FRENCH')).to.be.true;
      expect(content.enums.Language.values.has('ENGLISH')).to.be.true;
      expect(content.enums.Language.values.has('SPANISH')).to.be.true;
    });
    it('parses options', function () {
      expect(
        content.options.filter(
          option =>
          option.name === BinaryOptions.DTO &&
          option.value === BinaryOptionValues.dto.MAPSTRUCT &&
          option.entityNames.has('Employee')
        ).length
      ).to.eq(1);
      expect(
        content.options.filter(
          option =>
          option.name === BinaryOptions.PAGINATION &&
          option.value === BinaryOptionValues.pagination['INFINITE-SCROLL'] &&
          option.entityNames.has('Employee')
        ).length
      ).to.eq(1);
      expect(
        content.options.filter(
          option =>
          option.name === BinaryOptions.SERVICE &&
          option.value === BinaryOptionValues.service.SERVICE_CLASS &&
          option.entityNames.has('Employee')
        ).length
      ).to.eq(1);
      expect(
        content.options.filter(
          option =>
          option.name === BinaryOptions.SEARCH_ENGINE &&
          option.value === BinaryOptionValues.searchEngine.ELASTIC_SEARCH &&
          option.entityNames.has('Employee')
        ).length
      ).to.eq(1);
      expect(
        content.options.filter(
          option =>
          option.name === BinaryOptions.MICROSERVICE &&
          option.value === 'mymicroservice' &&
          option.entityNames.has('Employee')
        ).length
      ).to.eq(1);
      expect(
        content.options.filter(
          option =>
          option.name === BinaryOptions.ANGULAR_SUFFIX &&
          option.value === 'myentities' &&
          option.entityNames.has('Employee')
        ).length
      ).to.eq(1);
      expect(
        content.options.filter(
          option =>
          option.name === UnaryOptions.NO_FLUENT_METHOD &&
          option.entityNames.has('Employee')
        ).length
      ).to.eq(1);
    });
  });

  describe('when parsing JSON entities to JDL', function () {
    it('parses unidirectional OneToOne relationships', function () {
      expect(content.relationships.relationships.OneToOne).has.property('OneToOne_Department{location}_Location');
    });
    it('parses bidirectional OneToOne relationships', function () {
      expect(content.relationships.relationships.OneToOne).has.property('OneToOne_Country{region}_Region{country}');
    });
    it('parses bidirectional OneToMany relationships', function () {
      expect(
        content.relationships.relationships.OneToMany
      ).has.property('OneToMany_Department{employee}_Employee{department(foo)}');
    });
    it('parses unidirectional ManyToOne relationships', function () {
      expect(content.relationships.relationships.ManyToOne).has.property('ManyToOne_Employee{manager}_Employee');
    });
    it('parses ManyToMany relationships', function () {
      expect(content.relationships.relationships.ManyToMany).has.property('ManyToMany_Job{task(title)}_Task{job}');
    });
    it('parses comments in relationships for owner', function () {
      expect(
        content.relationships.relationships.OneToMany['OneToMany_Department{employee}_Employee{department(foo)}'].commentInFrom
      ).to.eq('A relationship');
      expect(
        content.relationships.relationships.OneToMany['OneToMany_Department{employee}_Employee{department(foo)}'].commentInTo
      ).to.be.undefined;
    });
    it('parses comments in relationships for owned', function () {
      var entities = {
        'Department': Reader.readEntityJSON('./test/test_files/jhipster_app/.jhipster/Department.json'),
        'Employee': Reader.readEntityJSON('./test/test_files/jhipster_app/.jhipster/Employee.json')
      };
      entities.Department.relationships.filter(r => r.relationshipName === 'employee')[0].javadoc = undefined;
      var content = Parser.parseEntities(entities);
      expect(
        content.relationships.relationships.OneToMany['OneToMany_Department{employee}_Employee{department(foo)}'].commentInFrom
      ).to.be.undefined;
      expect(
        content.relationships.relationships.OneToMany['OneToMany_Department{employee}_Employee{department(foo)}'].commentInTo
      ).to.eq('Another side of the same relationship');
    });
    it('parses required relationships in owner', function () {
      expect(
        content.relationships.relationships.OneToMany['OneToMany_Department{employee}_Employee{department(foo)}'].isInjectedFieldInFromRequired
      ).to.be.true;
      expect(
        content.relationships.relationships.OneToMany['OneToMany_Department{employee}_Employee{department(foo)}'].isInjectedFieldInToRequired
      ).to.be.undefined;
    });
    it('parses required relationships in owned', function () {
      expect(
        content.relationships.relationships.ManyToMany['ManyToMany_Job{task(title)}_Task{job}'].isInjectedFieldInToRequired
      ).to.be.true;
      expect(
        content.relationships.relationships.ManyToMany['ManyToMany_Job{task(title)}_Task{job}'].isInjectedFieldInFromRequired
      ).to.be.undefined;
    });
  });

  describe('when parsing app config file to JDL', function () {
    var yoRcJson = Reader.readEntityJSON('./test/test_files/jhipster_app/.yo-rc.json');
    var content = Parser.parseServerOptions(yoRcJson['generator-jhipster']);
    it('parses server options', function () {
      expect(content.options.filter(
        option => option.name === UnaryOptions.SKIP_CLIENT && option.entityNames.has('*')).length
      ).to.eq(1);
      expect(
        content.options.filter(
          option => option.name === UnaryOptions.SKIP_SERVER && option.entityNames.has('*')).length
      ).to.eq(1);
    });
  });

  describe('when parsing entities with relationships to User', function () {
    describe('when skipUserManagement flag is not set', function () {
      describe('when there is no User.json entity', function () {
        var entities = {
          Country: Reader.readEntityJSON('./test/test_files/jhipster_app/.jhipster/Country.json')
        };
        var content = Parser.parseEntities(entities);
        it('parses relationships to the JHipster managed User entity', function () {
          expect(content.relationships.relationships.OneToOne).has.property('OneToOne_Country{user}_User');
        });
      });
      describe('when there is a User.json entity', function () {
        it('throws an error ', function () {
          try {
            Parser.parseEntities({
              Country: Reader.readEntityJSON('./test/test_files/jhipster_app/.jhipster/Country.json'),
              User: Reader.readEntityJSON('./test/test_files/jhipster_app/.jhipster/Region.json')
            });
            fail();
          } catch (error) {
            expect(error.name).to.eq('IllegalNameException');
          }
        });
      });
    });
    describe('when skipUserManagement flag is set', function () {
      var entities = {
        Country: Reader.readEntityJSON('./test/test_files/jhipster_app/.jhipster/Country.json'),
        User: Reader.readEntityJSON('./test/test_files/jhipster_app/.jhipster/Region.json')
      };
      entities.User.relationships[0].otherEntityRelationshipName = 'user';
      var yoRcJson = Reader.readEntityJSON('./test/test_files/jhipster_app/.yo-rc.json');
      yoRcJson['generator-jhipster'].skipUserManagement = true;
      var content = Parser.parseServerOptions(yoRcJson['generator-jhipster']);
      Parser.parseEntities(entities, content);
      it('parses the User.json entity if skipUserManagement flag is set', function () {
        expect(content.entities.Country).not.to.be.undefined;
        expect(content.entities.User).not.to.be.undefined;
        expect(content.entities.User.fields.regionId).not.to.be.undefined;
        expect(content.relationships.relationships.OneToOne).has.property('OneToOne_Country{user}_User{country}');
      });
    });
  });

});
