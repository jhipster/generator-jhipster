/**
 * Copyright 2013-2020 the original author or authors from the JHipster project.
 *
 * This file is part of the JHipster project, see http://www.jhipster.tech/
 * for more information.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *      http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */
/* eslint-disable no-unused-expressions */

const { expect } = require('chai');
const { OptionNames } = require('../../../lib/core/jhipster/application_options');
const BinaryOptions = require('../../../lib/core/jhipster/binary_options');
const StringJDLApplicationConfigurationOption = require('../../../lib/core/string_jdl_application_configuration_option');
const JDLApplication = require('../../../lib/core/jdl_application');
const JDLBinaryOption = require('../../../lib/core/jdl_binary_option');

describe('JDLApplication', () => {
  describe('hasConfigurationOption', () => {
    context('when the application does not have the option', () => {
      let application;

      before(() => {
        application = new JDLApplication();
      });

      it('should return false', () => {
        expect(application.hasConfigurationOption(OptionNames.BASE_NAME)).to.be.false;
      });
    });
    context('when the application has the option', () => {
      let application;

      before(() => {
        application = new JDLApplication();
        application.setConfigurationOption(
          new StringJDLApplicationConfigurationOption(OptionNames.BASE_NAME, 'application')
        );
      });

      it('should return true', () => {
        expect(application.hasConfigurationOption(OptionNames.BASE_NAME)).to.be.true;
      });
    });
  });
  describe('setConfigurationOption', () => {
    context('when not passing an option', () => {
      let application;

      before(() => {
        application = new JDLApplication();
      });

      it('should fail', () => {
        expect(() => application.setConfigurationOption()).to.throw(/^An option has to be passed to set an option\.$/);
      });
    });
    context('when setting a new option', () => {
      let application;

      before(() => {
        application = new JDLApplication();
        application.setConfigurationOption(
          new StringJDLApplicationConfigurationOption(OptionNames.BASE_NAME, 'application')
        );
      });

      it('should add it', () => {
        expect(application.hasConfigurationOption(OptionNames.BASE_NAME)).to.be.true;
      });
    });
    context('when setting an already present option', () => {
      let application;

      before(() => {
        application = new JDLApplication();
        application.setConfigurationOption(
          new StringJDLApplicationConfigurationOption(OptionNames.BASE_NAME, 'application')
        );
        application.setConfigurationOption(
          new StringJDLApplicationConfigurationOption(OptionNames.BASE_NAME, 'application2')
        );
      });

      it('should replace its value', () => {
        expect(application.getConfigurationOptionValue(OptionNames.BASE_NAME)).to.equal('application2');
      });
    });
  });
  describe('getConfigurationOptionValue', () => {
    context('when not passing an option name', () => {
      let application;

      before(() => {
        application = new JDLApplication();
      });

      it('should fail', () => {
        expect(() => application.getConfigurationOptionValue()).to.throw(
          /^An option name has to be passed to get a value\.$/
        );
      });
    });
    context('when the application does not have the option', () => {
      let application;

      before(() => {
        application = new JDLApplication();
      });

      it('should return undefined', () => {
        expect(application.getConfigurationOptionValue(OptionNames.BASE_NAME)).to.be.undefined;
      });
    });
    context('when the application has the option', () => {
      let application;

      before(() => {
        application = new JDLApplication();
        application.setConfigurationOption(
          new StringJDLApplicationConfigurationOption(OptionNames.BASE_NAME, 'application')
        );
      });

      it('should return its value', () => {
        expect(application.getConfigurationOptionValue(OptionNames.BASE_NAME)).to.equal('application');
      });
    });
  });
  describe('forEachConfigurationOption', () => {
    context('when not passing a function', () => {
      let application;

      before(() => {
        application = new JDLApplication();
      });

      it('should not do anything', () => {
        expect(() => application.forEachConfigurationOption()).not.to.throw();
      });
    });
    context('when passing a function', () => {
      let result;

      before(() => {
        const application = new JDLApplication();
        application.setConfigurationOption(new StringJDLApplicationConfigurationOption(OptionNames.BASE_NAME, 'toto'));
        application.setConfigurationOption(
          new StringJDLApplicationConfigurationOption(OptionNames.JHI_PREFIX, 'prefix')
        );
        result = [];
        application.forEachConfigurationOption(option => {
          result.push(`${option.name} is ${option.getValue()}`);
        });
        result = result.join(' and ');
      });

      it('should iterate over the options', () => {
        expect(result).to.equal('baseName is toto and jhiPrefix is prefix');
      });
    });
  });
  describe('addEntityName', () => {
    context('when not passing an entity name', () => {
      let application;

      before(() => {
        application = new JDLApplication();
      });

      it('should fail', () => {
        expect(() => application.addEntityName()).to.throw(
          /^An entity name has to be passed so as to be added to the application\.$/
        );
      });
    });
    context('when passing an entity name', () => {
      context('that has not already been added', () => {
        let entityNames;

        before(() => {
          const application = new JDLApplication();
          application.addEntityName('A');
          entityNames = application.getEntityNames();
        });

        it('should add it', () => {
          expect(entityNames.length).to.equal(1);
        });
      });
      context('that has already been added', () => {
        let entityNames;

        before(() => {
          const application = new JDLApplication();
          application.addEntityName('A');
          application.addEntityName('A');
          entityNames = application.getEntityNames();
        });

        it('should not add it', () => {
          expect(entityNames.length).to.equal(1);
        });
      });
    });
  });
  describe('addEntityNames', () => {
    context('when not passing entity names', () => {
      let entityNames;

      before(() => {
        const application = new JDLApplication({
          config: {
            baseName: 'toto'
          },
          entityNames: ['A', 'B']
        });
        application.addEntityNames();
        entityNames = application.getEntityNames();
      });

      it('should not alter the entity names', () => {
        expect(entityNames.length).to.equal(2);
      });
    });
    context('when passing an empty list', () => {
      let entityNames;

      before(() => {
        const application = new JDLApplication({
          config: {
            baseName: 'toto'
          },
          entityNames: ['A', 'B']
        });
        application.addEntityNames([]);
        entityNames = application.getEntityNames();
      });

      it('should not alter the entity names', () => {
        expect(entityNames.length).to.equal(2);
      });
    });
    context('when passing entity names', () => {
      let application;

      before(() => {
        application = new JDLApplication({
          config: {
            baseName: 'toto'
          },
          entityNames: ['A', 'B']
        });
        application.addEntityNames(['B', 'C']);
      });

      it('should update the entity names', () => {
        expect(application.getEntityNames().length).to.equal(3);
      });
    });
  });
  describe('getEntityNames', () => {
    context('when there is no entity', () => {
      let entityNames;

      before(() => {
        const jdlApplication = new JDLApplication();
        entityNames = jdlApplication.getEntityNames();
      });

      it('should return an empty list', () => {
        expect(entityNames.length).to.equal(0);
      });
    });
    context('when there are entities', () => {
      let entityNames;

      before(() => {
        const jdlApplication = new JDLApplication({
          config: {},
          entityNames: ['A', 'B']
        });
        entityNames = jdlApplication.getEntityNames();
      });

      it('should return the entity list', () => {
        expect(entityNames.length).to.equal(2);
      });
    });
  });
  describe('forEachEntityName', () => {
    let application;

    before(() => {
      application = new JDLApplication({ entityNames: ['A', 'B'] });
    });

    context('when not passing a function', () => {
      it('does not fail', () => {
        application.forEachEntityName();
      });
    });
    context('when passing a function', () => {
      const result = [];

      before(() => {
        application.forEachEntityName(entityName => {
          result.push(entityName);
        });
      });

      it('uses each entity name', () => {
        expect(result).to.deep.equal(['A', 'B']);
      });
    });
  });
  describe('addOption', () => {
    context('when not passing an option', () => {
      let application;

      before(() => {
        application = new JDLApplication();
      });

      it('should fail', () => {
        expect(() => application.addOption()).to.throw(/^Can't add a nil option\.$/);
      });
    });
    context('when passing an option', () => {
      let result;

      before(() => {
        const application = new JDLApplication();
        const option = new JDLBinaryOption({
          name: BinaryOptions.Options.PAGINATION,
          value: BinaryOptions.Values.pagination['INFINITE-SCROLL'],
          entityNames: ['*'],
          excludedNames: ['D']
        });
        application.addOption(option);
        result = application.toString();
      });

      it('should add it', () => {
        expect(result).to.include('paginate * with infinite-scroll except D');
      });
    });
  });
  describe('getOptionQuantity', () => {
    context('when there is no option', () => {
      let application;

      before(() => {
        application = new JDLApplication();
      });

      it('should return 0', () => {
        expect(application.getOptionQuantity()).to.equal(0);
      });
    });
    context('when there are options', () => {
      let application;

      before(() => {
        application = new JDLApplication();
        const option1 = new JDLBinaryOption({
          name: BinaryOptions.Options.PAGINATION,
          value: BinaryOptions.Values.pagination['INFINITE-SCROLL'],
          entityNames: ['*'],
          excludedNames: ['D']
        });
        application.addOption(option1);
        const option2 = new JDLBinaryOption({
          name: BinaryOptions.Options.DTO,
          value: BinaryOptions.Values.dto.MAPSTRUCT,
          entityNames: ['*'],
          excludedNames: ['D']
        });
        application.addOption(option2);
      });

      it('should return the exact number of options', () => {
        expect(application.getOptionQuantity()).to.equal(2);
      });
    });
  });
  describe('toString', () => {
    context('when there is no entity', () => {
      let jdlApplication;

      before(() => {
        jdlApplication = new JDLApplication({ config: { jhipsterVersion: '4.9.0' } });
      });

      it('should stringify the application object', () => {
        expect(jdlApplication.toString()).to.equal(`application {
  config {
    jhipsterVersion "4.9.0"
  }
}`);
      });
    });
    context('when there are listed entities', () => {
      let jdlApplication;

      before(() => {
        jdlApplication = new JDLApplication({ entityNames: ['A', 'B', 'C', 'C'] });
      });

      it('should export the entity names', () => {
        expect(jdlApplication.toString()).to.equal(
          `application {
  config {}

  entities A, B, C
}`
        );
      });
    });
    context('when the jhipsterVersion option is there', () => {
      context('when it is not quoted', () => {
        let result;

        before(() => {
          const application = new JDLApplication({ config: { jhipsterVersion: '6.5.1' } });
          result = application.toString();
        });

        it('should stringify it quoted', () => {
          expect(result).to.include('jhipsterVersion "6.5.1"');
        });
      });
      context('when it is quoted', () => {
        let result;

        before(() => {
          const application = new JDLApplication({ config: { jhipsterVersion: '"6.5.1"' } });
          result = application.toString();
        });

        it('should not stringify it again', () => {
          expect(result).to.include('jhipsterVersion "6.5.1"');
        });
      });
    });
    context('when the jwtSecretKey option is there', () => {
      context('when it is not quoted', () => {
        let result;

        before(() => {
          const application = new JDLApplication({ config: { jwtSecretKey: 'ASTUPIDLYLONGWORD=' } });
          result = application.toString();
        });

        it('should stringify it quoted', () => {
          expect(result).to.include('jwtSecretKey "ASTUPIDLYLONGWORD="');
        });
      });
      context('when it is quoted', () => {
        let result;

        before(() => {
          const application = new JDLApplication({ config: { jwtSecretKey: '"ASTUPIDLYLONGWORD="' } });
          result = application.toString();
        });

        it('should not stringify it again', () => {
          expect(result).to.include('jwtSecretKey "ASTUPIDLYLONGWORD="');
        });
      });
    });
    context('when the rememberMeKey option is there', () => {
      context('when it is not quoted', () => {
        let result;

        before(() => {
          const application = new JDLApplication({ config: { rememberMeKey: 'ASTUPIDLYLONGWORD=' } });
          result = application.toString();
        });

        it('should stringify it quoted', () => {
          expect(result).to.include('rememberMeKey "ASTUPIDLYLONGWORD="');
        });
      });
      context('when it is quoted', () => {
        let result;

        before(() => {
          const application = new JDLApplication({ config: { rememberMeKey: '"ASTUPIDLYLONGWORD="' } });
          result = application.toString();
        });

        it('should not stringify it again', () => {
          expect(result).to.include('rememberMeKey "ASTUPIDLYLONGWORD="');
        });
      });
    });
    context('when the entitySuffix is present', () => {
      context('without a value', () => {
        let result;

        before(() => {
          const application = new JDLApplication({ config: { entitySuffix: '' } });
          result = application.toString();
        });

        it('should not stringify it', () => {
          expect(result).not.to.include('entitySuffix');
        });
      });
      context('with a value', () => {
        let result;

        before(() => {
          const application = new JDLApplication({ config: { entitySuffix: 'Entity' } });
          result = application.toString();
        });

        it('should not stringify it', () => {
          expect(result).to.include('entitySuffix Entity');
        });
      });
    });
    context('when the dtoSuffix is present', () => {
      context('without a value', () => {
        let result;

        before(() => {
          const application = new JDLApplication({ config: { dtoSuffix: '' } });
          result = application.toString();
        });

        it('should not stringify it', () => {
          expect(result).not.to.include('dtoSuffix');
        });
      });
      context('with a value', () => {
        let result;

        before(() => {
          const application = new JDLApplication({ config: { dtoSuffix: 'DTO' } });
          result = application.toString();
        });

        it('should not stringify it', () => {
          expect(result).to.include('dtoSuffix DTO');
        });
      });
    });
    context('when the clientThemeVariant is present', () => {
      context('without a value', () => {
        let result;

        before(() => {
          const application = new JDLApplication({ config: { clientThemeVariant: '' } });
          result = application.toString();
        });

        it('should not stringify it', () => {
          expect(result).not.to.include('clientThemeVariant');
        });
      });
      context('with a value', () => {
        let result;

        before(() => {
          const application = new JDLApplication({ config: { clientThemeVariant: 'aVariant' } });
          result = application.toString();
        });

        it('should not stringify it', () => {
          expect(result).to.include('clientThemeVariant aVariant');
        });
      });
    });
    context('when the packageFolder option is present', () => {
      let result;

      before(() => {
        const application = new JDLApplication({ config: { packageFolder: 'whatever' } });
        result = application.toString();
      });

      it('should not stringify it', () => {
        expect(result).not.to.include('packageFolder');
      });
    });
    context('when there are options', () => {
      let result;

      before(() => {
        const application = new JDLApplication({
          entityNames: ['A', 'B', 'C']
        });
        const option1 = new JDLBinaryOption({
          name: BinaryOptions.Options.PAGINATION,
          value: BinaryOptions.Values.pagination['INFINITE-SCROLL'],
          entityNames: ['*'],
          excludedNames: ['D']
        });
        const option2 = new JDLBinaryOption({
          name: BinaryOptions.Options.SERVICE,
          value: BinaryOptions.Values.service.SERVICE_CLASS,
          entityNames: ['A', 'B', 'C']
        });
        application.addOption(option1);
        application.addOption(option2);
        result = application.toString();
      });

      it('should add the options', () => {
        expect(result).to.equal(`application {
  config {}

  entities A, B, C

  paginate * with infinite-scroll except D
  service A, B, C with serviceClass
}`);
      });
    });
  });
});
