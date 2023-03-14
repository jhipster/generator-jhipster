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
import _ from 'lodash';
import chalk from 'chalk';
import fs from 'fs';
import { cleanupOldFiles } from './entity-cleanup.mjs';
import {
  moveToJavaEntityPackageSrcDir,
  moveToJavaEntityPackageTestDir,
  moveToJavaPackageSrcDir,
  moveToJavaPackageTestDir,
  replaceEntityFilePathVariables,
} from './support/index.mjs';
import { SERVER_MAIN_SRC_DIR, TEST_DIR, SERVER_TEST_SRC_DIR } from '../generator-constants.mjs';
import { databaseTypes, entityOptions, cacheTypes } from '../../jdl/jhipster/index.mjs';
import { getEnumInfo } from '../base-application/support/index.mjs';

const { COUCHBASE, MONGODB, NEO4J, SQL } = databaseTypes;
const { MapperTypes, ServiceTypes } = entityOptions;
const { EHCACHE, CAFFEINE, INFINISPAN, REDIS } = cacheTypes;
const { MAPSTRUCT } = MapperTypes;
const { SERVICE_CLASS, SERVICE_IMPL } = ServiceTypes;

export const modelFiles = {
  model: [
    {
      path: `${SERVER_MAIN_SRC_DIR}package/`,
      renameTo: moveToJavaEntityPackageSrcDir,
      templates: ['domain/_PersistClass_.java.jhi'],
    },
  ],
  modelTestFiles: [
    {
      path: `${SERVER_TEST_SRC_DIR}package/`,
      renameTo: moveToJavaEntityPackageTestDir,
      templates: ['domain/_PersistClass_Test.java'],
    },
  ],
};

/**
 * The default is to use a file path string. It implies use of the template method.
 * For any other config an object { file:.., method:.., template:.. } can be used
 */
export const entityFiles = {
  server: [
    {
      path: `${SERVER_MAIN_SRC_DIR}package/`,
      renameTo: moveToJavaEntityPackageSrcDir,
      templates: ['domain/_PersistClass_.java.jhi.jakarta_validation'],
    },
  ],
};

export const restFiles = {
  restFiles: [
    {
      condition: generator => !generator.embedded,
      path: `${SERVER_MAIN_SRC_DIR}package/`,
      renameTo: moveToJavaEntityPackageSrcDir,
      templates: ['web/rest/_EntityClass_Resource.java'],
    },
  ],
  restTestFiles: [
    {
      condition: generator => !generator.embedded,
      path: SERVER_TEST_SRC_DIR,
      templates: [
        {
          file: 'package/web/rest/_EntityClass_ResourceIT.java',
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
    {
      condition: generator => generator.jpaMetamodelFiltering && !generator.reactive,
      path: `${SERVER_MAIN_SRC_DIR}package/`,
      renameTo: moveToJavaEntityPackageSrcDir,
      templates: ['service/criteria/_EntityClass_Criteria.java', 'service/_EntityClass_QueryService.java'],
    },
  ],
};

const filteringReactiveFiles = {
  filteringReactiveFiles: [
    {
      condition: generator => generator.jpaMetamodelFiltering && generator.reactive,
      path: SERVER_MAIN_SRC_DIR,
      templates: [
        {
          file: 'package/service/criteria/_EntityClass_Criteria.java',
          renameTo: generator => `${generator.entityAbsoluteFolder}/domain/criteria/${generator.entityClass}Criteria.java`,
        },
      ],
    },
  ],
};

export const respositoryFiles = {
  respositoryFiles: [
    {
      condition: generator => !generator.reactive && !generator.embedded && generator.databaseType !== COUCHBASE,
      path: `${SERVER_MAIN_SRC_DIR}package/`,
      renameTo: moveToJavaEntityPackageSrcDir,
      templates: ['repository/_EntityClass_Repository.java'],
    },
    {
      condition: generator => generator.reactive && !generator.embedded && generator.databaseType !== COUCHBASE,
      path: `${SERVER_MAIN_SRC_DIR}package/`,
      renameTo: moveToJavaEntityPackageSrcDir,
      templates: ['repository/_EntityClass_Repository_reactive.java'],
    },
  ],
};

export const serviceFiles = {
  serviceFiles: [
    {
      condition: generator => generator.service === SERVICE_IMPL && !generator.embedded,
      path: `${SERVER_MAIN_SRC_DIR}package/`,
      renameTo: moveToJavaEntityPackageSrcDir,
      templates: ['service/_EntityClass_Service.java', 'service/impl/_EntityClass_ServiceImpl.java'],
    },
    {
      condition: generator => generator.service === SERVICE_CLASS && !generator.embedded,
      path: SERVER_MAIN_SRC_DIR,
      templates: [
        {
          file: 'package/service/impl/_EntityClass_ServiceImpl.java',
          renameTo: generator =>
            replaceEntityFilePathVariables(generator, `${generator.entityAbsoluteFolder}/service/_EntityClass_Service.java`),
        },
      ],
    },
  ],
};

export const dtoFiles = {
  dtoFiles: [
    {
      condition: generator => generator.dto === MAPSTRUCT,
      path: `${SERVER_MAIN_SRC_DIR}package/`,
      renameTo: moveToJavaEntityPackageSrcDir,
      templates: ['service/dto/_DtoClass_.java', 'service/mapper/EntityMapper.java', 'service/mapper/_EntityClass_Mapper.java'],
    },
  ],
  dtoTestFiles: [
    {
      condition: generator => generator.dto === MAPSTRUCT,
      path: `${SERVER_TEST_SRC_DIR}package/`,
      renameTo: moveToJavaEntityPackageTestDir,
      templates: ['service/dto/_DtoClass_Test.java'],
    },
    {
      condition: generator => generator.dto === MAPSTRUCT && [SQL, MONGODB, COUCHBASE, NEO4J].includes(generator.databaseType),
      path: `${SERVER_TEST_SRC_DIR}package/`,
      renameTo: moveToJavaEntityPackageTestDir,
      templates: ['service/mapper/_EntityClass_MapperTest.java'],
    },
  ],
};

const userFiles = {
  userFiles: [
    {
      path: `${SERVER_MAIN_SRC_DIR}package/`,
      renameTo: (data, file) => moveToJavaPackageSrcDir(data, file).replace('/User.java', `/${data.user.persistClass}.java`),
      templates: ['domain/User.java', 'repository/UserRepository.java'],
    },
    {
      condition: data => data.authenticationTypeOauth2 || data.generateUserManagement,
      path: `${SERVER_MAIN_SRC_DIR}package/`,
      renameTo: (data, file) => moveToJavaPackageSrcDir(data, file).replace('/UserDTO.java', `/${data.user.dtoClass}.java`),
      templates: ['service/dto/UserDTO.java'],
    },
    {
      condition: data => data.authenticationTypeOauth2 || data.generateUserManagement,
      path: `${SERVER_MAIN_SRC_DIR}package/`,
      renameTo: (data, file) => moveToJavaPackageSrcDir(data, file).replace('/AdminUserDTO.java', `/${data.user.adminUserDto}.java`),
      templates: ['service/dto/AdminUserDTO.java'],
    },
  ],
};

export const serverFiles = {
  ...modelFiles,
  ...entityFiles,
  ...restFiles,
  ...filteringFiles,
  ...filteringReactiveFiles,
  ...respositoryFiles,
  ...serviceFiles,
  ...dtoFiles,
};

export function writeFiles() {
  return {
    cleanupOldServerFiles({ application, entities }) {
      for (const entity of entities.filter(entity => !entity.skipServer)) {
        cleanupOldFiles.call(this, { application, entity });
      }
    },

    async writeServerFiles({ application, entities }) {
      for (const entity of entities.filter(entity => !entity.skipServer)) {
        if (entity.builtInUser) {
          await this.writeFiles({
            sections: userFiles,
            context: { ...application, ...entity },
          });
        } else if (!entity.builtIn) {
          await this.writeFiles({
            sections: serverFiles,
            rootTemplatesPath: application.reactive ? ['entity/reactive', 'entity'] : 'entity',
            context: { ...application, ...entity },
          });
        }
      }
    },

    async writeEnumFiles({ application, entities }) {
      for (const entity of entities.filter(entity => !entity.skipServer)) {
        for (const field of entity.fields.filter(field => field.fieldIsEnum)) {
          const fieldType = field.fieldType;
          const enumInfo = {
            ...getEnumInfo(field, entity.clientRootFolder),
            frontendAppName: application.frontendAppName,
            packageName: application.packageName,
            entityAbsolutePackage: entity.entityAbsolutePackage || application.packageName,
          };
          await this.writeFiles({
            templates: [
              {
                sourceFile: `${SERVER_MAIN_SRC_DIR}package/domain/enumeration/Enum.java.ejs`,
                destinationFile: `${SERVER_MAIN_SRC_DIR}${entity.entityAbsoluteFolder}/domain/enumeration/${fieldType}.java`,
              },
            ],
            rootTemplatesPath: application.reactive ? ['entity/reactive', 'entity'] : 'entity',
            context: enumInfo,
          });
        }
      }
    },
  };
}

export function customizeFiles({ application, entities }) {
  if (application.databaseType === SQL) {
    for (const entity of entities.filter(entity => !entity.skipServer && !entity.builtIn)) {
      if ([EHCACHE, CAFFEINE, INFINISPAN, REDIS].includes(application.cacheProvider) && application.enableHibernateCache) {
        this.addEntityToCache(
          entity.entityAbsoluteClass,
          entity.relationships,
          application.packageName,
          application.packageFolder,
          application.cacheProvider
        );
      }
    }
  }
}
