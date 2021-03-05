/**
 * Copyright 2013-2021 the original author or authors from the JHipster project.
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
const _ = require('lodash');
const chalk = require('chalk');
const fs = require('fs');
const utils = require('../utils');
const constants = require('../generator-constants');

/* Constants use throughout */
const INTERPOLATE_REGEX = constants.INTERPOLATE_REGEX;
const SERVER_MAIN_SRC_DIR = constants.SERVER_MAIN_SRC_DIR;
const SERVER_MAIN_RES_DIR = constants.SERVER_MAIN_RES_DIR;
const TEST_DIR = constants.TEST_DIR;
const SERVER_TEST_SRC_DIR = constants.SERVER_TEST_SRC_DIR;

/**
 * The default is to use a file path string. It implies use of the template method.
 * For any other config an object { file:.., method:.., template:.. } can be used
 */
const serverFiles = {
  dbChangelog: [
    {
      condition: generator => generator.databaseType === 'cassandra' && !generator.skipDbChangelog,
      path: SERVER_MAIN_RES_DIR,
      templates: [
        {
          file: 'config/cql/changelog/added_entity.cql',
          renameTo: generator => `config/cql/changelog/${generator.changelogDate}_added_entity_${generator.entityClass}.cql`,
        },
      ],
    },
    {
      condition: generator => generator.searchEngine === 'couchbase' && !generator.skipDbChangelog,
      path: SERVER_MAIN_RES_DIR,
      templates: [
        {
          file: 'config/couchmove/changelog/entity.fts',
          renameTo: generator => `config/couchmove/changelog/V${generator.changelogDate}__${generator.entityInstance.toLowerCase()}.fts`,
        },
      ],
    },
  ],
  server: [
    {
      path: SERVER_MAIN_SRC_DIR,
      templates: [
        {
          file: 'package/domain/Entity.java',
          renameTo: generator => `${generator.packageFolder}/domain/${generator.asEntity(generator.entityClass)}.java`,
        },
      ],
    },
    {
      condition: generator => !generator.embedded,
      path: SERVER_MAIN_SRC_DIR,
      templates: [
        {
          file: 'package/web/rest/EntityResource.java',
          renameTo: generator => `${generator.packageFolder}/web/rest/${generator.entityClass}Resource.java`,
        },
      ],
    },
    {
      condition: generator => generator.jpaMetamodelFiltering,
      path: SERVER_MAIN_SRC_DIR,
      templates: [
        {
          file: 'package/service/criteria/EntityCriteria.java',
          renameTo: generator => `${generator.packageFolder}/service/criteria/${generator.entityClass}Criteria.java`,
        },
        {
          file: 'package/service/EntityQueryService.java',
          renameTo: generator => `${generator.packageFolder}/service/${generator.entityClass}QueryService.java`,
        },
      ],
    },
    {
      condition: generator => generator.searchEngine === 'elasticsearch' && !generator.embedded,
      path: SERVER_MAIN_SRC_DIR,
      templates: [
        {
          file: 'package/repository/search/EntitySearchRepository.java',
          renameTo: generator => `${generator.packageFolder}/repository/search/${generator.entityClass}SearchRepository.java`,
        },
      ],
    },
    {
      condition: generator => !generator.reactive && !generator.embedded,
      path: SERVER_MAIN_SRC_DIR,
      templates: [
        {
          file: 'package/repository/EntityRepository.java',
          renameTo: generator => `${generator.packageFolder}/repository/${generator.entityClass}Repository.java`,
        },
      ],
    },
    {
      condition: generator => generator.reactive && !generator.embedded,
      path: SERVER_MAIN_SRC_DIR,
      templates: [
        {
          file: 'package/repository/EntityRepository_reactive.java',
          renameTo: generator => `${generator.packageFolder}/repository/${generator.entityClass}Repository.java`,
        },
      ],
    },
    {
      condition: generator => generator.reactive && generator.databaseType === 'sql' && !generator.embedded,
      path: SERVER_MAIN_SRC_DIR,
      templates: [
        {
          file: 'package/repository/EntityRepositoryInternalImpl_reactive.java',
          renameTo: generator => `${generator.packageFolder}/repository/${generator.entityClass}RepositoryInternalImpl.java`,
        },
        {
          file: 'package/repository/rowmapper/EntityRowMapper.java',
          renameTo: generator => `${generator.packageFolder}/repository/rowmapper/${generator.entityClass}RowMapper.java`,
        },
      ],
    },
    {
      condition: generator => generator.service === 'serviceImpl' && !generator.embedded,
      path: SERVER_MAIN_SRC_DIR,
      templates: [
        {
          file: 'package/service/EntityService.java',
          renameTo: generator => `${generator.packageFolder}/service/${generator.entityClass}Service.java`,
        },
        {
          file: 'package/service/impl/EntityServiceImpl.java',
          renameTo: generator => `${generator.packageFolder}/service/impl/${generator.entityClass}ServiceImpl.java`,
        },
      ],
    },
    {
      condition: generator => generator.service === 'serviceClass' && !generator.embedded,
      path: SERVER_MAIN_SRC_DIR,
      templates: [
        {
          file: 'package/service/impl/EntityServiceImpl.java',
          renameTo: generator => `${generator.packageFolder}/service/${generator.entityClass}Service.java`,
        },
      ],
    },
    {
      condition: generator => generator.dto === 'mapstruct',
      path: SERVER_MAIN_SRC_DIR,
      templates: [
        {
          file: 'package/service/dto/EntityDTO.java',
          renameTo: generator => `${generator.packageFolder}/service/dto/${generator.asDto(generator.entityClass)}.java`,
        },
        {
          file: 'package/service/mapper/BaseEntityMapper.java',
          renameTo: generator => `${generator.packageFolder}/service/mapper/EntityMapper.java`,
        },
        {
          file: 'package/service/mapper/EntityMapper.java',
          renameTo: generator => `${generator.packageFolder}/service/mapper/${generator.entityClass}Mapper.java`,
        },
      ],
    },
  ],
  test: [
    {
      condition: generator => !generator.embedded,
      path: SERVER_TEST_SRC_DIR,
      templates: [
        {
          file: 'package/web/rest/EntityResourceIT.java',
          options: {
            context: {
              _,
              chalkRed: chalk.red,
              fs,
              SERVER_TEST_SRC_DIR,
            },
          },
          renameTo: generator => `${generator.packageFolder}/web/rest/${generator.entityClass}ResourceIT.java`,
        },
      ],
    },
    {
      condition: generator => generator.searchEngine === 'elasticsearch' && !generator.embedded,
      path: SERVER_TEST_SRC_DIR,
      templates: [
        {
          file: 'package/repository/search/EntitySearchRepositoryMockConfiguration.java',
          renameTo: generator =>
            `${generator.packageFolder}/repository/search/${generator.entityClass}SearchRepositoryMockConfiguration.java`,
        },
      ],
    },
    {
      condition: generator => generator.gatlingTests,
      path: TEST_DIR,
      templates: [
        {
          file: 'gatling/user-files/simulations/EntityGatlingTest.scala',
          options: { interpolate: INTERPOLATE_REGEX },
          renameTo: generator => `gatling/user-files/simulations/${generator.entityClass}GatlingTest.scala`,
        },
      ],
    },
    {
      path: SERVER_TEST_SRC_DIR,
      templates: [
        {
          file: 'package/domain/EntityTest.java',
          renameTo: generator => `${generator.packageFolder}/domain/${generator.asEntity(generator.entityClass)}Test.java`,
        },
      ],
    },
    {
      condition: generator => generator.dto === 'mapstruct',
      path: SERVER_TEST_SRC_DIR,
      templates: [
        {
          file: 'package/service/dto/EntityDTOTest.java',
          renameTo: generator => `${generator.packageFolder}/service/dto/${generator.asDto(generator.entityClass)}Test.java`,
        },
      ],
    },
    {
      condition: generator => generator.dto === 'mapstruct' && ['sql', 'mongodb', 'couchbase', 'neo4j'].includes(generator.databaseType),
      path: SERVER_TEST_SRC_DIR,
      templates: [
        {
          file: 'package/service/mapper/EntityMapperTest.java',
          renameTo: generator => `${generator.packageFolder}/service/mapper/${generator.entityClass}MapperTest.java`,
        },
      ],
    },
  ],
};

module.exports = {
  writeFiles,
  serverFiles,
  customizeFiles,
};

function writeFiles() {
  return {
    setupReproducibility() {
      if (this.skipServer) return;

      // In order to have consistent results with Faker, restart seed with current entity name hash.
      this.resetFakerSeed();
    },

    writeServerFiles() {
      if (this.skipServer) return undefined;

      // write server side files
      if (this.reactive) {
        return this.writeFilesToDisk(serverFiles, ['reactive', '']);
      }
      return this.writeFilesToDisk(serverFiles);
    },

    writeEnumFiles() {
      this.fields.forEach(field => {
        if (!field.fieldIsEnum) {
          return;
        }
        const fieldType = field.fieldType;
        const enumInfo = {
          ...utils.getEnumInfo(field, this.clientRootFolder),
          frontendAppName: this.frontendAppName,
          packageName: this.packageName,
        };
        // eslint-disable-next-line no-console
        if (!this.skipServer) {
          const pathToTemplateFile = `${this.fetchFromInstalledJHipster(
            'entity-server/templates'
          )}/${SERVER_MAIN_SRC_DIR}package/domain/enumeration/Enum.java.ejs`;
          this.template(
            pathToTemplateFile,
            `${SERVER_MAIN_SRC_DIR}${this.packageFolder}/domain/enumeration/${fieldType}.java`,
            this,
            {},
            enumInfo
          );
        }
      });
    },
  };
}

function customizeFiles() {
  if (this.databaseType === 'sql') {
    if (['ehcache', 'caffeine', 'infinispan', 'redis'].includes(this.cacheProvider) && this.enableHibernateCache) {
      this.addEntityToCache(this.asEntity(this.entityClass), this.relationships, this.packageName, this.packageFolder, this.cacheProvider);
    }
  }
}
