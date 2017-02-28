'use strict';

const _ = require('lodash'),
    randexp = require('randexp'),
    chalk = require('chalk'),
    fs = require('fs');

/* Constants use throughout */
const constants = require('../generator-constants'),
    INTERPOLATE_REGEX = constants.INTERPOLATE_REGEX,
    CLIENT_TEST_SRC_DIR = constants.CLIENT_TEST_SRC_DIR,
    ANGULAR_DIR = constants.ANGULAR_DIR,
    SERVER_MAIN_SRC_DIR = constants.SERVER_MAIN_SRC_DIR,
    SERVER_MAIN_RES_DIR = constants.SERVER_MAIN_RES_DIR,
    TEST_DIR = constants.TEST_DIR,
    SERVER_TEST_SRC_DIR = constants.SERVER_TEST_SRC_DIR,

    SERVER_TEMPLATES_DIR = 'server',
    CLIENT_NG1_TEMPLATES_DIR = 'client/angularjs',
    CLIENT_NG2_TEMPLATES_DIR = 'client/angular',
    CLIENT_I18N_TEMPLATES_DIR = 'client';

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
                file: 'config/liquibase/changelog/_added_entity.xml', options: { interpolate : INTERPOLATE_REGEX },
                renameTo: generator => `config/liquibase/changelog/${generator.changelogDate}_added_entity_${generator.entityClass}.xml`
            }]
        },
        {
            condition: generator => generator.databaseType === 'sql' && (generator.fieldsContainOwnerManyToMany || generator.fieldsContainOwnerOneToOne || generator.fieldsContainManyToOne),
            path: SERVER_MAIN_RES_DIR,
            templates: [{
                file: 'config/liquibase/changelog/_added_entity_constraints.xml', options: { interpolate : INTERPOLATE_REGEX },
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
                options: {'context': {'randexp': randexp, '_': _, 'chalkRed': chalk.red, 'fs': fs, 'SERVER_TEST_SRC_DIR': SERVER_TEST_SRC_DIR}},
                renameTo: generator => `${generator.packageFolder}/web/rest/${generator.entityClass}ResourceIntTest.java`
            }]
        },
        {
            condition: generator => generator.gatlingTests,
            path: TEST_DIR,
            templates: [{
                file: 'gatling/simulations/_EntityGatlingTest.scala', options: { interpolate : INTERPOLATE_REGEX },
                renameTo: generator => `gatling/simulations/${generator.entityClass}GatlingTest.scala`
            }]
        }
    ]
};

const angularjsFiles = {
    client: [
        {
            path: ANGULAR_DIR,
            templates: [
                {
                    file: 'entities/_entity-management.html', method: 'processHtml', template: true,
                    renameTo: generator => `entities/${generator.entityFolderName}/${generator.entityPluralFileName}.html`
                },
                {
                    file: 'entities/_entity-management-detail.html', method: 'processHtml', template: true,
                    renameTo: generator => `entities/${generator.entityFolderName}/${generator.entityFileName}-detail.html`
                },
                {
                    file: 'entities/_entity-management-dialog.html', method: 'processHtml', template: true,
                    renameTo: generator => `entities/${generator.entityFolderName}/${generator.entityFileName}-dialog.html`
                },
                {
                    file: 'entities/_entity-management-delete-dialog.html', method: 'processHtml', template: true,
                    renameTo: generator => `entities/${generator.entityFolderName}/${generator.entityFileName}-delete-dialog.html`
                },
                {
                    file: 'entities/_entity-management.state.js',
                    renameTo: generator => `entities/${generator.entityFolderName}/${generator.entityFileName}.state.js`
                },
                {
                    file: 'entities/_entity-management.controller.js',
                    renameTo: generator => `entities/${generator.entityFolderName}/${generator.entityFileName}.controller.js`
                },
                {
                    file: 'entities/_entity-management-dialog.controller.js',
                    renameTo: generator => `entities/${generator.entityFolderName}/${generator.entityFileName}-dialog.controller.js`
                },
                {
                    file: 'entities/_entity-management-delete-dialog.controller.js',
                    renameTo: generator => `entities/${generator.entityFolderName}/${generator.entityFileName}-delete-dialog.controller.js`
                },
                {
                    file: 'entities/_entity-management-detail.controller.js',
                    renameTo: generator => `entities/${generator.entityFolderName}/${generator.entityFileName}-detail.controller.js`
                },
                {
                    file: 'entities/_entity.service.js',
                    renameTo: generator => `entities/${generator.entityFolderName}/${generator.entityServiceFileName}.service.js`
                }

            ]
        },
        {
            condition: generator => generator.searchEngine === 'elasticsearch',
            path: ANGULAR_DIR,
            templates: [{
                file: 'entities/_entity-search.service.js',
                renameTo: generator => `entities/${generator.entityFolderName}/${generator.entityServiceFileName}.search.service.js`
            }]
        }
    ],
    test: [
        {
            path: CLIENT_TEST_SRC_DIR,
            templates: [{
                file: 'spec/app/entities/_entity-management-detail.controller.spec.js',
                renameTo: generator => `spec/app/entities/${generator.entityFolderName}/${generator.entityFileName}-detail.controller.spec.js`
            }]
        },
        {
            condition: generator => generator.protractorTests,
            path: CLIENT_TEST_SRC_DIR,
            templates: [{
                file: 'e2e/entities/_entity.js',
                renameTo: generator => `e2e/entities/${generator.entityFileName}.js`
            }]
        }
    ]
};

const angularFiles = {
    client: [
        {
            path: ANGULAR_DIR,
            templates: [
                {
                    file: 'entities/_entity-management.component.html', method: 'processHtml', template: true,
                    renameTo: generator => `entities/${generator.entityFolderName}/${generator.entityFileName}.component.html`
                },
                {
                    file: 'entities/_entity-management-detail.component.html', method: 'processHtml', template: true,
                    renameTo: generator => `entities/${generator.entityFolderName}/${generator.entityFileName}-detail.component.html`
                },
                {
                    file: 'entities/_entity-management-dialog.component.html', method: 'processHtml', template: true,
                    renameTo: generator => `entities/${generator.entityFolderName}/${generator.entityFileName}-dialog.component.html`
                },
                {
                    file: 'entities/_entity-management-delete-dialog.component.html', method: 'processHtml', template: true,
                    renameTo: generator => `entities/${generator.entityFolderName}/${generator.entityFileName}-delete-dialog.component.html`
                },
                {
                    file: 'entities/_index.ts',
                    renameTo: generator => `entities/${generator.entityFolderName}/index.ts`
                },
                {
                    file: 'entities/_entity-management.module.ts',
                    renameTo: generator => `entities/${generator.entityFolderName}/${generator.entityFileName}.module.ts`
                },
                {
                    file: 'entities/_entity-management.route.ts',
                    renameTo: generator => `entities/${generator.entityFolderName}/${generator.entityFileName}.route.ts`
                },
                {
                    file: 'entities/_entity.model.ts',
                    renameTo: generator => `entities/${generator.entityFolderName}/${generator.entityFileName}.model.ts`
                },
                {
                    file: 'entities/_entity-management.component.ts',
                    renameTo: generator => `entities/${generator.entityFolderName}/${generator.entityFileName}.component.ts`
                },
                {
                    file: 'entities/_entity-management-dialog.component.ts',
                    renameTo: generator => `entities/${generator.entityFolderName}/${generator.entityFileName}-dialog.component.ts`
                },
                {
                    file: 'entities/_entity-management-delete-dialog.component.ts',
                    renameTo: generator => `entities/${generator.entityFolderName}/${generator.entityFileName}-delete-dialog.component.ts`
                },
                {
                    file: 'entities/_entity-management-detail.component.ts',
                    renameTo: generator => `entities/${generator.entityFolderName}/${generator.entityFileName}-detail.component.ts`
                },
                {
                    file: 'entities/_entity.service.ts',
                    renameTo: generator => `entities/${generator.entityFolderName}/${generator.entityServiceFileName}.service.ts`
                },
                {
                    file: 'entities/_entity-popup.service.ts',
                    renameTo: generator => `entities/${generator.entityFolderName}/${generator.entityServiceFileName}-popup.service.ts`
                }

            ]
        }
    ],
    test: [
        {
            path: CLIENT_TEST_SRC_DIR,
            templates: [{
                file: 'spec/app/entities/_entity-management-detail.component.spec.ts',
                renameTo: generator => `spec/app/entities/${generator.entityFolderName}/${generator.entityFileName}-detail.component.spec.ts`
            }]
        },
        {
            condition: generator => generator.protractorTests,
            path: CLIENT_TEST_SRC_DIR,
            templates: [{
                file: 'e2e/entities/_entity.spec.ts',
                renameTo: generator => `e2e/entities/${generator.entityFileName}.spec.ts`
            }]
        }
    ]
};

module.exports = {
    writeFiles,
    serverFiles,
    angularjsFiles,
    angularFiles
};

function writeFiles() {
    return {
        saveRemoteEntityPath: function() {
            if (_.isUndefined(this.microservicePath)) {
                return;
            }
            this.copy(this.microservicePath + '/' + this.jhipsterConfigDirectory + '/' + this.entityNameCapitalized + '.json', this.destinationPath(this.jhipsterConfigDirectory + '/' + this.entityNameCapitalized + '.json'));
        },

        writeServerFiles: function() {
            if (this.skipServer) return;

            // write server side files
            this.writeFilesToDisk(serverFiles, this, false, SERVER_TEMPLATES_DIR);

            if (this.databaseType === 'sql') {
                if (this.fieldsContainOwnerManyToMany || this.fieldsContainOwnerOneToOne || this.fieldsContainManyToOne) {
                    this.addConstraintsChangelogToLiquibase(this.changelogDate + '_added_entity_constraints_' + this.entityClass);
                }
                this.addChangelogToLiquibase(this.changelogDate + '_added_entity_' + this.entityClass);

                if (this.hibernateCache === 'ehcache') {
                    this.addEntityToEhcache(this.entityClass, this.relationships);
                }
            }
        },

        writeEnumFiles: function() {
            for (var idx in this.fields) {
                var field = this.fields[idx];
                if (field.fieldIsEnum === true) {
                    var fieldType = field.fieldType;
                    var enumInfo = new Object();
                    enumInfo.packageName = this.packageName;
                    enumInfo.enumName = fieldType;
                    enumInfo.enumValues = field.fieldValues;
                    field.enumInstance = _.lowerFirst(enumInfo.enumName);
                    enumInfo.enumInstance = field.enumInstance;
                    enumInfo.angularAppName = this.angularAppName;
                    enumInfo.enums = enumInfo.enumValues.replace(/\s/g, '').split(',');
                    if (!this.skipServer) {
                        this.template(
                            `${SERVER_TEMPLATES_DIR}/${SERVER_MAIN_SRC_DIR}package/domain/enumeration/_Enum.java`,
                            `${SERVER_MAIN_SRC_DIR}${this.packageFolder}/domain/enumeration/${fieldType}.java`, enumInfo, {}
                        );
                    }

                    // Copy for each
                    if (!this.skipClient && this.enableTranslation) {
                        var languages = this.languages || this.getAllInstalledLanguages();
                        languages.forEach(function (language) {
                            this.copyEnumI18n(language, enumInfo, CLIENT_I18N_TEMPLATES_DIR);
                        }, this);
                    }

                }
            }
        },

        writeClientFiles: function () {
            if (this.skipClient) return;

            if (this.clientFramework === 'angular1') {
                // write client side files for angular 1.x
                this.writeFilesToDisk(angularjsFiles, this, false, CLIENT_NG1_TEMPLATES_DIR);
            } else {
                // write client side files for angular 2.x +
                this.writeFilesToDisk(angularFiles, this, false, CLIENT_NG2_TEMPLATES_DIR);
                this.addEntityToModule(this.entityInstance, this.entityClass, this.entityAngularName, this.entityFolderName, this.entityFileName, this.enableTranslation, this.clientFramework);
            }

            this.addEntityToMenu(this.entityStateName, this.enableTranslation, this.clientFramework);

            // Copy for each
            if (this.enableTranslation) {
                var languages = this.languages || this.getAllInstalledLanguages();
                languages.forEach(function (language) {
                    this.copyI18n(language, CLIENT_I18N_TEMPLATES_DIR);
                }, this);
            }
        }
    };
}
