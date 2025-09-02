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
import type { MutateDataParam, MutateDataPropertiesWithRequiredProperties } from '../../lib/utils/object.ts';

import type { Application, Entity } from './types.ts';

type UserManagementProperties<Entity> = {
  skipUserManagement: boolean;
  generateAuthenticationApi: boolean;
  authenticationApiWithUserManagement: boolean;
  generateUserManagement: boolean;
  generateBuiltInUserEntity?: boolean;
  generateBuiltInAuthorityEntity: boolean;
  generateInMemoryUserCredentials?: boolean;
  user?: Entity & { adminUserDto?: string };
  userManagement?: Entity;
  authority?: Entity;
  anyEntityHasRelationshipWithUser?: boolean;
};

export const mutateUserManagementApplication = {
  __override__: false,

  skipUserManagement: data => {
    return data.applicationTypeMicroservice || data.authenticationTypeOauth2 || data.databaseType === 'no';
  },
  generateAuthenticationApi: data => Boolean(data.applicationTypeMonolith || data.applicationTypeGateway),
  authenticationApiWithUserManagement: data => Boolean(!data.authenticationTypeOauth2 && data.generateAuthenticationApi),
  generateUserManagement: data =>
    Boolean(!data.skipUserManagement && data.databaseType !== 'no' && data.authenticationApiWithUserManagement),
  generateInMemoryUserCredentials: data => Boolean(!data.generateUserManagement && data.authenticationApiWithUserManagement),

  generateBuiltInUserEntity: ({ generateUserManagement, syncUserWithIdp }) => Boolean(generateUserManagement || syncUserWithIdp),
  generateBuiltInAuthorityEntity: ({ generateBuiltInUserEntity, databaseType }) =>
    Boolean(generateBuiltInUserEntity! && databaseType !== 'cassandra'),
} as const satisfies MutateDataPropertiesWithRequiredProperties<MutateDataParam<Application<any>>, UserManagementProperties<Entity>>;

export type BaseApplicationAddedApplicationProperties<E extends Entity> = UserManagementProperties<E> & {
  readonly javaNodeBuildPaths: string[];

  clientTestDir?: string;
  clientDistDir?: string;

  entitySuffix: string;
  dtoSuffix: string;

  skipCommitHook?: boolean;
  fakerSeed?: string;

  /* @deprecated use nodePackageManager */
  clientPackageManager?: string;

  readonly blueprints?: { name: string; version: string }[];
  readonly testFrameworks?: string[];
};

export const mutateApplication = {
  ...mutateUserManagementApplication,

  javaNodeBuildPaths: () => [],
  entitySuffix: '',
  dtoSuffix: 'DTO',
} as const satisfies MutateDataPropertiesWithRequiredProperties<
  MutateDataParam<Application<any>>,
  BaseApplicationAddedApplicationProperties<Entity>
>;
