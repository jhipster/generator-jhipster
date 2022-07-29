/**
 * Copyright 2013-2022 the original author or authors from the JHipster project.
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
const entityServerCleanup = require('./cleanup');
const utils = require('../utils');
const constants = require('../generator-constants');
const { CASSANDRA, COUCHBASE, MONGODB, NEO4J, SQL } = require('../../jdl/jhipster/database-types');
const { ELASTICSEARCH } = require('../../jdl/jhipster/search-engine-types');
const { MapperTypes, ServiceTypes } = require('../../jdl/jhipster/entity-options');
const { EHCACHE, CAFFEINE, INFINISPAN, REDIS } = require('../../jdl/jhipster/cache-types');
const { writeEntityCouchbaseFiles } = require('./files-couchbase');

const { MAPSTRUCT } = MapperTypes;
const { SERVICE_CLASS, SERVICE_IMPL } = ServiceTypes;

/* Constants use throughout */
const INTERPOLATE_REGEX = constants.INTERPOLATE_REGEX;
const SERVER_MAIN_SRC_DIR = constants.SERVER_MAIN_SRC_DIR;
const SERVER_MAIN_RES_DIR = constants.SERVER_MAIN_RES_DIR;
const TEST_DIR = constants.TEST_DIR;
const SERVER_TEST_SRC_DIR = constants.SERVER_TEST_SRC_DIR;

const cassandraChangelogFiles = {
  dbChangelog: [
    {
      condition: generator => generator.databaseType === CASSANDRA && !generator.skipDbChangelog,
      path: SERVER_MAIN_RES_DIR,
      templates: [
        {
          file: 'config/cql/changelog/added_entity.cql',
          renameTo: generator => `config/cql/changelog/${generator.changelogDate}_added_entity_${generator.entityClass}.cql`,
        },
      ],
    },
  ],
};

const modelFiles = {
  model: [
    {
      path: SERVER_MAIN_SRC_DIR,
      templates: [
        {
          file: 'package/domain/Entity.java.jhi',
          renameTo: generator => `${generator.entityAbsoluteFolder}/domain/${generator.persistClass}.java.jhi`,
        },
      ],
    },
  ],
  modelTestFiles: [
    {
      path: SERVER_TEST_SRC_DIR,
      templates: [
        {
          file: 'package/domain/EntityTest.java',
          renameTo: generator => `${generator.entityAbsoluteFolder}/domain/${generator.persistClass}Test.java`,
        },
      ],
    },
  ],
};

/**
 * The default is to use a file path string. It implies use of the template method.
 * For any other config an object { file:.., method:.., template:.. } can be used
 */
const entityFiles = {
  server: [
    {
      path: SERVER_MAIN_SRC_DIR,
      templates: [
        {
          file: 'package/domain/Entity.java.jhi.javax_validation',
          renameTo: generator => `${generator.entityAbsoluteFolder}/domain/${generator.persistClass}.java.jhi.javax_validation`,
        },
      ],
    },
    {
      condition: generator => generator.databaseTypeSql && generator.reactive,
      path: SERVER_MAIN_SRC_DIR,
      templates: [
        {
          file: 'package/domain/Entity.java.jhi.spring_data_reactive',
          renameTo: generator => `${generator.entityAbsoluteFolder}/domain/${generator.persistClass}.java.jhi.spring_data_reactive`,
        },
      ],
    },
    {
      condition: generator => generator.databaseTypeSql && generator.requiresPersistableImplementation,
      path: SERVER_MAIN_SRC_DIR,
      templates: [
        {
          file: 'package/domain/Entity.java.jhi.spring_data_persistable',
          renameTo: generator => `${generator.entityAbsoluteFolder}/domain/${generator.persistClass}.java.jhi.spring_data_persistable`,
        },
      ],
    },
    {
      condition: generator => generator.databaseTypeSql && generator.reactive && generator.requiresPersistableImplementation,
      path: SERVER_MAIN_SRC_DIR,
      templates: [
        {
          file: 'package/domain/EntityCallback.java',
          renameTo: generator => `${generator.entityAbsoluteFolder}/domain/${generator.persistClass}Callback.java`,
        },
      ],
    },
    {
      condition: generator => generator.databaseTypeSql && !generator.reactive && generator.requiresPersistableImplementation,
      path: SERVER_MAIN_SRC_DIR,
      templates: [
        {
          file: 'package/domain/Entity.java.jhi.javax_lifecycle_events',
          renameTo: generator => `${generator.entityAbsoluteFolder}/domain/${generator.persistClass}.java.jhi.javax_lifecycle_events`,
        },
      ],
    },
    {
      condition: generator => generator.databaseTypeCassandra,
      path: SERVER_MAIN_SRC_DIR,
      templates: [
        {
          file: 'package/domain/Entity.java.jhi.spring_data_cassandra',
          renameTo: generator => `${generator.entityAbsoluteFolder}/domain/${generator.persistClass}.java.jhi.spring_data_cassandra`,
        },
      ],
    },
    {
      condition: generator => generator.databaseTypeNeo4j,
      path: SERVER_MAIN_SRC_DIR,
      templates: [
        {
          file: 'package/domain/Entity.java.jhi.spring_data_neo4j',
          renameTo: generator => `${generator.entityAbsoluteFolder}/domain/${generator.persistClass}.java.jhi.spring_data_neo4j`,
        },
      ],
    },
    {
      condition: generator => generator.databaseTypeSql && !generator.reactive,
      path: SERVER_MAIN_SRC_DIR,
      templates: [
        {
          file: 'package/domain/Entity.java.jhi.javax_persistence',
          renameTo: generator => `${generator.entityAbsoluteFolder}/domain/${generator.persistClass}.java.jhi.javax_persistence`,
        },
      ],
    },
    {
      condition: generator => generator.databaseTypeMongodb,
      path: SERVER_MAIN_SRC_DIR,
      templates: [
        {
          file: 'package/domain/Entity.java.jhi.spring_data_mongodb',
          renameTo: generator => `${generator.entityAbsoluteFolder}/domain/${generator.persistClass}.java.jhi.spring_data_mongodb`,
        },
      ],
    },
    {
      condition: generator => generator.databaseTypeSql && !generator.reactive && generator.enableHibernateCache,
      path: SERVER_MAIN_SRC_DIR,
      templates: [
        {
          file: 'package/domain/Entity.java.jhi.hibernate_cache',
          renameTo: generator => `${generator.entityAbsoluteFolder}/domain/${generator.persistClass}.java.jhi.hibernate_cache`,
        },
      ],
    },
    {
      condition: generator => generator.searchEngineElasticsearch,
      path: SERVER_MAIN_SRC_DIR,
      templates: [
        {
          file: 'package/domain/Entity.java.jhi.elastic_search',
          renameTo: generator => `${generator.entityAbsoluteFolder}/domain/${generator.persistClass}.java.jhi.elastic_search`,
        },
      ],
    },
  ],
};

const restFiles = {
  restFiles: [
    {
      condition: generator => !generator.embedded,
      path: SERVER_MAIN_SRC_DIR,
      templates: [
        {
          file: 'package/web/rest/EntityResource.java',
          renameTo: generator => `${generator.entityAbsoluteFolder}/web/rest/${generator.entityClass}Resource.java`,
        },
      ],
    },
  ],
  restTestFiles: [
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
          renameTo: generator => `${generator.entityAbsoluteFolder}/web/rest/${generator.entityClass}ResourceIT.java`,
        },
      ],
    },
  ],
};

const filteringFiles = {
  filteringFiles: [
    {
      condition: generator => generator.jpaMetamodelFiltering,
      path: SERVER_MAIN_SRC_DIR,
      templates: [
        {
          file: 'package/service/criteria/EntityCriteria.java',
          renameTo: generator => `${generator.entityAbsoluteFolder}/service/criteria/${generator.entityClass}Criteria.java`,
        },
        {
          file: 'package/service/EntityQueryService.java',
          renameTo: generator => `${generator.entityAbsoluteFolder}/service/${generator.entityClass}QueryService.java`,
        },
      ],
    },
  ],
};

const elasticSearchFiles = {
  elasticSearchFiles: [
    {
      condition: generator => generator.searchEngine === ELASTICSEARCH && !generator.embedded,
      path: SERVER_MAIN_SRC_DIR,
      templates: [
        {
          file: 'package/repository/search/EntitySearchRepository.java',
          renameTo: generator => `${generator.entityAbsoluteFolder}/repository/search/${generator.entityClass}SearchRepository.java`,
        },
      ],
    },
  ],
};

const respositoryFiles = {
  respositoryFiles: [
    {
      condition: generator => !generator.reactive && !generator.embedded && generator.databaseType !== COUCHBASE,
      path: SERVER_MAIN_SRC_DIR,
      templates: [
        {
          file: 'package/repository/EntityRepository.java',
          renameTo: generator => `${generator.entityAbsoluteFolder}/repository/${generator.entityClass}Repository.java`,
        },
      ],
    },
    {
      condition: generator => !generator.reactive && generator.databaseTypeSql && !generator.embedded && generator.containsBagRelationships,
      path: SERVER_MAIN_SRC_DIR,
      templates: [
        {
          file: 'package/repository/EntityRepositoryWithBagRelationships.java',
          renameTo: generator => `${generator.entityAbsoluteFolder}/repository/${generator.entityClass}RepositoryWithBagRelationships.java`,
        },
        {
          file: 'package/repository/EntityRepositoryWithBagRelationshipsImpl.java',
          renameTo: generator =>
            `${generator.entityAbsoluteFolder}/repository/${generator.entityClass}RepositoryWithBagRelationshipsImpl.java`,
        },
      ],
    },
    {
      condition: generator => generator.reactive && !generator.embedded && generator.databaseType !== COUCHBASE,
      path: SERVER_MAIN_SRC_DIR,
      templates: [
        {
          file: 'package/repository/EntityRepository_reactive.java',
          renameTo: generator => `${generator.entityAbsoluteFolder}/repository/${generator.entityClass}Repository.java`,
        },
      ],
    },
    {
      condition: generator => generator.reactive && generator.databaseType === SQL && !generator.embedded,
      path: SERVER_MAIN_SRC_DIR,
      templates: [
        {
          file: 'package/repository/EntityRepositoryInternalImpl_reactive.java',
          renameTo: generator => `${generator.entityAbsoluteFolder}/repository/${generator.entityClass}RepositoryInternalImpl.java`,
        },
        {
          file: 'package/repository/EntitySqlHelper_reactive.java',
          renameTo: generator => `${generator.entityAbsoluteFolder}/repository/${generator.entityClass}SqlHelper.java`,
        },
        {
          file: 'package/repository/rowmapper/EntityRowMapper.java',
          renameTo: generator => `${generator.entityAbsoluteFolder}/repository/rowmapper/${generator.entityClass}RowMapper.java`,
        },
      ],
    },
  ],
};

const serviceFiles = {
  serviceFiles: [
    {
      condition: generator => generator.service === SERVICE_IMPL && !generator.embedded,
      path: SERVER_MAIN_SRC_DIR,
      templates: [
        {
          file: 'package/service/EntityService.java',
          renameTo: generator => `${generator.entityAbsoluteFolder}/service/${generator.entityClass}Service.java`,
        },
        {
          file: 'package/service/impl/EntityServiceImpl.java',
          renameTo: generator => `${generator.entityAbsoluteFolder}/service/impl/${generator.entityClass}ServiceImpl.java`,
        },
      ],
    },
    {
      condition: generator => generator.service === SERVICE_CLASS && !generator.embedded,
      path: SERVER_MAIN_SRC_DIR,
      templates: [
        {
          file: 'package/service/impl/EntityServiceImpl.java',
          renameTo: generator => `${generator.entityAbsoluteFolder}/service/${generator.entityClass}Service.java`,
        },
      ],
    },
  ],
};

const dtoFiles = {
  dtoFiles: [
    {
      condition: generator => generator.dto === MAPSTRUCT,
      path: SERVER_MAIN_SRC_DIR,
      templates: [
        {
          file: 'package/service/dto/EntityDTO.java',
          renameTo: generator => `${generator.entityAbsoluteFolder}/service/dto/${generator.asDto(generator.entityClass)}.java`,
        },
        {
          file: 'package/service/mapper/BaseEntityMapper.java',
          renameTo: generator => `${generator.entityAbsoluteFolder}/service/mapper/EntityMapper.java`,
        },
        {
          file: 'package/service/mapper/EntityMapper.java',
          renameTo: generator => `${generator.entityAbsoluteFolder}/service/mapper/${generator.entityClass}Mapper.java`,
        },
      ],
    },
  ],
  dtoTestFiles: [
    {
      condition: generator => generator.dto === MAPSTRUCT,
      path: SERVER_TEST_SRC_DIR,
      templates: [
        {
          file: 'package/service/dto/EntityDTOTest.java',
          renameTo: generator => `${generator.entityAbsoluteFolder}/service/dto/${generator.asDto(generator.entityClass)}Test.java`,
        },
      ],
    },
    {
      condition: generator => generator.dto === MAPSTRUCT && [SQL, MONGODB, COUCHBASE, NEO4J].includes(generator.databaseType),
      path: SERVER_TEST_SRC_DIR,
      templates: [
        {
          file: 'package/service/mapper/EntityMapperTest.java',
          renameTo: generator => `${generator.entityAbsoluteFolder}/service/mapper/${generator.entityClass}MapperTest.java`,
        },
      ],
    },
  ],
};

const gatlingFiles = {
  gatlingFiles: [
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
  ],
};

const serverFiles = {
  ...cassandraChangelogFiles,
  ...modelFiles,
  ...entityFiles,
  ...restFiles,
  ...filteringFiles,
  ...elasticSearchFiles,
  ...respositoryFiles,
  ...serviceFiles,
  ...dtoFiles,
  ...gatlingFiles,
};

module.exports = {
  writeFiles,
  serverFiles,
  customizeFiles,
};

function writeFiles() {
  return {
    setUp() {
      this.javaDir = `${this.packageFolder}/`;
      this.testDir = `${this.packageFolder}/`;
    },

    cleanupOldServerFiles() {
      entityServerCleanup.cleanupOldFiles(this, `${SERVER_MAIN_SRC_DIR}${this.javaDir}`, `${SERVER_TEST_SRC_DIR}${this.testDir}`);
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
          entityAbsolutePackage: this.entityAbsolutePackage || this.packageName,
        };
        // eslint-disable-next-line no-console
        if (!this.skipServer) {
          const pathToTemplateFile = `${this.fetchFromInstalledJHipster(
            'entity-server/templates'
          )}/${SERVER_MAIN_SRC_DIR}package/domain/enumeration/Enum.java.ejs`;
          this.template(
            pathToTemplateFile,
            `${SERVER_MAIN_SRC_DIR}${this.entityAbsoluteFolder}/domain/enumeration/${fieldType}.java`,
            this,
            {},
            enumInfo
          );
        }
      });
    },
    ...writeEntityCouchbaseFiles(),
  };
}

function customizeFiles() {
  if (this.databaseType === SQL) {
    if ([EHCACHE, CAFFEINE, INFINISPAN, REDIS].includes(this.cacheProvider) && this.enableHibernateCache) {
      this.addEntityToCache(this.entityAbsoluteClass, this.relationships, this.packageName, this.packageFolder, this.cacheProvider);
    }
  }
}
