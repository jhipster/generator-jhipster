import { expect } from 'chai';
import { jsonSecure as JSONSecure } from '../jhipster/index.js';
import { JDLSecurityType, PrivilegeActionType, RoleActionType } from '../models/jdl-security-type.js';
import { JDLSecure } from '../models/index.js';

describe('JSONSecure', () => {
  it('should initialize with securityType None and no additional properties', () => {
    const obj = new JSONSecure({ securityType: JDLSecurityType.None });
    expect(obj.securityType).to.equal(JDLSecurityType.None);
    expect(obj.roles).to.be.undefined;
    expect(obj.privileges).to.be.undefined;
    expect(obj.organizationalSecurity).to.be.undefined;
    expect(obj.parentPrivileges).to.be.undefined;
    expect(obj.relPrivileges).to.be.undefined;
    expect(obj.comment).to.be.undefined;
  });

  it('should initialize with the provided securityType and comment', () => {
    const obj = new JSONSecure({ securityType: JDLSecurityType.Roles, comment: 'Test' });
    expect(obj.securityType).to.equal(JDLSecurityType.Roles);
    expect(obj.comment).to.equal('Test');
  });

  it('should initialize roles if securityType is Roles', () => {
    const obj = new JSONSecure({ securityType: JDLSecurityType.Roles, roles: [{ role: 'Test', actionList: [] }] });
    expect(obj.roles).to.deep.equal([{ role: 'Test', actionList: [] }]);
  });

  it('should initialize roles if securityType is Roles with actions Get and Post', () => {
    const obj = new JSONSecure({
      securityType: JDLSecurityType.Roles,
      roles: [{ role: 'Test', actionList: [RoleActionType.Get, RoleActionType.Post] }],
    });
    expect(obj.roles).to.deep.equal([{ role: 'Test', actionList: [RoleActionType.Get, RoleActionType.Post] }]);
  });

  it('should initialize organizationalSecurity if securityType is OrganizationalSecurity', () => {
    const obj = new JSONSecure({
      securityType: JDLSecurityType.OrganizationalSecurity,
      organizationalSecurity: { resource: 'TestResource' },
    });
    expect(obj.securityType).to.equal(JDLSecurityType.OrganizationalSecurity);
    expect(obj.organizationalSecurity).to.deep.equal({ resource: 'TestResource' });
  });

  it('should initialize parentPrivileges if securityType is ParentPrivileges', () => {
    const obj = new JSONSecure({
      securityType: JDLSecurityType.ParentPrivileges,
      parentPrivileges: { parent: 'TestParent', field: 'TestField' },
    });
    expect(obj.securityType).to.equal(JDLSecurityType.ParentPrivileges);
    expect(obj.parentPrivileges).to.deep.equal({ parent: 'TestParent', field: 'TestField' });
  });

  it('should initialize privileges if securityType is Privileges', () => {
    const obj = new JSONSecure({
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

    const obj = new JSONSecure({
      securityType: JDLSecurityType.RelPrivileges,
      relPrivileges: relPrivilegesDef1,
      comment: 'comment',
    });

    expect(obj.securityType).equal(JDLSecurityType.RelPrivileges);
    expect(obj.comment).equal('comment');
    expect(obj.relPrivileges).to.deep.equal(relPrivilegesDef1);
  });

  it('should initialize roles from JDLSecure if securityType is Roles with actions Get and Post', () => {
    const obj = new JSONSecure({ securityType: JDLSecurityType.None });
    const jdl = new JDLSecure({
      securityType: JDLSecurityType.Roles,
      roles: [{ role: 'Test', actionList: [RoleActionType.Get, RoleActionType.Post] }],
    });
    obj.addConfigFromJDLSecure(jdl);
    expect(obj.roles).to.deep.equal([{ role: 'Test', actionList: [RoleActionType.Get, RoleActionType.Post] }]);
  });

  it('should initialize organizationalSecurity from JDLSecure if securityType is OrganizationalSecurity', () => {
    const obj = new JSONSecure({ securityType: JDLSecurityType.None });
    const jdl = new JDLSecure({
      securityType: JDLSecurityType.OrganizationalSecurity,
      organizationalSecurity: { resource: 'TestResource' },
    });
    obj.addConfigFromJDLSecure(jdl);
    expect(obj.securityType).to.equal(JDLSecurityType.OrganizationalSecurity);
    expect(obj.organizationalSecurity).to.deep.equal({ resource: 'TestResource' });
  });

  it('should initialize parentPrivileges if securityType is ParentPrivileges', () => {
    const obj = new JSONSecure({ securityType: JDLSecurityType.None });
    const jdl = new JDLSecure({
      securityType: JDLSecurityType.ParentPrivileges,
      parentPrivileges: { parent: 'TestParent', field: 'TestField' },
    });
    obj.addConfigFromJDLSecure(jdl);
    expect(obj.securityType).to.equal(JDLSecurityType.ParentPrivileges);
    expect(obj.parentPrivileges).to.deep.equal({ parent: 'TestParent', field: 'TestField' });
  });

  it('should initialize privileges if securityType is Privileges', () => {
    const obj = new JSONSecure({ securityType: JDLSecurityType.None });
    const jdl = new JDLSecure({
      securityType: JDLSecurityType.Privileges,
      privileges: [{ action: PrivilegeActionType.Read, privList: ['Admin'] }],
    });
    obj.addConfigFromJDLSecure(jdl);
    expect(obj.securityType).to.equal(JDLSecurityType.Privileges);
    expect(obj.privileges).to.deep.equal([{ action: PrivilegeActionType.Read, privList: ['Admin'] }]);
  });

  it('should initialize relational privileges securityType', () => {
    const obj = new JSONSecure({ securityType: JDLSecurityType.None });
    const relPrivilegesDef1 = {
      fromEntity: 'FromEntity',
      fromField: 'FromField',
      toEntity: 'ToEntity',
      toField: 'toField',
    };

    const jdl = new JSONSecure({
      securityType: JDLSecurityType.RelPrivileges,
      relPrivileges: relPrivilegesDef1,
      comment: 'comment',
    });
    obj.addConfigFromJDLSecure(jdl);
    expect(obj.securityType).equal(JDLSecurityType.RelPrivileges);
    expect(obj.comment).equal('comment');
    expect(obj.relPrivileges).to.deep.equal(relPrivilegesDef1);
  });
});
