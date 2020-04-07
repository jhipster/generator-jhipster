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

/* eslint-disable no-new,no-unused-expressions */
const { expect } = require('chai');
const JSONEntity = require('../../../../lib/core/jhipster/json_entity');

describe('JSONEntity', () => {
  describe('new', () => {
    context('when not passing a configuration', () => {
      it('should fail', () => {
        expect(() => {
          new JSONEntity();
        }).to.throw(/^At least an entity name must be passed\.$/);
      });
    });
    context('when not passing an entity name', () => {
      it('should fail', () => {
        expect(() => {
          new JSONEntity({});
        }).to.throw(/^At least an entity name must be passed\.$/);
      });
    });
    context('when only passing an entity name', () => {
      let entity;

      before(() => {
        entity = new JSONEntity({
          entityName: 'toto'
        });
      });

      it('should set default values', () => {
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
          embedded: false,
          relationships: [],
          service: 'no',
          applications: []
        });
      });
    });
    context('when passing values', () => {
      let entity;

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
          embedded: true,
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

      it('should use them', () => {
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
          embedded: true,
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
  describe('addField', () => {
    let entity;

    before(() => {
      entity = new JSONEntity({
        entityName: 'toto'
      });
    });

    context('when not passing anything', () => {
      before(() => {
        entity.addField();
      });

      it('should do nothing', () => {
        expect(entity.fields).to.deep.equal([]);
      });
    });
    context('when passing something', () => {
      before(() => {
        entity.addField(42);
      });

      it('should add it', () => {
        expect(entity.fields).to.deep.equal([42]);
      });
    });
  });
  describe('addFields', () => {
    let entity;

    before(() => {
      entity = new JSONEntity({
        entityName: 'toto'
      });
    });

    context('when not passing anything', () => {
      before(() => {
        entity.addFields();
      });

      it('should do nothing', () => {
        expect(entity.fields).to.deep.equal([]);
      });
    });
    context('when passing something', () => {
      before(() => {
        entity.addFields([42, 43]);
      });

      it('should add it', () => {
        expect(entity.fields).to.deep.equal([42, 43]);
      });
    });
  });
  describe('addRelationship', () => {
    let entity;

    before(() => {
      entity = new JSONEntity({
        entityName: 'toto'
      });
    });

    context('when not passing anything', () => {
      before(() => {
        entity.addRelationship();
      });

      it('should do nothing', () => {
        expect(entity.relationships).to.deep.equal([]);
      });
    });
    context('when passing something', () => {
      before(() => {
        entity.addRelationship(42);
      });

      it('should add it', () => {
        expect(entity.relationships).to.deep.equal([42]);
      });
    });
  });
  describe('addRelationships', () => {
    let entity;

    before(() => {
      entity = new JSONEntity({
        entityName: 'toto'
      });
    });

    context('when not passing anything', () => {
      before(() => {
        entity.addRelationships();
      });

      it('should do nothing', () => {
        expect(entity.relationships).to.deep.equal([]);
      });
    });
    context('when passing something', () => {
      before(() => {
        entity.addRelationships([42, 43]);
      });

      it('should add it', () => {
        expect(entity.relationships).to.deep.equal([42, 43]);
      });
    });
  });
  describe('setOptions', () => {
    context('when not passing options', () => {
      let originalJSONEntity;
      let touchedJSONEntity;

      before(() => {
        originalJSONEntity = new JSONEntity({
          entityName: 'Toto'
        });
        touchedJSONEntity = new JSONEntity({
          entityName: 'Toto'
        });
        touchedJSONEntity.setOptions();
      });

      it('should not modify the object', () => {
        expect(touchedJSONEntity).to.deep.equal(originalJSONEntity);
      });
    });
    context('when passing options', () => {
      let jsonEntity;

      before(() => {
        jsonEntity = new JSONEntity({
          entityName: 'Toto',
          changelogDate: 42,
          javadoc: 'A comment'
        });
        jsonEntity.setOptions({
          dto: 'mapstruct',
          pagination: 'pagination'
        });
      });

      it('should set them', () => {
        expect(jsonEntity).to.deep.equal({
          applications: [],
          changelogDate: 42,
          clientRootFolder: '',
          dto: 'mapstruct',
          embedded: false,
          entityTableName: 'toto',
          fields: [],
          fluentMethods: true,
          javadoc: 'A comment',
          jpaMetamodelFiltering: false,
          name: 'Toto',
          pagination: 'pagination',
          readOnly: false,
          relationships: [],
          service: 'no'
        });
      });
    });
  });
});
