/**
 * Copyright 2013-2017 the original author or authors from the JHipster project.
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

const { expect } = require('chai');
const JDLApplication = require('../../../lib/core/jdl_application');

describe('JDLApplication', () => {
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
          expect(entityNames.size()).to.equal(1);
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
          expect(entityNames.size()).to.equal(1);
        });
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
        expect(entityNames.size()).to.equal(0);
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
        expect(entityNames.size()).to.equal(2);
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
        expect(entityNames.size()).to.equal(2);
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
        expect(entityNames.size()).to.equal(2);
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
        expect(application.getEntityNames().size()).to.equal(3);
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
    context('when the blueprints option is present', () => {
      let result;

      before(() => {
        const application = new JDLApplication({ config: { blueprints: ['whatever'] } });
        result = application.toString();
      });

      it('should not stringify it', () => {
        expect(result).not.to.include('blueprints');
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
  });
});
