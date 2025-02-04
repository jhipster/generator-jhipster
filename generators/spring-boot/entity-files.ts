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
import fs from 'fs';
import * as _ from 'lodash-es';
import chalk from 'chalk';
import { javaMainPackageTemplatesBlock, javaTestPackageTemplatesBlock, moveToJavaPackageSrcDir } from '../java/support/index.js';
import { SERVER_TEST_SRC_DIR } from '../generator-constants.js';
import { databaseTypes, entityOptions } from '../../lib/jhipster/index.js';
import { asWritingEntitiesTask } from '../base-application/support/task-type-inference.js';
import { cleanupOldFiles } from './entity-cleanup.js';

const { COUCHBASE, MONGODB, NEO4J, SQL } = databaseTypes;
const { MapperTypes } = entityOptions;
const { MAPSTRUCT } = MapperTypes;

const { ServiceTypes } = entityOptions;
const { SERVICE_CLASS, SERVICE_IMPL } = ServiceTypes;

export const restFiles = {
  restFiles: [
    {
      condition: generator => !generator.embedded && generator.entityRestLayer,
      ...javaMainPackageTemplatesBlock('_entityPackage_/'),
      templates: ['web/rest/_entityClass_Resource.java'],
    },
  ],
  restTestFiles: [
    {
      condition: generator => !generator.embedded && generator.entityRestLayer,
      path: SERVER_TEST_SRC_DIR,
      templates: [
        {
          file: '_package_/_entityPackage_/web/rest/_entityClass_ResourceIT.java',
          options: {
            context: {
              _,
              chalkRed: chalk.red,
              fs,
              SERVER_TEST_SRC_DIR,
            },
          },
          renameTo: generator => `${generator.entityAbsoluteFolder}/web/rest/${generator.entityClass}ResourceIT.java`,
        },
      ],
    },
  ],
};

export const filteringFiles = {
  filteringFiles: [
    javaMainPackageTemplatesBlock({
      condition: generator => generator.jpaMetamodelFiltering && !generator.reactive,
      relativePath: '_entityPackage_/service/',
      templates: ['criteria/_entityClass_Criteria.java', '_entityClass_QueryService.java'],
    }),
    javaTestPackageTemplatesBlock({
      condition: generator => generator.jpaMetamodelFiltering && !generator.reactive,
      relativePath: '_entityPackage_/service/',
      templates: ['criteria/_entityClass_CriteriaTest.java'],
    }),
  ],
};

const filteringReactiveFiles = {
  filteringReactiveFiles: [
    {
      condition: generator => generator.jpaMetamodelFiltering && generator.reactive,
      ...javaMainPackageTemplatesBlock('_entityPackage_/'),
      renameTo: (data, file) => moveToJavaPackageSrcDir(data, file).replace('service/', 'domain/'),
      templates: ['service/criteria/_entityClass_Criteria.java'],
    },
  ],
};

export const serviceFiles = {
  serviceFiles: [
    {
      condition: generator => generator.service === SERVICE_IMPL && !generator.embedded,
      ...javaMainPackageTemplatesBlock('_entityPackage_/'),
      templates: ['service/_entityClass_Service.java', 'service/impl/_entityClass_ServiceImpl.java'],
    },
    javaMainPackageTemplatesBlock({
      condition: generator => generator.service === SERVICE_CLASS && !generator.embedded,
      relativePath: '_entityPackage_/',
      renameTo: (_data, file) => file.replace('service/impl', 'service').replace('Impl.java', '.java'),
      templates: ['service/impl/_entityClass_ServiceImpl.java'],
    }),
  ],
};

export const dtoFiles = {
  baseDtoFiles: [
    {
      condition: generator => generator.dto === MAPSTRUCT,
      ...javaMainPackageTemplatesBlock('_entityPackage_/'),
      templates: ['service/mapper/EntityMapper.java'],
    },
  ],
  dtoFiles: [
    {
      condition: generator => generator.dto === MAPSTRUCT,
      ...javaMainPackageTemplatesBlock('_entityPackage_/'),
      templates: ['service/dto/_dtoClass_.java', 'service/mapper/_entityClass_Mapper.java'],
    },
  ],
  dtoTestFiles: [
    {
      condition: generator => generator.dto === MAPSTRUCT,
      ...javaTestPackageTemplatesBlock('_entityPackage_/'),
      templates: ['service/dto/_dtoClass_Test.java'],
    },
    {
      condition: generator => generator.dto === MAPSTRUCT && [SQL, MONGODB, COUCHBASE, NEO4J].includes(generator.databaseType),
      ...javaTestPackageTemplatesBlock('_entityPackage_/'),
      templates: ['service/mapper/_entityClass_MapperTest.java'],
    },
  ],
};

const userDtoFiles = {
  domain: [
    {
      ...javaMainPackageTemplatesBlock(),
      renameTo: (data, file) => moveToJavaPackageSrcDir(data, file).replace('/User.java', `/${data.user.persistClass}.java`),
      templates: ['domain/User.java'],
    },
  ],
  dto: [
    {
      ...javaMainPackageTemplatesBlock(),
      renameTo: (data, file) => moveToJavaPackageSrcDir(data, file).replace('/UserDTO.java', `/${data.user.dtoClass}.java`),
      templates: ['service/dto/UserDTO.java'],
    },
    {
      ...javaMainPackageTemplatesBlock(),
      renameTo: (data, file) => moveToJavaPackageSrcDir(data, file).replace('/AdminUserDTO.java', `/${data.user.adminUserDto}.java`),
      templates: ['service/dto/AdminUserDTO.java'],
    },
    {
      condition: data => data.generateBuiltInUserEntity,
      ...javaMainPackageTemplatesBlock(),
      templates: ['service/mapper/UserMapper.java'],
    },
    {
      condition: data => data.generateBuiltInUserEntity,
      ...javaTestPackageTemplatesBlock(),
      templates: ['service/mapper/UserMapperTest.java'],
    },
  ],
};

const userFiles = {
  ...userDtoFiles,
  userFiles: [
    {
      condition: data => data.generateUserManagement,
      ...javaMainPackageTemplatesBlock('_entityPackage_/'),
      templates: ['web/rest/UserResource.java'],
    },
    {
      condition: data => data.generateBuiltInUserEntity,
      ...javaMainPackageTemplatesBlock('_entityPackage_/'),
      templates: ['service/UserService.java', 'repository/UserRepository.java', 'web/rest/PublicUserResource.java'],
    },
    {
      condition: data => data.generateBuiltInUserEntity,
      ...javaTestPackageTemplatesBlock('_entityPackage_/'),
      templates: ['service/UserServiceIT.java', 'web/rest/UserResourceIT.java', 'web/rest/PublicUserResourceIT.java'],
    },
  ],
};

export const serverFiles = {
  ...restFiles,
  ...filteringFiles,
  ...filteringReactiveFiles,
  ...serviceFiles,
  ...dtoFiles,
};

export function writeFiles() {
  return {
    cleanupOldServerFiles: asWritingEntitiesTask(function ({ application, entities }) {
      for (const entity of entities.filter(entity => !entity.skipServer)) {
        cleanupOldFiles.call(this, { application, entity });
      }
    }),

    writeServerFiles: asWritingEntitiesTask(async function ({ application, entities }) {
      const rootTemplatesPath = application.reactive
        ? ['reactive', '', '../../server/templates/', '../../java/generators/domain/templates/']
        : ['', '../../server/templates/', '../../java/generators/domain/templates/'];
      for (const entity of entities.filter(entity => !entity.skipServer)) {
        if (entity.builtInUser) {
          await this.writeFiles({
            sections: userFiles,
            rootTemplatesPath,
            context: { ...application, ...entity },
          });
        } else {
          await this.writeFiles({
            sections: serverFiles,
            rootTemplatesPath,
            context: { ...application, ...entity },
          });
        }
      }
    }),
  };
}
