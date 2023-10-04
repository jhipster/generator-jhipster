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

import { JDLSecurityType, PrivilegeActionType, RoleActionType } from './jdl-security-type.js';

export interface IRoleSecurity {
  role: string;
  actionList: RoleActionType[];
}

export interface IPrivilegeSecurity {
  action: PrivilegeActionType;
  privList: string[];
}

export interface IOrganizationalSecurity {
  resource: string;
}

export interface IParentPrivileges {
  parent: string;
  field: string;
}

export interface IRelPrivileges {
  fromEntity: string;
  fromField: string;
  toEntity: string;
  toField: string;
}

export interface IJDLSecure {
  securityType: JDLSecurityType;
  roles?: IRoleSecurity[];
  privileges?: IPrivilegeSecurity[];
  organizationalSecurity?: IOrganizationalSecurity;
  parentPrivileges?: IParentPrivileges;
  relPrivileges?: IRelPrivileges;
  comment?: string;
}
export default class JDLSecure implements IJDLSecure {
  securityType: JDLSecurityType = JDLSecurityType.None;
  roles?: IRoleSecurity[];
  privileges?: IPrivilegeSecurity[];
  organizationalSecurity?: IOrganizationalSecurity;
  parentPrivileges?: IParentPrivileges;
  relPrivileges?: IRelPrivileges;
  comment?: string;

  constructor(args: IJDLSecure) {
    if (!args) {
      throw new Error('A secure definition must at least contain a security type.');
    }
    if (!args.securityType) {
      throw new Error('The security type is mandatory to create a secure definition.');
    }
    this.addConfig(args);
  }

  public addConfig(config: IJDLSecure) {
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

  public toString(): string {
    let string = '';
    if (this.comment) {
      string += `/**\n${this.comment
        .split('\n')
        .map(line => ` * ${line}\n`)
        .join('')} */\n`;
    }
    string += `${this.securityType}`;
    if (this.securityType === JDLSecurityType.Roles) {
      this.roles?.forEach(item => {
        string += ` ${item.role} (`;
        item.actionList.forEach(action => {
          string += ` ${action}`;
        });
        string += ')';
      });
    } else if (this.securityType === JDLSecurityType.Privileges) {
      this.privileges?.forEach(item => {
        string += ` ${item.action} (`;
        item.privList.forEach(priv => {
          string += ` ${priv}`;
        });
        string += ')';
      });
    } else if (this.securityType === JDLSecurityType.OrganizationalSecurity && this.organizationalSecurity) {
      string += ` resource ${this.organizationalSecurity.resource}`;
    } else if (this.securityType === JDLSecurityType.ParentPrivileges && this.parentPrivileges) {
      string += ` ${this.parentPrivileges.parent} ${this.parentPrivileges.field}`;
    } else if (this.securityType === JDLSecurityType.RelPrivileges && this.relPrivileges) {
      string += ` ${this.relPrivileges.fromEntity} ${this.relPrivileges.fromField} ${this.relPrivileges.toEntity} ${this.relPrivileges.toField}`;
    }
    return string;
  }

  public removeUndefinedproperties(): void {
    Object.keys(this).forEach(key => this[key] === undefined && delete this[key]);
  }
}
