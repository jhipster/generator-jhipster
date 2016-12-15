/*global describe, it*/
/* eslint-disable no-console */
'use strict';

const assert = require('assert'),
    expectedFiles = require('./test-expected-files'),
    Generator = require('../generators/generator-base');

Generator.prototype.log = function (msg) {console.log(msg);};

describe('Generator Base', function () {
    describe('getAllSupportedLanguages', function () {
        describe('when called', function () {
            it('returns an array', function () {
                assert.notEqual(Generator.prototype.getAllSupportedLanguages().length, 0);
            });
        });
    });
    describe('isSupportedLanguage', function () {
        describe('when called with valid language', function () {
            it('returns true', function () {
                assert.equal(Generator.prototype.isSupportedLanguage('en'), true);
            });
        });
        describe('when called with invalid language', function () {
            it('returns false', function () {
                assert.equal(Generator.prototype.isSupportedLanguage('ab'), false);
            });
        });
    });
    describe('getAllSupportedLanguageOptions', function () {
        describe('when called', function () {
            it('returns an array', function () {
                assert.notEqual(Generator.prototype.getAllSupportedLanguages().length, 0);
            });
        });
    });
    describe('getTableName', function () {
        describe('when called with a value', function () {
            it('returns a table name', function () {
                assert.equal(Generator.prototype.getTableName('tableName'), 'table_name');
            });
        });
    });
    describe('getColumnName', function () {
        describe('when called with a value', function () {
            it('returns a column name', function () {
                assert.equal(Generator.prototype.getColumnName('colName'), 'col_name');
                assert.equal(Generator.prototype.getColumnName('colNName'), 'colnname');
            });
        });
    });
    describe('getPluralColumnName', function () {
        describe('when called with a value', function () {
            it('returns a plural column name', function () {
                assert.equal(Generator.prototype.getPluralColumnName('colName'), 'col_names');
            });
        });
    });
    describe('getJoinTableName', function () {
        describe('when called with a value', function () {
            it('returns a join table name', function () {
                assert.equal(Generator.prototype.getJoinTableName('entityName', 'relationshipName', 'mysql'), 'entity_name_relationship_name');
            });
        });
        describe('when called with a long name', function () {
            it('returns a proper join table name', function () {
                assert.equal(Generator.prototype.getJoinTableName('entityNameLonger', 'relationshipName', 'oracle').length, 30);
                assert.equal(Generator.prototype.getJoinTableName('entityNameLonger', 'relationshipName', 'oracle'), 'entity_name_lon_relationship_n');
            });
        });
    });
    describe('getConstraintName', function () {
        describe('when called with a value', function () {
            it('returns a constraint name', function () {
                assert.equal(Generator.prototype.getConstraintName('entityName', 'relationshipName', 'mysql'), 'fk_entity_name_relationship_name_id');
            });
        });
        describe('when called with a long name', function () {
            it('returns a proper constraint name', function () {
                assert.equal(Generator.prototype.getConstraintName('entityNameLongerName', 'relationshipName', 'oracle').length, 30);
                assert.equal(Generator.prototype.getConstraintName('entityNameLongerName', 'relationshipName', 'oracle'), 'entity_name_lo_relationship_id');
            });
        });
    });
    describe('printJHipsterLogo', function () {
        describe('when called', function () {
            it('prints the logo', function () {
                assert.equal(Generator.prototype.printJHipsterLogo(), undefined);
            });
        });
    });
    describe('checkForNewVersion', function () {
        describe('when called', function () {
            it('prints the new version info', function () {
                assert.equal(Generator.prototype.checkForNewVersion(), undefined);
            });
        });
    });
    describe('getAngularAppName', function () {
        describe('when called with name', function () {
            it('return the angular app name', function () {
                Generator.prototype.baseName = 'myTest';
                assert.equal(Generator.prototype.getAngularAppName(), 'myTestApp');
            });
        });
        describe('when called with name having App', function () {
            it('return the angular app name', function () {
                Generator.prototype.baseName = 'myApp';
                assert.equal(Generator.prototype.getAngularAppName(), 'myApp');
            });
        });
    });
    describe('getMainClassName', function () {
        describe('when called with name', function () {
            it('return the app name', function () {
                Generator.prototype.baseName = 'myTest';
                assert.equal(Generator.prototype.getMainClassName(), 'MyTestApp');
            });
        });
        describe('when called with name having App', function () {
            it('return the app name', function () {
                Generator.prototype.baseName = 'myApp';
                assert.equal(Generator.prototype.getMainClassName(), 'MyApp');
            });
        });
        describe('when called with name having invalid java chars', function () {
            it('return the default app name', function () {
                Generator.prototype.baseName = '9myApp';
                assert.equal(Generator.prototype.getMainClassName(), 'Application');
            });
        });
    });

    describe('writeFilesToDisk', function () {
        describe('when called with default angular client options', function () {
            it('should produce correct files', function () {
                let files = require('../generators/client/files-angularjs').files; // fetch angular 1 files
                let generator = {
                    useSass: false,
                    enableTranslation: true,
                    authenticationType: 'session',
                    testFrameworks: []
                };
                let filesToAssert = expectedFiles.client;
                filesToAssert = filesToAssert.concat(expectedFiles.userManagement).sort();
                let out = Generator.prototype.writeFilesToDisk(files, generator, true).sort();
                assert.deepEqual(out, filesToAssert);
            });
        });
        describe('when called with default angular client options skipping user-management', function () {
            it('should produce correct files', function () {
                let files = require('../generators/client/files-angularjs').files; // fetch angular 1 files
                let generator = {
                    useSass: false,
                    enableTranslation: true,
                    authenticationType: 'session',
                    skipUserManagement: true,
                    testFrameworks: []
                };
                let filesToAssert = expectedFiles.client.sort();
                let out = Generator.prototype.writeFilesToDisk(files, generator, true).sort();
                assert.deepEqual(out, filesToAssert);
            });
        });
    });
});
