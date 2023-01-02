/**
 * Copyright 2013-2023 the original author or authors from the JHipster project.
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

/* eslint-disable no-new,no-unused-expressions */
import { jestExpect } from 'mocha-expect-snapshot';
import { expect } from 'chai';
import { jsonEntity as JSONEntity } from '../../../jdl/jhipster/index.mjs';

describe('JSONEntity', () => {
  describe('new', () => {
    context('when not passing a configuration', () => {
      it('should fail', () => {
        expect(() => {
          // @ts-expect-error
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
          entityName: 'toto',
        });
      });

      it('should set default values', () => {
        jestExpect(entity).toMatchInlineSnapshot(`
JSONEntity {
  "applications": Array [],
  "dto": "no",
  "embedded": false,
  "entityTableName": "toto",
  "fields": Array [],
  "fluentMethods": true,
  "javadoc": undefined,
  "jpaMetamodelFiltering": false,
  "name": "Toto",
  "pagination": "no",
  "readOnly": false,
  "relationships": Array [],
  "service": "no",
}
`);
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
          microserviceName: 'nope',
          angularJSSuffix: 'yes',
          clientRootFolder: 'oh',
          skipServer: true,
          skipClient: true,
          applications: [],
        });
      });

      it('should use them', () => {
        jestExpect(entity).toMatchInlineSnapshot(`
JSONEntity {
  "angularJSSuffix": "yes",
  "applications": Array [],
  "clientRootFolder": "oh",
  "dto": "mapstruct",
  "embedded": true,
  "entityTableName": "titi",
  "fields": Array [
    42,
  ],
  "fluentMethods": true,
  "javadoc": "",
  "jpaMetamodelFiltering": true,
  "microserviceName": "nope",
  "name": "Titi",
  "pagination": "pagination",
  "readOnly": true,
  "relationships": Array [
    42,
    43,
  ],
  "service": "serviceClass",
  "skipClient": true,
  "skipServer": true,
}
`);
      });
    });
  });
  describe('addField', () => {
    let entity;

    before(() => {
      entity = new JSONEntity({
        entityName: 'toto',
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
        entityName: 'toto',
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
        entityName: 'toto',
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
        entityName: 'toto',
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
          entityName: 'Toto',
        });
        touchedJSONEntity = new JSONEntity({
          entityName: 'Toto',
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
          javadoc: 'A comment',
        });
        jsonEntity.setOptions({
          dto: 'mapstruct',
          pagination: 'pagination',
        });
      });

      it('should set them', () => {
        jestExpect(jsonEntity).toMatchInlineSnapshot(`
JSONEntity {
  "applications": Array [],
  "dto": "mapstruct",
  "embedded": false,
  "entityTableName": "toto",
  "fields": Array [],
  "fluentMethods": true,
  "javadoc": "A comment",
  "jpaMetamodelFiltering": false,
  "name": "Toto",
  "pagination": "pagination",
  "readOnly": false,
  "relationships": Array [],
  "service": "no",
}
`);
      });
    });
  });
});
