/**
 * Copyright 2013-2020 the original author or authors from the JHipster project.
 *
 * This file is part of the JHipster project, see https://www.jhipster.tech/
 * for more information.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *      http://www.apache.org/licenses/LICENSE-2.0
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
                    renameTo: generator =>
                        `config/couchmove/changelog/V${generator.changelogDate}__${generator.entityInstance.toLowerCase()}.fts`,
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
                    renameTo: generator => `${generator.entityBaseName}.java`,
                },
            ],
        },
        {
            condition: generator => !generator.embedded,
            path: SERVER_MAIN_SRC_DIR,
            templates: [
                {
                    file: 'package/web/rest/EntityResource.java',
                    renameTo: generator => `${generator.entityControllerBaseName}.java`,
                },
            ],
        },
        {
            condition: generator => generator.jpaMetamodelFiltering,
            path: SERVER_MAIN_SRC_DIR,
            templates: [
                {
                    file: 'package/service/dto/EntityCriteria.java',
                    renameTo: generator => `${generator.domainServiceFolder}/dto/${generator.entityClass}Criteria.java`,
                },
                {
                    file: 'package/service/EntityQueryService.java',
                    renameTo: generator => `${generator.domainServiceFolder}/${generator.entityClass}QueryService.java`,
                },
            ],
        },
        {
            condition: generator => generator.searchEngine === 'elasticsearch',
            path: SERVER_MAIN_SRC_DIR,
            templates: [
                {
                    file: 'package/repository/search/EntitySearchRepository.java',
                    renameTo: generator => `${generator.domainRepositoryFolder}/search/${generator.entityClass}SearchRepository.java`,
                },
            ],
        },
        {
            condition: generator => !generator.reactive && !generator.embedded,
            path: SERVER_MAIN_SRC_DIR,
            templates: [
                {
                    file: 'package/repository/EntityRepository.java',
                    renameTo: generator => `${generator.entityRepositoryBaseName}.java`,
                },
            ],
        },
        {
            condition: generator => generator.reactive && !generator.embedded,
            path: SERVER_MAIN_SRC_DIR,
            templates: [
                {
                    file: 'package/repository/EntityReactiveRepository.java',
                    renameTo: generator => `${generator.entityRepositoryBaseName}.java`,
                },
            ],
        },
        {
            condition: generator => generator.reactive && generator.databaseType === 'sql' && !generator.embedded,
            path: SERVER_MAIN_SRC_DIR,
            templates: [
                {
                    file: 'package/repository/EntityReactiveRepositoryInternalImpl.java',
                    renameTo: generator => `${generator.entityRepositoryBaseName}InternalImpl.java`,
                },
                {
                    file: 'package/repository/rowmapper/EntityRowMapper.java',
                    renameTo: generator => `${generator.domainRepositoryFolder}/rowmapper/${generator.entityClass}RowMapper.java`,
                },
            ],
        },
        {
            condition: generator => generator.service === 'serviceImpl' && !generator.embedded,
            path: SERVER_MAIN_SRC_DIR,
            templates: [
                {
                    file: 'package/service/EntityService.java',
                    renameTo: generator => `${generator.entityServiceBaseName}.java`,
                },
                {
                    file: 'package/service/impl/EntityServiceImpl.java',
                    renameTo: generator => `${generator.entityServiceImplBaseName}.java`,
                },
            ],
        },
        {
            condition: generator => generator.service === 'serviceClass' && !generator.embedded,
            path: SERVER_MAIN_SRC_DIR,
            templates: [
                {
                    file: 'package/service/impl/EntityServiceImpl.java',
                    renameTo: generator => `${generator.entityServiceBaseName}.java`,
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
                    renameTo: generator => `${generator.entityControllerBaseName}IT.java`,
                },
            ],
        },
        {
            condition: generator => generator.searchEngine === 'elasticsearch',
            path: SERVER_TEST_SRC_DIR,
            templates: [
                {
                    file: 'package/repository/search/EntitySearchRepositoryMockConfiguration.java',
                    renameTo: generator =>
                        `${generator.domainRepositoryFolder}/search/${generator.entityClass}SearchRepositoryMockConfiguration.java`,
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
                    renameTo: generator => `${generator.entityBaseName}Test.java`,
                },
            ],
        },
    ],
};

const dtoFiles = {
    dto: [
        {
            path: SERVER_MAIN_SRC_DIR,
            templates: [
                {
                    file: 'package/service/dto/EntityDTO.java',
                    renameTo: generator => `${generator.entityServiceDtoBaseName}.java`,
                },
                {
                    file: 'package/service/mapper/BaseEntityMapper.java',
                    renameTo: generator => `${generator.domainServiceFolder}/mapper/EntityMapper.java`,
                },
                {
                    file: 'package/service/mapper/EntityMapper.java',
                    renameTo: generator => `${generator.domainServiceFolder}/mapper/${generator.entityClass}Mapper.java`,
                },
            ],
        },
        {
            path: SERVER_TEST_SRC_DIR,
            templates: [
                {
                    file: 'package/service/dto/EntityDTOTest.java',
                    renameTo: generator => `${generator.entityServiceDtoBaseName}Test.java`,
                },
            ],
        },
        {
            condition: generator => ['sql', 'mongodb', 'couchbase', 'neo4j'].includes(generator.databaseType),
            path: SERVER_TEST_SRC_DIR,
            templates: [
                {
                    file: 'package/service/mapper/EntityMapperTest.java',
                    renameTo: generator => `${generator.domainServiceFolder}/mapper/${generator.entityClass}MapperTest.java`,
                },
            ],
        },
    ],
};

const domainFiles = {
    domainConfig: [
        {
            path: SERVER_MAIN_SRC_DIR,
            templates: [
                {
                    file: 'package/config/DomainConfiguration.java',
                    renameTo: generator => `${generator.domainRepositoryFolder}/${generator.domainName}DomainConfiguration.java`,
                },
            ],
        },
    ],
};

module.exports = {
    writeFiles,
    serverFiles,
    dtoFiles,
    domainFiles,
};

function writeFiles() {
    return {
        setupReproducibility() {
            if (this.skipServer) return;

            // In order to have consistent results with Faker, restart seed with current entity name hash.
            this.resetFakerSeed();
        },

        writeServerFiles() {
            if (this.skipServer) return;

            // write server side files
            this.writeFilesToDisk(serverFiles, this, false, this.fetchFromInstalledJHipster('entity-server/templates'));

            // write dto files for the domain service
            if (this.dto === 'mapstruct') {
                this.writeFilesToDisk(dtoFiles, this, false, this.fetchFromInstalledJHipster('entity-server/templates'));
            }
            // write domain files.
            if (this.domainName) {
                this.writeFilesToDisk(domainFiles, this, false, this.fetchFromInstalledJHipster('entity-server/templates'));
            }

            if (this.databaseType === 'sql') {
                if (['ehcache', 'caffeine', 'infinispan', 'redis'].includes(this.cacheProvider) && this.enableHibernateCache) {
                    const entityClassNameGetter = `${this.entityClassPath}.class.getName()`;
                    this.addEntryToCache(entityClassNameGetter, this.packageFolder, this.cacheProvider);
                    this.relationships.forEach(relationship => {
                        if (relationship.relationshipType === 'one-to-many' || relationship.relationshipType === 'many-to-many') {
                            this.addEntryToCache(
                                `${entityClassNameGetter} + ".${relationship.relationshipFieldNamePlural}"`,
                                this.packageFolder,
                                this.cacheProvider
                            );
                        }
                    });
                }
            }
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
                        `${SERVER_MAIN_SRC_DIR}${this.domainModelFolder}/enumeration/${fieldType}.java`,
                        this,
                        {},
                        {
                            ...enumInfo,
                            domainModelPackageName: this.domainModelPackageName,
                        }
                    );
                }
            });
        },
    };
}
