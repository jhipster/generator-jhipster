export enum JDLSecurityType {
  None = 'none',
  Roles = 'roles',
  Privileges = 'privileges',
  OrganizationalSecurity = 'organizationalSecurity',
  ParentPrivileges = 'parentPrivileges',
  RelPrivileges = 'relPrivileges',
  CustomSecurity = 'customSecurity',
}

export enum PrivilegeActionType {
  Read = 'read',
  Write = 'write',
  Execute = 'execute',
}

export enum RoleActionType {
  Put = 'PUT',
  Post = 'POST',
  Get = 'GET',
  Delete = 'DELETE',
}
