'use strict';

const _ = require('lodash'),
  chalk = require('chalk');

/* Constants use throughout */
const constants = require('../generator-constants'),
    INTERPOLATE_REGEX = constants.INTERPOLATE_REGEX,
    CLIENT_TEST_SRC_DIR = constants.CLIENT_TEST_SRC_DIR,
    ANGULAR_DIR = constants.ANGULAR_DIR,
    SERVER_MAIN_SRC_DIR = constants.SERVER_MAIN_SRC_DIR,
    SERVER_MAIN_RES_DIR = constants.SERVER_MAIN_RES_DIR,
    TEST_DIR = constants.TEST_DIR,
    SERVER_TEST_SRC_DIR = constants.SERVER_TEST_SRC_DIR;

module.exports = {
    writeFiles
};

function writeFiles(){
    return {
        deleteRemoteEntityPath: function () {
            if(!this.remove) return;

            if (_.isUndefined(this.microservicePath)) {
                return;
            }

            this.fs.delete(this.destinationPath(this.jhipsterConfigDirectory + '/' + this.entityNameCapitalized + '.json'));
        },

        deleteDbFiles: function () {
            if(!this.remove) return;

            if (this.skipServer) return;

            if (this.databaseType === 'sql') {
                this.warning('Please update manually the liquibase to deal with data before drop the table');
            }
            if (this.databaseType === 'cassandra') {
                this.warning('Please update manually the cql script to deal with data before drop the column family');
            }
        },

        deleteEnumFiles: function () {
            if(!this.remove) return;

            for (var idx in this.fields) {
                var field = this.fields[idx];
                if (field.fieldIsEnum === true) {
                    var fieldType = field.fieldType;
                    if (!this.skipServer) {
                        this.fs.delete(SERVER_MAIN_SRC_DIR + this.packageFolder + '/domain/enumeration/' + fieldType + '.java');
                    }

                    // Copy for each
                    if (!this.skipClient && this.enableTranslation) {
                        var languages = this.languages || this.getAllInstalledLanguages();
                        languages.forEach(function (language) {
                            this.fs.delete(CLIENT_MAIN_SRC_DIR + 'i18n/' + language + '/' + _.lowerFirst(fieldType) + '.json');
                        }, this);
                    }

                }
            }
        },

        deleteServerFiles: function () {
            if(!this.remove) return;

            if (this.skipServer) return;

            this.fs.delete(SERVER_MAIN_SRC_DIR + this.packageFolder + '/domain/' + this.entityClass + '.java');

            this.fs.delete(SERVER_MAIN_SRC_DIR + this.packageFolder + '/repository/' + this.entityClass + 'Repository.java');

            if (this.searchEngine === 'elasticsearch') {
                this.fs.delete(SERVER_MAIN_SRC_DIR + this.packageFolder + '/repository/search/' + this.entityClass + 'SearchRepository.java');
            }

            this.fs.delete(SERVER_MAIN_SRC_DIR + this.packageFolder + '/web/rest/' + this.entityClass + 'Resource.java');
            if (this.service === 'serviceImpl') {
                this.fs.delete(SERVER_MAIN_SRC_DIR + this.packageFolder + '/service/' + this.entityClass + 'Service.java');
                this.fs.delete(SERVER_MAIN_SRC_DIR + this.packageFolder + '/service/impl/' + this.entityClass + 'ServiceImpl.java');
            } else if (this.service === 'serviceClass') {
                this.fs.delete(SERVER_MAIN_SRC_DIR + this.packageFolder + '/service/' + this.entityClass + 'Service.java');
            }
            if (this.dto === 'mapstruct') {
                this.fs.delete(SERVER_MAIN_SRC_DIR + this.packageFolder + '/service/dto/' + this.entityClass + 'DTO.java');

                this.fs.delete(SERVER_MAIN_SRC_DIR + this.packageFolder + '/service/mapper/' + this.entityClass + 'Mapper.java');
            }
            if (this.databaseType === 'sql' && this.hibernateCache === 'ehcache') {
                this.removeEntityFromEhcache(this.entityClass, this.relationships);
            }
        },

        deleteClientFiles: function () {
            if(!this.remove) return;

            if (this.skipClient) {
                return;
            }

            this.fs.delete(ANGULAR_DIR + 'entities/' + this.entityFolderName + '/' + this.entityPluralFileName + '.html');
            this.fs.delete(ANGULAR_DIR + 'entities/' + this.entityFolderName + '/' + this.entityFileName + '-detail.html');
            this.fs.delete(ANGULAR_DIR + 'entities/' + this.entityFolderName + '/' + this.entityFileName + '-dialog.html');
            this.fs.delete(ANGULAR_DIR + 'entities/' + this.entityFolderName + '/' + this.entityFileName + '-delete-dialog.html');

            this.removeEntityFromMenu(this.entityStateName, this.enableTranslation);

            this.fs.delete(ANGULAR_DIR + 'entities/' + this.entityFolderName + '/' + this.entityFileName + '.state.js');
            this.fs.delete(ANGULAR_DIR + 'entities/' + this.entityFolderName + '/' + this.entityFileName + '.controller' + '.js');
            this.fs.delete(ANGULAR_DIR + 'entities/' + this.entityFolderName + '/' + this.entityFileName + '-dialog.controller' + '.js');
            this.fs.delete(ANGULAR_DIR + 'entities/' + this.entityFolderName + '/' + this.entityFileName + '-delete-dialog.controller' + '.js');
            this.fs.delete(ANGULAR_DIR + 'entities/' + this.entityFolderName + '/' + this.entityFileName + '-detail.controller' + '.js');
            this.fs.delete(ANGULAR_DIR + 'entities/' + this.entityFolderName + '/' + this.entityServiceFileName + '.service' + '.js');
            if (this.searchEngine === 'elasticsearch') {
                this.fs.delete(ANGULAR_DIR + 'entities/' + this.entityFolderName + '/' + this.entityServiceFileName + '.search.service' + '.js');
            }

            // Copy for each
            if (this.enableTranslation) {
                var languages = this.languages || this.getAllInstalledLanguages();
                languages.forEach(function (language) {
                    this.deleteI18n(language);
                }, this);
            }
        },

        deleteClientTestFiles: function () {
            if(!this.remove) return;

            if (this.skipClient) return;

            this.fs.delete(CLIENT_TEST_SRC_DIR + 'spec/app/entities/' + this.entityFolderName + '/' + this.entityFileName + '-detail.controller.spec.js');
            // Create Protractor test files
            if (this.testFrameworks.indexOf('protractor') !== -1) {
                this.fs.delete(CLIENT_TEST_SRC_DIR + 'e2e/entities/' + this.entityFileName + '.js');
            }
        },

        deleteTestFiles: function () {
            if (this.skipServer) return;

            this.fs.delete(SERVER_TEST_SRC_DIR + this.packageFolder + '/web/rest/' + this.entityClass + 'ResourceIntTest.java');

            if (this.testFrameworks.indexOf('gatling') !== -1) {
                this.fs.delete(TEST_DIR + 'gatling/simulations/' + this.entityClass + 'GatlingTest.scala');
            }
        },

        saveRemoteEntityPath: function() {
            if(this.remove) return;

            if (_.isUndefined(this.microservicePath)) {
                return;
            }

            this.copy(this.microservicePath + '/' + this.jhipsterConfigDirectory + '/' + this.entityNameCapitalized + '.json', this.destinationPath(this.jhipsterConfigDirectory + '/' + this.entityNameCapitalized + '.json'));
        },

        writeDbFiles: function() {
            if(this.remove) return;
            if (this.skipServer) return;

            if (this.databaseType === 'sql') {
                this.template(SERVER_MAIN_RES_DIR + 'config/liquibase/changelog/_added_entity.xml',
                    SERVER_MAIN_RES_DIR + 'config/liquibase/changelog/' + this.changelogDate + '_added_entity_' + this.entityClass + '.xml', this, {'interpolate': INTERPOLATE_REGEX});

                if (this.fieldsContainOwnerManyToMany || this.fieldsContainOwnerOneToOne || this.fieldsContainManyToOne) {
                    this.template(SERVER_MAIN_RES_DIR + 'config/liquibase/changelog/_added_entity_constraints.xml',
                        SERVER_MAIN_RES_DIR + 'config/liquibase/changelog/' + this.changelogDate + '_added_entity_constraints_' + this.entityClass + '.xml', this, {'interpolate': INTERPOLATE_REGEX});
                    this.addConstraintsChangelogToLiquibase(this.changelogDate + '_added_entity_constraints_' + this.entityClass);
                }

                this.addChangelogToLiquibase(this.changelogDate + '_added_entity_' + this.entityClass);
            }
            if (this.databaseType === 'cassandra') {
                this.template(SERVER_MAIN_RES_DIR + 'config/cql/changelog/_added_entity.cql',
                    SERVER_MAIN_RES_DIR + 'config/cql/changelog/' + this.changelogDate + '_added_entity_' + this.entityClass + '.cql', this, {});
            }
        },

        writeEnumFiles: function() {
            if(this.remove) return;
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
                        this.template(SERVER_MAIN_SRC_DIR + 'package/domain/enumeration/_Enum.java',
                            SERVER_MAIN_SRC_DIR + this.packageFolder + '/domain/enumeration/' + fieldType + '.java', enumInfo, {});
                    }

                    // Copy for each
                    if (!this.skipClient && this.enableTranslation) {
                        var languages = this.languages || this.getAllInstalledLanguages();
                        languages.forEach(function (language) {
                            this.copyEnumI18n(language, enumInfo);
                        }, this);
                    }

                }
            }
        },

        writeServerFiles: function() {
            if(this.remove) return;
            if (this.skipServer) return;

            this.template(SERVER_MAIN_SRC_DIR + 'package/domain/_Entity.java',
                SERVER_MAIN_SRC_DIR + this.packageFolder + '/domain/' + this.entityClass + '.java', this, {});

            this.template(SERVER_MAIN_SRC_DIR + 'package/repository/_EntityRepository.java',
                SERVER_MAIN_SRC_DIR + this.packageFolder + '/repository/' + this.entityClass + 'Repository.java', this, {});

            if (this.searchEngine === 'elasticsearch') {
                this.template(SERVER_MAIN_SRC_DIR + 'package/repository/search/_EntitySearchRepository.java',
                    SERVER_MAIN_SRC_DIR + this.packageFolder + '/repository/search/' + this.entityClass + 'SearchRepository.java', this, {});
            }

            this.template(SERVER_MAIN_SRC_DIR + 'package/web/rest/_EntityResource.java',
                SERVER_MAIN_SRC_DIR + this.packageFolder + '/web/rest/' + this.entityClass + 'Resource.java', this, {});
            if (this.service === 'serviceImpl') {
                this.template(SERVER_MAIN_SRC_DIR + 'package/service/_EntityService.java',
                    SERVER_MAIN_SRC_DIR + this.packageFolder + '/service/' + this.entityClass + 'Service.java', this, {});
                this.template(SERVER_MAIN_SRC_DIR + 'package/service/impl/_EntityServiceImpl.java',
                    SERVER_MAIN_SRC_DIR + this.packageFolder + '/service/impl/' + this.entityClass + 'ServiceImpl.java', this, {});
            } else if (this.service === 'serviceClass') {
                this.template(SERVER_MAIN_SRC_DIR + 'package/service/impl/_EntityServiceImpl.java',
                    SERVER_MAIN_SRC_DIR + this.packageFolder + '/service/' + this.entityClass + 'Service.java', this, {});
            }
            if (this.dto === 'mapstruct') {
                this.template(SERVER_MAIN_SRC_DIR + 'package/service/dto/_EntityDTO.java',
                    SERVER_MAIN_SRC_DIR + this.packageFolder + '/service/dto/' + this.entityClass + 'DTO.java', this, {});

                this.template(SERVER_MAIN_SRC_DIR + 'package/service/mapper/_EntityMapper.java',
                    SERVER_MAIN_SRC_DIR + this.packageFolder + '/service/mapper/' + this.entityClass + 'Mapper.java', this, {});
            }
            if (this.databaseType === 'sql' && this.hibernateCache === 'ehcache') {
                this.addEntityToEhcache(this.entityClass, this.relationships);
            }
        },

        writeClientFiles: function () {
            if(this.remove) return;
            if (this.skipClient) {
                return;
            }

            this.copyHtml(ANGULAR_DIR + 'entities/_entity-management.html', ANGULAR_DIR + 'entities/' + this.entityFolderName + '/' + this.entityPluralFileName + '.html', this, {}, true);
            this.copyHtml(ANGULAR_DIR + 'entities/_entity-management-detail.html', ANGULAR_DIR + 'entities/' + this.entityFolderName + '/' + this.entityFileName + '-detail.html', this, {}, true);
            this.copyHtml(ANGULAR_DIR + 'entities/_entity-management-dialog.html', ANGULAR_DIR + 'entities/' + this.entityFolderName + '/' + this.entityFileName + '-dialog.html', this, {}, true);
            this.copyHtml(ANGULAR_DIR + 'entities/_entity-management-delete-dialog.html', ANGULAR_DIR + 'entities/' + this.entityFolderName + '/' + this.entityFileName + '-delete-dialog.html', this, {}, true);

            this.addEntityToMenu(this.entityStateName, this.enableTranslation);

            this.template(ANGULAR_DIR + 'entities/_entity-management.state.js', ANGULAR_DIR + 'entities/' + this.entityFolderName + '/' + this.entityFileName + '.state.js', this, {});
            this.template(ANGULAR_DIR + 'entities/_entity-management.controller.js', ANGULAR_DIR + 'entities/' + this.entityFolderName + '/' + this.entityFileName + '.controller' + '.js', this, {});
            this.template(ANGULAR_DIR + 'entities/_entity-management-dialog.controller.js', ANGULAR_DIR + 'entities/' + this.entityFolderName + '/' + this.entityFileName + '-dialog.controller' + '.js', this, {});
            this.template(ANGULAR_DIR + 'entities/_entity-management-delete-dialog.controller.js', ANGULAR_DIR + 'entities/' + this.entityFolderName + '/' + this.entityFileName + '-delete-dialog.controller' + '.js', this, {});
            this.template(ANGULAR_DIR + 'entities/_entity-management-detail.controller.js', ANGULAR_DIR + 'entities/' + this.entityFolderName + '/' + this.entityFileName + '-detail.controller' + '.js', this, {});
            this.template(ANGULAR_DIR + 'entities/_entity.service.js', ANGULAR_DIR + 'entities/' + this.entityFolderName + '/' + this.entityServiceFileName + '.service' + '.js', this, {});
            if (this.searchEngine === 'elasticsearch') {
                this.template(ANGULAR_DIR + 'entities/_entity-search.service.js', ANGULAR_DIR + 'entities/' + this.entityFolderName + '/' + this.entityServiceFileName + '.search.service' + '.js', this, {});
            }

            // Copy for each
            if (this.enableTranslation) {
                var languages = this.languages || this.getAllInstalledLanguages();
                languages.forEach(function (language) {
                    this.copyI18n(language);
                }, this);
            }
        },

        writeClientTestFiles: function () {
            if(this.remove) return;
            if (this.skipClient) return;

            this.template(CLIENT_TEST_SRC_DIR + 'spec/app/entities/_entity-management-detail.controller.spec.js',
                CLIENT_TEST_SRC_DIR + 'spec/app/entities/' + this.entityFolderName + '/' + this.entityFileName + '-detail.controller.spec.js', this, {});
            // Create Protractor test files
            if (this.testFrameworks.indexOf('protractor') !== -1) {
                this.template(CLIENT_TEST_SRC_DIR + 'e2e/entities/_entity.js', CLIENT_TEST_SRC_DIR + 'e2e/entities/' + this.entityFileName + '.js', this, {});
            }
        },

        writeTestFiles: function() {
            if(this.remove) return;
            if (this.skipServer) return;

            this.template(SERVER_TEST_SRC_DIR + 'package/web/rest/_EntityResourceIntTest.java',
                    SERVER_TEST_SRC_DIR + this.packageFolder + '/web/rest/' + this.entityClass + 'ResourceIntTest.java', this, {});

            if (this.testFrameworks.indexOf('gatling') !== -1) {
                this.template(TEST_DIR + 'gatling/simulations/_EntityGatlingTest.scala',
                    TEST_DIR + 'gatling/simulations/' + this.entityClass + 'GatlingTest.scala', this, {'interpolate': INTERPOLATE_REGEX});
            }
        }
    };
}
