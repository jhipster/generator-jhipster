/*global describe, it*/
/* eslint-disable no-console */
'use strict';

const assert = require('assert'),
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
                assert.equal(Generator.prototype.getConstraintName('entityNameLonger', 'relationshipName', 'oracle').length, 30);
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
});
