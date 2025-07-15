/**
 * Copyright 2013-2025 the original author or authors from the JHipster project.
 *
 * This file is part of the JHipster project, see https://www.jhipster.tech/
 * for more information.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *      https://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

import { before, describe, it, expect as jestExpect } from 'esmocha';
import { expect } from 'chai';
import { binaryOptions } from '../built-in-options/index.js';
import applicationOptions from '../../../jhipster/application-options.js';
import StringJDLApplicationConfigurationOption from '../models/string-jdl-application-configuration-option.js';
import JDLApplication from '../models/jdl-application.js';
import JDLBinaryOption from '../models/jdl-binary-option.js';
import { getDefaultRuntime } from '../runtime.js';

const { OptionNames } = applicationOptions;

const runtime = getDefaultRuntime();

describe('jdl - JDLApplication', () => {
  describe('hasConfigurationOption', () => {
    describe('when the application does not have the option', () => {
      let application;

      before(() => {
        application = new JDLApplication(undefined, runtime);
      });

      it('should return false', () => {
        expect(application.hasConfigurationOption(OptionNames.BASE_NAME)).to.be.false;
      });
    });
    describe('when the application has the option', () => {
      let application;

      before(() => {
        application = new JDLApplication(undefined, runtime);
        application.setConfigurationOption(new StringJDLApplicationConfigurationOption(OptionNames.BASE_NAME, 'application'));
      });

      it('should return true', () => {
        expect(application.hasConfigurationOption(OptionNames.BASE_NAME)).to.be.true;
      });
    });
  });
  describe('setConfigurationOption', () => {
    describe('when not passing an option', () => {
      let application;

      before(() => {
        application = new JDLApplication(undefined, runtime);
      });

      it('should fail', () => {
        expect(() => application.setConfigurationOption()).to.throw(/^An option has to be passed to set an option\.$/);
      });
    });
    describe('when setting a new option', () => {
      let application;

      before(() => {
        application = new JDLApplication(undefined, runtime);
        application.setConfigurationOption(new StringJDLApplicationConfigurationOption(OptionNames.BASE_NAME, 'application'));
      });

      it('should add it', () => {
        expect(application.hasConfigurationOption(OptionNames.BASE_NAME)).to.be.true;
      });
    });
    describe('when setting an already present option', () => {
      let application;

      before(() => {
        application = new JDLApplication(undefined, runtime);
        application.setConfigurationOption(new StringJDLApplicationConfigurationOption(OptionNames.BASE_NAME, 'application'));
        application.setConfigurationOption(new StringJDLApplicationConfigurationOption(OptionNames.BASE_NAME, 'application2'));
      });

      it('should replace its value', () => {
        expect(application.getConfigurationOptionValue(OptionNames.BASE_NAME)).to.equal('application2');
      });
    });
  });
  describe('getConfigurationOptionValue', () => {
    describe('when not passing an option name', () => {
      let application;

      before(() => {
        application = new JDLApplication(undefined, runtime);
      });

      it('should fail', () => {
        expect(() => application.getConfigurationOptionValue()).to.throw(/^An option name has to be passed to get a value\.$/);
      });
    });
    describe('when the application does not have the option', () => {
      let application;

      before(() => {
        application = new JDLApplication(undefined, runtime);
      });

      it('should return undefined', () => {
        expect(application.getConfigurationOptionValue(OptionNames.BASE_NAME)).to.be.undefined;
      });
    });
    describe('when the application has the option', () => {
      let application;

      before(() => {
        application = new JDLApplication(undefined, runtime);
        application.setConfigurationOption(new StringJDLApplicationConfigurationOption(OptionNames.BASE_NAME, 'application'));
      });

      it('should return its value', () => {
        expect(application.getConfigurationOptionValue(OptionNames.BASE_NAME)).to.equal('application');
      });
    });
  });
  describe('forEachConfigurationOption', () => {
    describe('when not passing a function', () => {
      let application;

      before(() => {
        application = new JDLApplication(undefined, runtime);
      });

      it('should not do anything', () => {
        expect(() => application.forEachConfigurationOption()).not.to.throw();
      });
    });
    describe('when passing a function', () => {
      let result;

      before(() => {
        const application = new JDLApplication(undefined, runtime);
        application.setConfigurationOption(new StringJDLApplicationConfigurationOption(OptionNames.BASE_NAME, 'toto'));
        application.setConfigurationOption(new StringJDLApplicationConfigurationOption(OptionNames.JHI_PREFIX, 'prefix'));
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
    describe('when not passing an entity name', () => {
      let application;

      before(() => {
        application = new JDLApplication(undefined, runtime);
      });

      it('should fail', () => {
        expect(() => application.addEntityName()).to.throw(/^An entity name has to be passed so as to be added to the application\.$/);
      });
    });
    describe('when passing an entity name', () => {
      describe('that has not already been added', () => {
        let entityNames;

        before(() => {
          const application = new JDLApplication(undefined, runtime);
          application.addEntityName('A');
          entityNames = application.getEntityNames();
        });

        it('should add it', () => {
          expect(entityNames.length).to.equal(1);
        });
      });
      describe('that has already been added', () => {
        let entityNames;

        before(() => {
          const application = new JDLApplication(undefined, runtime);
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
    describe('when not passing entity names', () => {
      let entityNames;

      before(() => {
        const application = new JDLApplication(
          {
            config: {
              baseName: 'toto',
            },
            entityNames: ['A', 'B'],
          },
          runtime,
        );
        application.addEntityNames();
        entityNames = application.getEntityNames();
      });

      it('should not alter the entity names', () => {
        expect(entityNames.length).to.equal(2);
      });
    });
    describe('when passing an empty list', () => {
      let entityNames;

      before(() => {
        const application = new JDLApplication(
          {
            config: {
              baseName: 'toto',
            },
            entityNames: ['A', 'B'],
          },
          runtime,
        );
        application.addEntityNames([]);
        entityNames = application.getEntityNames();
      });

      it('should not alter the entity names', () => {
        expect(entityNames.length).to.equal(2);
      });
    });
    describe('when passing entity names', () => {
      let application;

      before(() => {
        application = new JDLApplication(
          {
            config: {
              baseName: 'toto',
            },
            entityNames: ['A', 'B'],
          },
          runtime,
        );
        application.addEntityNames(['B', 'C']);
      });

      it('should update the entity names', () => {
        expect(application.getEntityNames().length).to.equal(3);
      });
    });
  });
  describe('getEntityNames', () => {
    describe('when there is no entity', () => {
      let entityNames;

      before(() => {
        const jdlApplication = new JDLApplication(undefined, runtime);
        entityNames = jdlApplication.getEntityNames();
      });

      it('should return an empty list', () => {
        expect(entityNames.length).to.equal(0);
      });
    });
    describe('when there are entities', () => {
      let entityNames;

      before(() => {
        const jdlApplication = new JDLApplication(
          {
            config: {},
            entityNames: ['A', 'B'],
          },
          runtime,
        );
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
      application = new JDLApplication({ entityNames: ['A', 'B'] }, runtime);
    });

    describe('when not passing a function', () => {
      it('does not fail', () => {
        application.forEachEntityName();
      });
    });
    describe('when passing a function', () => {
      const result: any[] = [];

      before(() => {
        application.forEachEntityName(entityName => {
          result.push(entityName);
        });
      });

      it('uses each entity name', () => {
        jestExpect(result).toMatchInlineSnapshot(`
[
  "A",
  "B",
]
`);
      });
    });
  });
  describe('addOption', () => {
    describe('when not passing an option', () => {
      let application;

      before(() => {
        application = new JDLApplication(undefined, runtime);
      });

      it('should fail', () => {
        expect(() => application.addOption()).to.throw(/^Can't add a nil option\.$/);
      });
    });
    describe('when passing an option', () => {
      let result;

      before(() => {
        const application = new JDLApplication(undefined, runtime);
        const option = new JDLBinaryOption({
          name: binaryOptions.Options.PAGINATION,
          value: binaryOptions.Values.pagination['INFINITE-SCROLL'],
          entityNames: new Set(['*']),
          excludedNames: new Set(['D']),
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
    describe('when there is no option', () => {
      let application;

      before(() => {
        application = new JDLApplication(undefined, runtime);
      });

      it('should return 0', () => {
        expect(application.getOptionQuantity()).to.equal(0);
      });
    });
    describe('when there are options', () => {
      let application;

      before(() => {
        application = new JDLApplication(undefined, runtime);
        const option1 = new JDLBinaryOption({
          name: binaryOptions.Options.PAGINATION,
          value: binaryOptions.Values.pagination['INFINITE-SCROLL'],
          entityNames: new Set(['*']),
          excludedNames: new Set(['D']),
        });
        application.addOption(option1);
        const option2 = new JDLBinaryOption({
          name: binaryOptions.Options.DTO,
          value: binaryOptions.Values.dto.MAPSTRUCT,
          entityNames: new Set(['*']),
          excludedNames: new Set(['D']),
        });
        application.addOption(option2);
      });

      it('should return the exact number of options', () => {
        expect(application.getOptionQuantity()).to.equal(2);
      });
    });
  });
  describe('toString', () => {
    describe('when there is no entity', () => {
      let jdlApplication;

      before(() => {
        jdlApplication = new JDLApplication({ config: { jhipsterVersion: '4.9.0' } }, runtime);
      });

      it('should stringify the application object', () => {
        expect(jdlApplication.toString()).to.equal(`application {
  config {
    jhipsterVersion "4.9.0"
  }
}`);
      });
    });
    describe('when there are listed entities', () => {
      let jdlApplication;

      before(() => {
        jdlApplication = new JDLApplication({ entityNames: ['A', 'B', 'C', 'C'] }, runtime);
      });

      it('should export the entity names', () => {
        expect(jdlApplication.toString()).to.equal(
          `application {
  config {}

  entities A, B, C
}`,
        );
      });
    });
    describe('when the jhipsterVersion option is there', () => {
      describe('when it is not quoted', () => {
        let result;

        before(() => {
          const application = new JDLApplication({ config: { jhipsterVersion: '6.5.1' } }, runtime);
          result = application.toString();
        });

        it('should stringify it quoted', () => {
          expect(result).to.include('jhipsterVersion "6.5.1"');
        });
      });
      describe('when it is quoted', () => {
        let result;

        before(() => {
          const application = new JDLApplication({ config: { jhipsterVersion: '"6.5.1"' } }, runtime);
          result = application.toString();
        });

        it('should not stringify it again', () => {
          expect(result).to.include('jhipsterVersion "6.5.1"');
        });
      });
    });
    describe('when the jwtSecretKey option is there', () => {
      describe('when it is not quoted', () => {
        let result;

        before(() => {
          const application = new JDLApplication({ config: { jwtSecretKey: 'ASTUPIDLYLONGWORD=' } }, runtime);
          result = application.toString();
        });

        it('should stringify it quoted', () => {
          expect(result).to.include('jwtSecretKey "ASTUPIDLYLONGWORD="');
        });
      });
      describe('when it is quoted', () => {
        let result;

        before(() => {
          const application = new JDLApplication({ config: { jwtSecretKey: '"ASTUPIDLYLONGWORD="' } }, runtime);
          result = application.toString();
        });

        it('should not stringify it again', () => {
          expect(result).to.include('jwtSecretKey "ASTUPIDLYLONGWORD="');
        });
      });
    });
    describe('when the rememberMeKey option is there', () => {
      describe('when it is not quoted', () => {
        let result;

        before(() => {
          const application = new JDLApplication({ config: { rememberMeKey: 'ASTUPIDLYLONGWORD=' } }, runtime);
          result = application.toString();
        });

        it('should stringify it quoted', () => {
          expect(result).to.include('rememberMeKey "ASTUPIDLYLONGWORD="');
        });
      });
      describe('when it is quoted', () => {
        let result;

        before(() => {
          const application = new JDLApplication({ config: { rememberMeKey: '"ASTUPIDLYLONGWORD="' } }, runtime);
          result = application.toString();
        });

        it('should not stringify it again', () => {
          expect(result).to.include('rememberMeKey "ASTUPIDLYLONGWORD="');
        });
      });
    });
    describe('when the entitySuffix is present', () => {
      describe('without a value', () => {
        let result;

        before(() => {
          const application = new JDLApplication({ config: { entitySuffix: '' } }, runtime);
          result = application.toString();
        });

        it('should not stringify it', () => {
          expect(result).not.to.include('entitySuffix');
        });
      });
      describe('with a value', () => {
        let result;

        before(() => {
          const application = new JDLApplication({ config: { entitySuffix: 'Entity' } }, runtime);
          result = application.toString();
        });

        it('should not stringify it', () => {
          expect(result).to.include('entitySuffix Entity');
        });
      });
    });
    describe('when the dtoSuffix is present', () => {
      describe('without a value', () => {
        let result;

        before(() => {
          const application = new JDLApplication({ config: { dtoSuffix: '' } }, runtime);
          result = application.toString();
        });

        it('should not stringify it', () => {
          expect(result).not.to.include('dtoSuffix');
        });
      });
      describe('with a value', () => {
        let result;

        before(() => {
          const application = new JDLApplication({ config: { dtoSuffix: 'DTO' } }, runtime);
          result = application.toString();
        });

        it('should not stringify it', () => {
          expect(result).to.include('dtoSuffix DTO');
        });
      });
    });
    describe('when the clientThemeVariant is present', () => {
      describe('without a value', () => {
        let result;

        before(() => {
          const application = new JDLApplication({ config: { clientThemeVariant: '' } }, runtime);
          result = application.toString();
        });

        it('should not stringify it', () => {
          expect(result).not.to.include('clientThemeVariant');
        });
      });
      describe('with a value', () => {
        let result;

        before(() => {
          const application = new JDLApplication({ config: { clientThemeVariant: 'aVariant' } }, runtime);
          result = application.toString();
        });

        it('should not stringify it', () => {
          expect(result).to.include('clientThemeVariant aVariant');
        });
      });
    });
    describe('when the packageFolder option is present', () => {
      let result;

      before(() => {
        const application = new JDLApplication({ config: { packageFolder: 'whatever' } }, runtime);
        result = application.toString();
      });

      it('should not stringify it', () => {
        expect(result).not.to.include('packageFolder');
      });
    });
    describe('when there are options', () => {
      let result;

      before(() => {
        const application = new JDLApplication(
          {
            entityNames: ['A', 'B', 'C'],
          },
          runtime,
        );
        const option1 = new JDLBinaryOption({
          name: binaryOptions.Options.PAGINATION,
          value: binaryOptions.Values.pagination['INFINITE-SCROLL'],
          entityNames: new Set(['*']),
          excludedNames: new Set(['D']),
        });
        const option2 = new JDLBinaryOption({
          name: binaryOptions.Options.SERVICE,
          value: binaryOptions.Values.service.SERVICE_CLASS,
          entityNames: new Set(['A', 'B', 'C']),
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
