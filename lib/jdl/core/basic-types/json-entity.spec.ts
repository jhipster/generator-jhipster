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
import JSONEntity from './json-entity.js';

describe('jdl - JSONEntity', () => {
  describe('new', () => {
    describe('when not passing a configuration', () => {
      it('should fail', () => {
        expect(() => {
          // @ts-expect-error
          new JSONEntity();
        }).to.throw(/^At least an entity name must be passed\.$/);
      });
    });
    describe('when not passing an entity name', () => {
      it('should fail', () => {
        expect(() => {
          new JSONEntity({});
        }).to.throw(/^At least an entity name must be passed\.$/);
      });
    });
    describe('when only passing an entity name', () => {
      let entity;

      before(() => {
        entity = new JSONEntity({
          entityName: 'toto',
        });
      });

      it('should set default values', () => {
        jestExpect(entity).toMatchInlineSnapshot(`
JSONEntity {
  "annotations": {},
  "applications": [],
  "documentation": undefined,
  "dto": undefined,
  "embedded": undefined,
  "entityTableName": undefined,
  "fields": [],
  "fluentMethods": undefined,
  "jpaMetamodelFiltering": undefined,
  "name": "Toto",
  "pagination": undefined,
  "readOnly": undefined,
  "relationships": [],
  "service": undefined,
}
`);
      });
    });
    describe('when passing values', () => {
      let entity;

      before(() => {
        entity = new JSONEntity({
          entityName: 'Titi',
          dto: 'mapstruct',
          entityTableName: 'titi',
          fields: [42],
          fluentMethods: true,
          documentation: '',
          jpaMetamodelFiltering: true,
          pagination: 'pagination',
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
  "annotations": {},
  "applications": [],
  "clientRootFolder": "oh",
  "documentation": "",
  "dto": "mapstruct",
  "embedded": true,
  "entityTableName": "titi",
  "fields": [
    42,
  ],
  "fluentMethods": true,
  "jpaMetamodelFiltering": true,
  "microserviceName": "nope",
  "name": "Titi",
  "pagination": "pagination",
  "readOnly": undefined,
  "relationships": [
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

    describe('when not passing anything', () => {
      before(() => {
        entity.addField();
      });

      it('should do nothing', () => {
        expect(entity.fields).to.deep.equal([]);
      });
    });
    describe('when passing something', () => {
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

    describe('when not passing anything', () => {
      before(() => {
        entity.addFields();
      });

      it('should do nothing', () => {
        expect(entity.fields).to.deep.equal([]);
      });
    });
    describe('when passing something', () => {
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

    describe('when not passing anything', () => {
      before(() => {
        entity.addRelationship();
      });

      it('should do nothing', () => {
        expect(entity.relationships).to.deep.equal([]);
      });
    });
    describe('when passing something', () => {
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

    describe('when not passing anything', () => {
      before(() => {
        entity.addRelationships();
      });

      it('should do nothing', () => {
        expect(entity.relationships).to.deep.equal([]);
      });
    });
    describe('when passing something', () => {
      before(() => {
        entity.addRelationships([42, 43]);
      });

      it('should add it', () => {
        expect(entity.relationships).to.deep.equal([42, 43]);
      });
    });
  });
  describe('setOptions', () => {
    describe('when not passing options', () => {
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
    describe('when passing options', () => {
      let jsonEntity;

      before(() => {
        jsonEntity = new JSONEntity({
          entityName: 'Toto',
          documentation: 'A comment',
        });
        jsonEntity.setOptions({
          dto: 'mapstruct',
          pagination: 'pagination',
        });
      });

      it('should set them', () => {
        jestExpect(jsonEntity).toMatchInlineSnapshot(`
JSONEntity {
  "annotations": {},
  "applications": [],
  "documentation": "A comment",
  "dto": "mapstruct",
  "embedded": undefined,
  "entityTableName": undefined,
  "fields": [],
  "fluentMethods": undefined,
  "jpaMetamodelFiltering": undefined,
  "name": "Toto",
  "pagination": "pagination",
  "readOnly": undefined,
  "relationships": [],
  "service": undefined,
}
`);
      });
    });
  });
});
