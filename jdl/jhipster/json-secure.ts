import { JDLSecurityType, PrivilegeActionType, RoleActionType } from '../models/jdl-security-type.js';
import { IJDLSecure } from '../models/jdl-secure.js';

interface IJSONRoleSecurity {
  role: string;
  actionList: RoleActionType[];
}

interface IJSONPrivilegeSecurity {
  action: PrivilegeActionType;
  privList: string[];
}

interface IJSONOrganizationalSecurity {
  resource: string;
}

interface IJSONParentPrivileges {
  parent: string;
  field: string;
}

interface IJSONRelPrivileges {
  fromEntity: string;
  fromField: string;
  toEntity: string;
  toField: string;
}

export interface IJSONSecure {
  securityType: JDLSecurityType;
  roles?: IJSONRoleSecurity[];
  privileges?: IJSONPrivilegeSecurity[];
  organizationalSecurity?: IJSONOrganizationalSecurity;
  parentPrivileges?: IJSONParentPrivileges;
  relPrivileges?: IJSONRelPrivileges;
  comment?: string;
}
export class JSONSecure implements IJSONSecure {
  securityType: JDLSecurityType = JDLSecurityType.None;
  roles?: IJSONRoleSecurity[];
  privileges?: IJSONPrivilegeSecurity[];
  organizationalSecurity?: IJSONOrganizationalSecurity;
  parentPrivileges?: IJSONParentPrivileges;
  relPrivileges?: IJSONRelPrivileges;
  comment?: string;

  /**
   * Constructor for creating a secure definition.
   * Throws an error if no arguments are provided or if the security type is missing.
   *
   * @param {IJSONSecure} args - The arguments containing the security type.
   * @throws {Error} If no arguments are provided or if the security type is missing.
   */
  constructor(args: IJSONSecure) {
    if (!args) {
      throw new Error('No arguments provided.');
    }
    if (!args.securityType) {
      throw new Error('The security type is mandatory to create a secure definition.');
    }
    this.addConfig(args);
  }

  /**
   * Update the configuration with the provided JSON Secure object.
   *
   * @param {IJSONSecure} config - The JSON Secure object containing the configuration to be added.
   * @returns {void}
   */
  public addConfig(config: IJSONSecure): void {
    this.securityType = config.securityType;
    this.comment = config.comment;
    switch (config.securityType) {
      case JDLSecurityType.Roles:
        this.roles = config.roles ? [...config.roles] : [];
        break;
      case JDLSecurityType.Privileges:
        this.privileges = config.privileges ? [...config.privileges] : [];
        break;
      case JDLSecurityType.OrganizationalSecurity:
        this.organizationalSecurity = config.organizationalSecurity;
        break;
      case JDLSecurityType.ParentPrivileges:
        this.parentPrivileges = config.parentPrivileges;
        break;
      case JDLSecurityType.RelPrivileges:
        this.relPrivileges = config.relPrivileges;
        break;
      default:
        this.securityType = JDLSecurityType.None;
    }
    this.removeUndefinedproperties();
  }

  /**
   * Adds configuration from a JDL Secure object.
   *
   * @param {IJDLSecure} config - The JDL Secure object containing the configuration to add.
   * @return {void}
   */
  public addConfigFromJDLSecure(config: IJDLSecure): void {
    this.securityType = config.securityType;
    this.comment = config.comment;
    switch (config.securityType) {
      case JDLSecurityType.Roles:
        this.roles = config.roles ? [...config.roles] : [];
        break;
      case JDLSecurityType.Privileges:
        this.privileges = config.privileges ? [...config.privileges] : [];
        break;
      case JDLSecurityType.OrganizationalSecurity:
        this.organizationalSecurity = config.organizationalSecurity;
        break;
      case JDLSecurityType.ParentPrivileges:
        this.parentPrivileges = config.parentPrivileges;
        break;
      case JDLSecurityType.RelPrivileges:
        this.relPrivileges = config.relPrivileges;
        break;
      default:
        this.securityType = JDLSecurityType.None;
    }
    this.removeUndefinedproperties();
  }

  public removeUndefinedproperties(): void {
    Object.keys(this).forEach(key => this[key] === undefined && delete this[key]);
  }
}

export default JSONSecure;
