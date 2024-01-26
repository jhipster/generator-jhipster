/**
 * Copyright 2013-2024 the original author or authors from the JHipster project.
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
import { javaMainPackageTemplatesBlock, javaTestPackageTemplatesBlock, moveToJavaPackageSrcDir } from '../java/support/index.js';
import { databaseTypes, entityOptions } from '../../jdl/jhipster/index.js';

const { COUCHBASE, MONGODB, NEO4J, SQL } = databaseTypes;
const { MapperTypes } = entityOptions;
const { MAPSTRUCT } = MapperTypes;

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

const userFiles = {
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

export const serverFiles = {
  ...dtoFiles,
};

export function writeEntityFiles() {
  return {
    async writeServerFiles({ application, entities }) {
      const rootTemplatesPath = application.reactive ? ['reactive', '', '../../java/templates/'] : ['', '../../java/templates/'];
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
    },
  };
}
