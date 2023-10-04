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
import { jestExpect } from 'esmocha';
import { expect } from 'chai';
import { jsonEntity as JSONEntity } from '../jhipster/index.mjs';
import { JDLSecurityType, PrivilegeActionType, RoleActionType } from '../models/jdl-security-type.js';

describe('jdl - JSONEntity', () => {
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
  "applications": [],
  "dto": undefined,
  "embedded": undefined,
  "entityTableName": undefined,
  "fields": [],
  "fluentMethods": undefined,
  "javadoc": undefined,
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
  "applications": [],
  "clientRootFolder": "oh",
  "dto": "mapstruct",
  "embedded": true,
  "entityTableName": "titi",
  "fields": [
    42,
  ],
  "fluentMethods": true,
  "javadoc": "",
  "jpaMetamodelFiltering": true,
  "microserviceName": "nope",
  "name": "Titi",
  "pagination": "pagination",
  "readOnly": true,
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

      it('should use them with secure option', () => {
        jestExpect(entity).toMatchInlineSnapshot(`
JSONEntity {
  "angularJSSuffix": "yes",
  "applications": [],
  "clientRootFolder": "oh",
  "dto": "mapstruct",
  "embedded": true,
  "entityTableName": "titi",
  "fields": [
    42,
  ],
  "fluentMethods": true,
  "javadoc": "",
  "jpaMetamodelFiltering": true,
  "microserviceName": "nope",
  "name": "Titi",
  "pagination": "pagination",
  "readOnly": true,
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
  "applications": [],
  "dto": "mapstruct",
  "embedded": undefined,
  "entityTableName": undefined,
  "fields": [],
  "fluentMethods": undefined,
  "javadoc": "A comment",
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
  describe('setSecure', () => {
    context('when adding secure on entity', () => {
      let entity;

      before(() => {
        entity = new JSONEntity({
          entityName: 'seco',
        });
      });

      it('should add none securityType', () => {
        entity.setSecure({ securityType: JDLSecurityType.None });
        expect(entity.secure).to.exist;
        expect(entity.secure.securityType).to.equal(JDLSecurityType.None);
      });

      it('should add roles securityType', () => {
        const roleDef1 = {
          role: 'test_role',
          actionList: [RoleActionType.Put, RoleActionType.Post, RoleActionType.Get, RoleActionType.Delete],
        };

        entity.setSecure({ securityType: JDLSecurityType.Roles, roles: [roleDef1], comment: 'comment' });
        expect(entity.secure.securityType).equal(JDLSecurityType.Roles);
        expect(entity.secure.comment).equal('comment');
        expect(entity.secure.roles).to.deep.equal([roleDef1]);
      });

      it('should add privileges securityType', () => {
        const privDef1 = {
          action: PrivilegeActionType.Read,
          privList: ['PRIV1_R', 'PRIV2_R'],
        };

        entity.setSecure({ securityType: JDLSecurityType.Privileges, privileges: [privDef1], comment: 'comment' });
        expect(entity.secure.securityType).equal(JDLSecurityType.Privileges);
        expect(entity.secure.comment).equal('comment');
        expect(entity.secure.privileges).to.deep.equal([privDef1]);
      });

      it('should add organizationalSecurity securityType', () => {
        const organizationalSecurityDef1 = {
          resource: 'resourceName',
        };

        entity.setSecure({
          securityType: JDLSecurityType.OrganizationalSecurity,
          organizationalSecurity: organizationalSecurityDef1,
          comment: 'comment',
        });
        expect(entity.secure.securityType).equal(JDLSecurityType.OrganizationalSecurity);
        expect(entity.secure.comment).equal('comment');
        expect(entity.secure.organizationalSecurity).to.deep.equal(organizationalSecurityDef1);
      });

      it('should add parent privileges securityType', () => {
        const parentPrivilegesDef1 = {
          parent: 'Parent',
          field: 'parentId',
        };

        entity.setSecure({ securityType: JDLSecurityType.ParentPrivileges, parentPrivileges: parentPrivilegesDef1, comment: 'comment' });
        expect(entity.secure.securityType).equal(JDLSecurityType.ParentPrivileges);
        expect(entity.secure.comment).equal('comment');
        expect(entity.secure.parentPrivileges).to.deep.equal(parentPrivilegesDef1);
      });

      it('should add relational privileges securityType', () => {
        const relPrivilegesDef1 = {
          fromEntity: 'FromEntity',
          fromField: 'FromField',
          toEntity: 'ToEntity',
          toField: 'toField',
        };

        entity.setSecure({ securityType: JDLSecurityType.RelPrivileges, relPrivileges: relPrivilegesDef1, comment: 'comment' });
        expect(entity.secure.securityType).equal(JDLSecurityType.RelPrivileges);
        expect(entity.secure.comment).equal('comment');
        expect(entity.secure.relPrivileges).to.deep.equal(relPrivilegesDef1);
      });
    });
  });
});
