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

import { expect } from 'chai';
import { JDLSecurityType, PrivilegeActionType, RoleActionType } from './jdl-security-type.js';
import { JDLSecure } from './index.js';
import { IJDLSecure, IOrganizationalSecurity, IParentPrivileges, IPrivilegeSecurity, IRelPrivileges, IRoleSecurity } from './jdl-secure.js';

describe('JDLSecure', () => {
  it('should initialize with securityType None and no additional properties', () => {
    const obj = new JDLSecure({ securityType: JDLSecurityType.None });
    expect(obj.securityType).to.equal(JDLSecurityType.None);
    expect(obj.roles).to.be.undefined;
    expect(obj.privileges).to.be.undefined;
    expect(obj.organizationalSecurity).to.be.undefined;
    expect(obj.parentPrivileges).to.be.undefined;
    expect(obj.relPrivileges).to.be.undefined;
    expect(obj.comment).to.be.undefined;
  });

  it('should initialize with the provided securityType and comment', () => {
    const obj = new JDLSecure({ securityType: JDLSecurityType.Roles, comment: 'Test' });
    obj.addConfig({ securityType: JDLSecurityType.Roles, comment: 'Test' });
    expect(obj.securityType).to.equal(JDLSecurityType.Roles);
    expect(obj.comment).to.equal('Test');
  });

  it('should initialize roles if securityType is Roles', () => {
    const obj = new JDLSecure({ securityType: JDLSecurityType.Roles });
    obj.addConfig({ securityType: JDLSecurityType.Roles, roles: [{ role: 'Test', actionList: [] }] });
    expect(obj.roles).to.deep.equal([{ role: 'Test', actionList: [] }]);
  });

  it('should initialize roles if securityType is Roles with actions Get and Post', () => {
    const obj = new JDLSecure({
      securityType: JDLSecurityType.Roles,
      roles: [{ role: 'Test', actionList: [RoleActionType.Get, RoleActionType.Post] }],
    });
    expect(obj.roles).to.deep.equal([{ role: 'Test', actionList: [RoleActionType.Get, RoleActionType.Post] }]);
  });

  it('should initialize organizationalSecurity if securityType is OrganizationalSecurity', () => {
    const obj = new JDLSecure({
      securityType: JDLSecurityType.OrganizationalSecurity,
      organizationalSecurity: { resource: 'TestResource' },
    });
    expect(obj.securityType).to.equal(JDLSecurityType.OrganizationalSecurity);
    expect(obj.organizationalSecurity).to.deep.equal({ resource: 'TestResource' });
  });

  it('should initialize parentPrivileges if securityType is ParentPrivileges', () => {
    const obj = new JDLSecure({ securityType: JDLSecurityType.ParentPrivileges });
    obj.addConfig({
      securityType: JDLSecurityType.ParentPrivileges,
      parentPrivileges: { parent: 'TestParent', field: 'TestField' },
    });
    expect(obj.securityType).to.equal(JDLSecurityType.ParentPrivileges);
    expect(obj.parentPrivileges).to.deep.equal({ parent: 'TestParent', field: 'TestField' });
  });

  it('should initialize privileges if securityType is Privileges', () => {
    const obj = new JDLSecure({ securityType: JDLSecurityType.Privileges });
    obj.addConfig({
      securityType: JDLSecurityType.Privileges,
      privileges: [{ action: PrivilegeActionType.Read, privList: ['Admin'] }],
    });
    expect(obj.securityType).to.equal(JDLSecurityType.Privileges);
    expect(obj.privileges).to.deep.equal([{ action: PrivilegeActionType.Read, privList: ['Admin'] }]);
  });

  it('should initialize relational privileges securityType', () => {
    const relPrivilegesDef1 = {
      fromEntity: 'FromEntity',
      fromField: 'FromField',
      toEntity: 'ToEntity',
      toField: 'toField',
    };

    const obj = new JDLSecure({
      securityType: JDLSecurityType.RelPrivileges,
      relPrivileges: relPrivilegesDef1,
      comment: 'comment',
    });

    expect(obj.securityType).equal(JDLSecurityType.RelPrivileges);
    expect(obj.comment).equal('comment');
    expect(obj.relPrivileges).to.deep.equal(relPrivilegesDef1);
  });

  it('should correctly convert a configuration with JDLSecurityType.Roles to string', function () {
    const roleSec: IRoleSecurity[] = [{ role: 'ADMIN', actionList: [RoleActionType.Post, RoleActionType.Put] }];
    const config: IJDLSecure = { securityType: JDLSecurityType.Roles, roles: roleSec };
    const jdlSec = new JDLSecure(config);

    expect(jdlSec.toString()).to.equal('roles ADMIN ( POST PUT)');
  });

  it('should correctly convert a configuration with JDLSecurityType.Privileges to string', function () {
    const privSec: IPrivilegeSecurity[] = [{ action: PrivilegeActionType.Read, privList: ['privilege1', 'privilege2'] }];
    const config: IJDLSecure = { securityType: JDLSecurityType.Privileges, privileges: privSec };
    const jdlSec = new JDLSecure(config);

    expect(jdlSec.toString()).to.equal('privileges read ( privilege1 privilege2)');
  });

  it('should correctly convert a configuration with JDLSecurityType.OrganizationalSecurity to string', function () {
    const orgSec: IOrganizationalSecurity = { resource: 'resource1' };
    const config: IJDLSecure = { securityType: JDLSecurityType.OrganizationalSecurity, organizationalSecurity: orgSec };
    const jdlSec = new JDLSecure(config);

    expect(jdlSec.toString()).to.equal('organizationalSecurity resource resource1');
  });

  it('should correctly convert a configuration with JDLSecurityType.ParentPrivileges to string', function () {
    const ppSec: IParentPrivileges = { parent: 'parent1', field: 'field1' };
    const config: IJDLSecure = { securityType: JDLSecurityType.ParentPrivileges, parentPrivileges: ppSec };
    const jdlSec = new JDLSecure(config);

    expect(jdlSec.toString()).to.equal('parentPrivileges parent1 field1');
  });

  it('should correctly convert a configuration with JDLSecurityType.RelPrivileges to string', function () {
    const rpSec: IRelPrivileges = { fromEntity: 'entity1', fromField: 'field1', toEntity: 'entity2', toField: 'field2' };
    const config: IJDLSecure = { securityType: JDLSecurityType.RelPrivileges, relPrivileges: rpSec };
    const jdlSec = new JDLSecure(config);

    expect(jdlSec.toString()).to.equal('relPrivileges entity1 field1 entity2 field2');
  });
});
