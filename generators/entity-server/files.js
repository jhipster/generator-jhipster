/**
 * Copyright 2013-2018 the original author or authors from the JHipster project.
 *
 * This file is part of the JHipster project, see http://www.jhipster.tech/
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
const randexp = require('randexp');
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
    db: [
        {
            condition: generator => generator.databaseType === 'sql',
            path: SERVER_MAIN_RES_DIR,
            templates: [{
                file: 'config/liquibase/changelog/_added_entity.xml',
                options: { interpolate: INTERPOLATE_REGEX },
                renameTo: generator => `config/liquibase/changelog/${generator.changelogDate}_added_entity_${generator.entityClass}.xml`
            }]
        },
        {
            condition: generator => generator.databaseType === 'sql' && (generator.fieldsContainOwnerManyToMany || generator.fieldsContainOwnerOneToOne || generator.fieldsContainManyToOne),
            path: SERVER_MAIN_RES_DIR,
            templates: [{
                file: 'config/liquibase/changelog/_added_entity_constraints.xml',
                options: { interpolate: INTERPOLATE_REGEX },
                renameTo: generator => `config/liquibase/changelog/${generator.changelogDate}_added_entity_constraints_${generator.entityClass}.xml`
            }]
        },
        {
            condition: generator => generator.databaseType === 'cassandra',
            path: SERVER_MAIN_RES_DIR,
            templates: [{
                file: 'config/cql/changelog/_added_entity.cql',
                renameTo: generator => `config/cql/changelog/${generator.changelogDate}_added_entity_${generator.entityClass}.cql`
            }]
        }
    ],
    server: [
        {
            path: SERVER_MAIN_SRC_DIR,
            templates: [
                {
                    file: 'package/domain/_Entity.java',
                    renameTo: generator => `${generator.packageFolder}/domain/${generator.entityClass}.java`
                },
                {
                    file: 'package/repository/_EntityRepository.java',
                    renameTo: generator => `${generator.packageFolder}/repository/${generator.entityClass}Repository.java`
                },
                {
                    file: 'package/web/rest/_EntityResource.java',
                    renameTo: generator => `${generator.packageFolder}/web/rest/${generator.entityClass}Resource.java`
                }
            ]
        },
        {
            condition: generator => generator.jpaMetamodelFiltering,
            path: SERVER_MAIN_SRC_DIR,
            templates: [
                {
                    file: 'package/service/dto/_EntityCriteria.java',
                    renameTo: generator => `${generator.packageFolder}/service/dto/${generator.entityClass}Criteria.java`
                },
                {
                    file: 'package/service/_EntityQueryService.java',
                    renameTo: generator => `${generator.packageFolder}/service/${generator.entityClass}QueryService.java`
                },
            ]
        },
        {
            condition: generator => generator.searchEngine === 'elasticsearch',
            path: SERVER_MAIN_SRC_DIR,
            templates: [{
                file: 'package/repository/search/_EntitySearchRepository.java',
                renameTo: generator => `${generator.packageFolder}/repository/search/${generator.entityClass}SearchRepository.java`
            }]
        },
        {
            condition: generator => generator.service === 'serviceImpl',
            path: SERVER_MAIN_SRC_DIR,
            templates: [
                {
                    file: 'package/service/_EntityService.java',
                    renameTo: generator => `${generator.packageFolder}/service/${generator.entityClass}Service.java`
                },
                {
                    file: 'package/service/impl/_EntityServiceImpl.java',
                    renameTo: generator => `${generator.packageFolder}/service/impl/${generator.entityClass}ServiceImpl.java`
                }
            ]
        },
        {
            condition: generator => generator.service === 'serviceClass',
            path: SERVER_MAIN_SRC_DIR,
            templates: [{
                file: 'package/service/impl/_EntityServiceImpl.java',
                renameTo: generator => `${generator.packageFolder}/service/${generator.entityClass}Service.java`
            }]
        },
        {
            condition: generator => generator.dto === 'mapstruct',
            path: SERVER_MAIN_SRC_DIR,
            templates: [
                {
                    file: 'package/service/dto/_EntityDTO.java',
                    renameTo: generator => `${generator.packageFolder}/service/dto/${generator.entityClass}DTO.java`
                },
                {
                    file: 'package/service/mapper/_BaseEntityMapper.java',
                    renameTo: generator => `${generator.packageFolder}/service/mapper/EntityMapper.java`
                },
                {
                    file: 'package/service/mapper/_EntityMapper.java',
                    renameTo: generator => `${generator.packageFolder}/service/mapper/${generator.entityClass}Mapper.java`
                }
            ]
        }
    ],
    test: [
        {
            path: SERVER_TEST_SRC_DIR,
            templates: [{
                file: 'package/web/rest/_EntityResourceIntTest.java',
                options: {
                    context: {
                        randexp, _, chalkRed: chalk.red, fs, SERVER_TEST_SRC_DIR
                    }
                },
                renameTo: generator => `${generator.packageFolder}/web/rest/${generator.entityClass}ResourceIntTest.java`
            }]
        },
        {
            condition: generator => generator.gatlingTests,
            path: TEST_DIR,
            templates: [{
                file: 'gatling/user-files/simulations/_EntityGatlingTest.scala',
                options: { interpolate: INTERPOLATE_REGEX },
                renameTo: generator => `gatling/user-files/simulations/${generator.entityClass}GatlingTest.scala`
            }]
        }
    ]
};

module.exports = {
    writeFiles,
    serverFiles
};

function writeFiles() {
    return {
        saveRemoteEntityPath() {
            if (_.isUndefined(this.microservicePath)) {
                return;
            }
            this.copy(
                `${this.microservicePath}/${this.jhipsterConfigDirectory}/${this.entityNameCapitalized}.json`,
                this.destinationPath(`${this.jhipsterConfigDirectory}/${this.entityNameCapitalized}.json`)
            );
        },

        writeServerFiles() {
            if (this.skipServer) return;

            // write server side files
            this.writeFilesToDisk(serverFiles, this, false);

            if (this.databaseType === 'sql') {
                if (this.fieldsContainOwnerManyToMany || this.fieldsContainOwnerOneToOne || this.fieldsContainManyToOne) {
                    this.addConstraintsChangelogToLiquibase(`${this.changelogDate}_added_entity_constraints_${this.entityClass}`);
                }
                this.addChangelogToLiquibase(`${this.changelogDate}_added_entity_${this.entityClass}`);

                if (['ehcache', 'infinispan'].includes(this.cacheProvider) && this.enableHibernateCache) {
                    this.addEntityToCache(this.entityClass, this.relationships, this.packageName, this.packageFolder, this.cacheProvider);
                }
            }
        },

        writeEnumFiles() {
            this.fields.forEach((field) => {
                if (field.fieldIsEnum === true) {
                    const fieldType = field.fieldType;
                    const enumInfo = utils.buildEnumInfo(field, this.angularAppName, this.packageName);
                    if (!this.skipServer) {
                        this.template(
                            `${SERVER_MAIN_SRC_DIR}package/domain/enumeration/_Enum.java`,
                            `${SERVER_MAIN_SRC_DIR}${this.packageFolder}/domain/enumeration/${fieldType}.java`,
                            this, {}, enumInfo
                        );
                    }
                }
            });
        }
    };
}
