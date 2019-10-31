/**
 * Copyright 2013-2019 the original author or authors from the JHipster project.
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

/* eslint-disable no-new */
/* eslint-disable no-unused-expressions */
const { expect } = require('chai');
const JSONEntity = require('../../../../lib/core/jhipster/json_entity');

describe('JSONEntity', () => {
  describe('::new', () => {
    context('when not passing a configuration', () => {
      it('fails', () => {
        expect(() => {
          new JSONEntity();
        }).to.throw('At least an entity name must be passed');
      });
    });
    context('when not passing an entity name', () => {
      it('fails', () => {
        expect(() => {
          new JSONEntity({});
        }).to.throw('At least an entity name must be passed');
      });
    });
    context('when only passing an entity name', () => {
      let entity = null;

      before(() => {
        entity = new JSONEntity({
          entityName: 'toto'
        });
      });

      it('sets default values', () => {
        expect(entity.changelogDate).not.to.be.undefined;
        delete entity.changelogDate;
        expect(entity).to.deep.equal({
          name: 'Toto',
          clientRootFolder: '',
          dto: 'no',
          entityTableName: 'toto',
          fields: [],
          fluentMethods: true,
          javadoc: undefined,
          jpaMetamodelFiltering: false,
          pagination: 'no',
          readOnly: false,
          relationships: [],
          service: 'no',
          applications: []
        });
      });
    });
    context('when passing values', () => {
      let entity = null;

      before(() => {
        entity = new JSONEntity({
          entityName: 'Titi',
          dto: 'mapstruct',
          entityTableName: 'titi',
          fields: [42],
          fluentMethods: true,
          javadoc: '',
          jpaMetamodelFiltering: true,
          pagination: 'pagination',
          readOnly: true,
          relationships: [42, 43],
          service: 'serviceClass',
          changelogDate: 'aaa',
          microserviceName: 'nope',
          angularJSSuffix: 'yes',
          clientRootFolder: 'oh',
          skipServer: true,
          skipClient: true,
          applications: []
        });
      });

      it('uses them', () => {
        expect(entity).to.deep.equal({
          name: 'Titi',
          dto: 'mapstruct',
          entityTableName: 'titi',
          fields: [42],
          fluentMethods: true,
          javadoc: '',
          jpaMetamodelFiltering: true,
          pagination: 'pagination',
          readOnly: true,
          relationships: [42, 43],
          service: 'serviceClass',
          changelogDate: 'aaa',
          microserviceName: 'nope',
          angularJSSuffix: 'yes',
          clientRootFolder: 'oh',
          skipServer: true,
          skipClient: true,
          applications: []
        });
      });
    });
  });
  describe('#addField', () => {
    let entity = null;

    before(() => {
      entity = new JSONEntity({
        entityName: 'toto'
      });
    });

    context('when not passing anything', () => {
      before(() => {
        entity.addField();
      });

      it('does nothing', () => {
        expect(entity.fields).to.deep.equal([]);
      });
    });
    context('when passing something', () => {
      before(() => {
        entity.addField(42);
      });

      it('adds it', () => {
        expect(entity.fields).to.deep.equal([42]);
      });
    });
  });
  describe('#addRelationship', () => {
    let entity = null;

    before(() => {
      entity = new JSONEntity({
        entityName: 'toto'
      });
    });

    context('when not passing anything', () => {
      before(() => {
        entity.addRelationship();
      });

      it('does nothing', () => {
        expect(entity.relationships).to.deep.equal([]);
      });
    });
    context('when passing something', () => {
      before(() => {
        entity.addRelationship(42);
      });

      it('adds it', () => {
        expect(entity.relationships).to.deep.equal([42]);
      });
    });
  });
});
