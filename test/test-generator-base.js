/* global describe, before, it*/

const assert = require('assert');
const jhiCore = require('jhipster-core');
const expectedFiles = require('./test-expected-files');
const BaseGenerator = require('../generators/generator-base').prototype;

BaseGenerator.log = (msg) => { console.log(msg); }; // eslint-disable-line no-console

describe('Generator Base', () => {
    describe('getAllSupportedLanguages', () => {
        describe('when called', () => {
            it('returns an array', () => {
                assert.notEqual(BaseGenerator.getAllSupportedLanguages().length, 0);
            });
        });
    });
    describe('isSupportedLanguage', () => {
        describe('when called with valid language', () => {
            it('returns true', () => {
                assert.equal(BaseGenerator.isSupportedLanguage('en'), true);
            });
        });
        describe('when called with invalid language', () => {
            it('returns false', () => {
                assert.equal(BaseGenerator.isSupportedLanguage('ab'), false);
            });
        });
    });
    describe('getAllSupportedLanguageOptions', () => {
        describe('when called', () => {
            it('returns an array', () => {
                assert.notEqual(BaseGenerator.getAllSupportedLanguages().length, 0);
            });
        });
    });
    describe('getExistingEntities', () => {
        describe('when entities change on-disk', () => {
            before(() => {
                const entities = {
                    Region: {
                        fluentMethods: true,
                        relationships: [],
                        fields: [
                            {
                                fieldName: 'regionName',
                                fieldType: 'String'
                            }
                        ],
                        changelogDate: '20170623093902',
                        entityTableName: 'region',
                        dto: 'mapstruct',
                        pagination: 'no',
                        service: 'serviceImpl',
                        angularJSSuffix: 'mySuffix'
                    }
                };
                jhiCore.exportToJSON(entities, true);
                BaseGenerator.getExistingEntities();
                entities.Region.fields.push(
                    { fieldName: 'regionDesc', fieldType: 'String' });
                jhiCore.exportToJSON(entities, true);
            });
            it('returns an up-to-date state', () => {
                assert.deepEqual(
                    BaseGenerator.getExistingEntities()
                        .find(it => it.name === 'Region')
                        .definition.fields[1],
                    { fieldName: 'regionDesc', fieldType: 'String' }
                );
            });
        });
    });
    describe('getTableName', () => {
        describe('when called with a value', () => {
            it('returns a table name', () => {
                assert.equal(BaseGenerator.getTableName('tableName'), 'table_name');
            });
        });
    });
    describe('getColumnName', () => {
        describe('when called with a value', () => {
            it('returns a column name', () => {
                assert.equal(BaseGenerator.getColumnName('colName'), 'col_name');
                assert.equal(BaseGenerator.getColumnName('colNName'), 'colnname');
            });
        });
    });
    describe('getPluralColumnName', () => {
        describe('when called with a value', () => {
            it('returns a plural column name', () => {
                assert.equal(BaseGenerator.getPluralColumnName('colName'), 'col_names');
            });
        });
    });
    describe('getJoinTableName', () => {
        describe('when called with a value', () => {
            it('returns a join table name', () => {
                assert.equal(BaseGenerator.getJoinTableName('entityName', 'relationshipName', 'mysql'), 'entity_name_relationship_name');
            });
        });
        describe('when called with a long name', () => {
            it('returns a proper join table name', () => {
                assert.equal(BaseGenerator.getJoinTableName('entityNameLonger', 'relationshipName', 'oracle').length, 30);
                assert.equal(BaseGenerator.getJoinTableName('entityNameLonger', 'relationshipName', 'oracle'), 'entity_name_lon_relationship_n');
            });
        });
    });
    describe('getConstraintName', () => {
        describe('when called with a value', () => {
            it('returns a constraint name', () => {
                assert.equal(BaseGenerator.getConstraintName('entityName', 'relationshipName', 'mysql'), 'fk_entity_name_relationship_name_id');
            });
        });
        describe('when called with a long name', () => {
            it('returns a proper constraint name', () => {
                assert.equal(BaseGenerator.getConstraintName('entityNameLongerName', 'relationshipName', 'oracle').length, 30);
                assert.equal(BaseGenerator.getConstraintName('entityNameLongerName', 'relationshipName', 'oracle'), 'entity_name_lo_relationship_id');
            });
        });
    });
    describe('printJHipsterLogo', () => {
        describe('when called', () => {
            it('prints the logo', () => {
                assert.equal(BaseGenerator.printJHipsterLogo(), undefined);
            });
        });
    });
    describe('checkForNewVersion', () => {
        describe('when called', () => {
            it('prints the new version info', () => {
                assert.equal(BaseGenerator.checkForNewVersion(), undefined);
            });
        });
    });
    describe('getAngularAppName', () => {
        describe('when called with name', () => {
            it('return the angular app name', () => {
                BaseGenerator.baseName = 'myTest';
                assert.equal(BaseGenerator.getAngularAppName(), 'myTestApp');
            });
        });
        describe('when called with name having App', () => {
            it('return the angular app name', () => {
                BaseGenerator.baseName = 'myApp';
                assert.equal(BaseGenerator.getAngularAppName(), 'myApp');
            });
        });
    });
    describe('getMainClassName', () => {
        describe('when called with name', () => {
            it('return the app name', () => {
                BaseGenerator.baseName = 'myTest';
                assert.equal(BaseGenerator.getMainClassName(), 'MyTestApp');
            });
        });
        describe('when called with name having App', () => {
            it('return the app name', () => {
                BaseGenerator.baseName = 'myApp';
                assert.equal(BaseGenerator.getMainClassName(), 'MyApp');
            });
        });
        describe('when called with name having invalid java chars', () => {
            it('return the default app name', () => {
                BaseGenerator.baseName = '9myApp';
                assert.equal(BaseGenerator.getMainClassName(), 'Application');
            });
        });
    });

    describe('writeFilesToDisk', () => {
        describe('when called with default angular client options', () => {
            it('should produce correct files', () => {
                const files = require('../generators/client/files-angularjs').files; // eslint-disable-line global-require
                const generator = {
                    useSass: false,
                    enableTranslation: true,
                    serviceDiscoveryType: false,
                    authenticationType: 'jwt',
                    testFrameworks: []
                };
                let filesToAssert = expectedFiles.client;
                filesToAssert = filesToAssert.concat(expectedFiles.jwtClient);
                filesToAssert = filesToAssert.concat(expectedFiles.userManagement).sort();
                const out = BaseGenerator.writeFilesToDisk(files, generator, true).sort();
                assert.deepEqual(out, filesToAssert);
            });
        });
        describe('when called with default angular client options skipping user-management', () => {
            it('should produce correct files', () => {
                const files = require('../generators/client/files-angularjs').files; // eslint-disable-line global-require
                const generator = {
                    useSass: false,
                    enableTranslation: true,
                    serviceDiscoveryType: false,
                    authenticationType: 'jwt',
                    skipUserManagement: true,
                    testFrameworks: []
                };
                let filesToAssert = expectedFiles.client;
                filesToAssert = filesToAssert.concat(expectedFiles.jwtClient);
                filesToAssert = filesToAssert.sort();
                const out = BaseGenerator.writeFilesToDisk(files, generator, true).sort();
                assert.deepEqual(out, filesToAssert);
            });
        });
    });
});
