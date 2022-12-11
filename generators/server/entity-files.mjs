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
import _ from 'lodash';
import chalk from 'chalk';
import fs from 'fs';
import { cleanupOldFiles } from './entity-cleanup.mjs';
import utils from '../utils.cjs';
import constants from '../generator-constants.cjs';
import { databaseTypes, searchEngineTypes, entityOptions, cacheTypes } from '../../jdl/jhipster/index.mjs';

const { CASSANDRA, COUCHBASE, MONGODB, NEO4J, SQL } = databaseTypes;
const { ELASTICSEARCH } = searchEngineTypes;
const { MapperTypes, ServiceTypes } = entityOptions;
const { EHCACHE, CAFFEINE, INFINISPAN, REDIS } = cacheTypes;
const { MAPSTRUCT } = MapperTypes;
const { SERVICE_CLASS, SERVICE_IMPL } = ServiceTypes;

/* Constants use throughout */
const SERVER_MAIN_SRC_DIR = constants.SERVER_MAIN_SRC_DIR;
const SERVER_MAIN_RES_DIR = constants.SERVER_MAIN_RES_DIR;
const TEST_DIR = constants.TEST_DIR;
const SERVER_TEST_SRC_DIR = constants.SERVER_TEST_SRC_DIR;

export const cassandraChangelogFiles = {
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

export const modelFiles = {
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
export const entityFiles = {
  server: [
    {
      path: SERVER_MAIN_SRC_DIR,
      templates: [
        {
          file: 'package/domain/Entity.java.jhi.jakarta_validation',
          renameTo: generator => `${generator.entityAbsoluteFolder}/domain/${generator.persistClass}.java.jhi.jakarta_validation`,
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
          file: 'package/domain/Entity.java.jhi.jakarta_lifecycle_events',
          renameTo: generator => `${generator.entityAbsoluteFolder}/domain/${generator.persistClass}.java.jhi.jakarta_lifecycle_events`,
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
          file: 'package/domain/Entity.java.jhi.jakarta_persistence',
          renameTo: generator => `${generator.entityAbsoluteFolder}/domain/${generator.persistClass}.java.jhi.jakarta_persistence`,
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

export const restFiles = {
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

export const filteringFiles = {
  filteringFiles: [
    {
      condition: generator => generator.jpaMetamodelFiltering && !generator.reactive,
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

const filteringReactiveFiles = {
  filteringReactiveFiles: [
    {
      condition: generator => generator.jpaMetamodelFiltering && generator.reactive,
      path: SERVER_MAIN_SRC_DIR,
      templates: [
        {
          file: 'package/service/criteria/EntityCriteria.java',
          renameTo: generator => `${generator.entityAbsoluteFolder}/domain/criteria/${generator.entityClass}Criteria.java`,
        },
      ],
    },
  ],
};

export const elasticSearchFiles = {
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

export const respositoryFiles = {
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

export const serviceFiles = {
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

export const dtoFiles = {
  dtoFiles: [
    {
      condition: generator => generator.dto === MAPSTRUCT,
      path: SERVER_MAIN_SRC_DIR,
      templates: [
        {
          file: 'package/service/dto/EntityDTO.java',
          renameTo: generator => `${generator.entityAbsoluteFolder}/service/dto/${generator.dtoClass}.java`,
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
          renameTo: generator => `${generator.entityAbsoluteFolder}/service/dto/${generator.dtoClass}Test.java`,
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

export const gatlingFiles = {
  gatlingFiles: [
    {
      condition: generator => generator.gatlingTests,
      path: TEST_DIR,
      templates: [
        {
          file: 'java/gatling/simulations/EntityGatlingTest.java',
          renameTo: generator => `java/gatling/simulations/${generator.entityClass}GatlingTest.java`,
        },
      ],
    },
  ],
};

export const serverFiles = {
  ...cassandraChangelogFiles,
  ...modelFiles,
  ...entityFiles,
  ...restFiles,
  ...filteringFiles,
  ...filteringReactiveFiles,
  ...elasticSearchFiles,
  ...respositoryFiles,
  ...serviceFiles,
  ...dtoFiles,
  ...gatlingFiles,
};

export function writeFiles() {
  return {
    cleanupOldServerFiles({ application, entities }) {
      for (const entity of entities.filter(entity => !entity.skipServer)) {
        cleanupOldFiles.call(this, { application, entity });
      }
    },

    async writeServerFiles({ application, entities }) {
      for (const entity of entities.filter(entity => !entity.skipServer && !entity.builtIn)) {
        await this.writeFiles({
          sections: serverFiles,
          rootTemplatesPath: application.reactive ? ['entity/reactive', 'entity'] : 'entity',
          context: { ...application, ...entity },
        });
      }
    },

    async writeEnumFiles({ application, entities }) {
      for (const entity of entities.filter(entity => !entity.skipServer)) {
        for (const field of entity.fields.filter(field => field.fieldIsEnum)) {
          const fieldType = field.fieldType;
          const enumInfo = {
            ...utils.getEnumInfo(field, entity.clientRootFolder),
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
