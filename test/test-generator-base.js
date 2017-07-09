/* global describe, before, it*/

const assert = require('assert');
const jhiCore = require('jhipster-core');
const expectedFiles = require('./test-expected-files');
const BaseGenerator = require('../generators/generator-base');

BaseGenerator.prototype.log = (msg) => { console.log(msg); }; // eslint-disable-line no-console

describe('Generator Base', () => {
    describe('getAllSupportedLanguages', () => {
        describe('when called', () => {
            it('returns an array', () => {
                assert.notEqual(BaseGenerator.prototype.getAllSupportedLanguages().length, 0);
            });
        });
    });
    describe('isSupportedLanguage', () => {
        describe('when called with valid language', () => {
            it('returns true', () => {
                assert.equal(BaseGenerator.prototype.isSupportedLanguage('en'), true);
            });
        });
        describe('when called with invalid language', () => {
            it('returns false', () => {
                assert.equal(BaseGenerator.prototype.isSupportedLanguage('ab'), false);
            });
        });
    });
    describe('getAllSupportedLanguageOptions', () => {
        describe('when called', () => {
            it('returns an array', () => {
                assert.notEqual(BaseGenerator.prototype.getAllSupportedLanguages().length, 0);
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
                BaseGenerator.prototype.getExistingEntities();
                entities.Region.fields.push(
                    { fieldName: 'regionDesc', fieldType: 'String' });
                jhiCore.exportToJSON(entities, true);
            });
            it('returns an up-to-date state', () => {
                assert.deepEqual(
                    BaseGenerator.prototype.getExistingEntities()
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
                assert.equal(BaseGenerator.prototype.getTableName('tableName'), 'table_name');
            });
        });
    });
    describe('getColumnName', () => {
        describe('when called with a value', () => {
            it('returns a column name', () => {
                assert.equal(BaseGenerator.prototype.getColumnName('colName'), 'col_name');
                assert.equal(BaseGenerator.prototype.getColumnName('colNName'), 'colnname');
            });
        });
    });
    describe('getPluralColumnName', () => {
        describe('when called with a value', () => {
            it('returns a plural column name', () => {
                assert.equal(BaseGenerator.prototype.getPluralColumnName('colName'), 'col_names');
            });
        });
    });
    describe('getJoinTableName', () => {
        describe('when called with a value', () => {
            it('returns a join table name', () => {
                assert.equal(BaseGenerator.prototype.getJoinTableName('entityName', 'relationshipName', 'mysql'), 'entity_name_relationship_name');
            });
        });
        describe('when called with a long name', () => {
            it('returns a proper join table name', () => {
                assert.equal(BaseGenerator.prototype.getJoinTableName('entityNameLonger', 'relationshipName', 'oracle').length, 30);
                assert.equal(BaseGenerator.prototype.getJoinTableName('entityNameLonger', 'relationshipName', 'oracle'), 'entity_name_lon_relationship_n');
            });
        });
    });
    describe('getConstraintName', () => {
        describe('when called with a value', () => {
            it('returns a constraint name', () => {
                assert.equal(BaseGenerator.prototype.getConstraintName('entityName', 'relationshipName', 'mysql'), 'fk_entity_name_relationship_name_id');
            });
        });
        describe('when called with a long name', () => {
            it('returns a proper constraint name', () => {
                assert.equal(BaseGenerator.prototype.getConstraintName('entityNameLongerName', 'relationshipName', 'oracle').length, 30);
                assert.equal(BaseGenerator.prototype.getConstraintName('entityNameLongerName', 'relationshipName', 'oracle'), 'entity_name_lo_relationship_id');
            });
        });
    });
    describe('printJHipsterLogo', () => {
        describe('when called', () => {
            it('prints the logo', () => {
                assert.equal(BaseGenerator.prototype.printJHipsterLogo(), undefined);
            });
        });
    });
    describe('checkForNewVersion', () => {
        describe('when called', () => {
            it('prints the new version info', () => {
                assert.equal(BaseGenerator.prototype.checkForNewVersion(), undefined);
            });
        });
    });
    describe('getAngularAppName', () => {
        describe('when called with name', () => {
            it('return the angular app name', () => {
                BaseGenerator.prototype.baseName = 'myTest';
                assert.equal(BaseGenerator.prototype.getAngularAppName(), 'myTestApp');
            });
        });
        describe('when called with name having App', () => {
            it('return the angular app name', () => {
                BaseGenerator.prototype.baseName = 'myApp';
                assert.equal(BaseGenerator.prototype.getAngularAppName(), 'myApp');
            });
        });
    });
    describe('getMainClassName', () => {
        describe('when called with name', () => {
            it('return the app name', () => {
                BaseGenerator.prototype.baseName = 'myTest';
                assert.equal(BaseGenerator.prototype.getMainClassName(), 'MyTestApp');
            });
        });
        describe('when called with name having App', () => {
            it('return the app name', () => {
                BaseGenerator.prototype.baseName = 'myApp';
                assert.equal(BaseGenerator.prototype.getMainClassName(), 'MyApp');
            });
        });
        describe('when called with name having invalid java chars', () => {
            it('return the default app name', () => {
                BaseGenerator.prototype.baseName = '9myApp';
                assert.equal(BaseGenerator.prototype.getMainClassName(), 'Application');
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
                const out = BaseGenerator.prototype.writeFilesToDisk(files, generator, true).sort();
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
                const out = BaseGenerator.prototype.writeFilesToDisk(files, generator, true).sort();
                assert.deepEqual(out, filesToAssert);
            });
        });
    });

    describe('stripMargin', () => {
        it('should produce correct output without margin', () => {
            const entityFolderName = 'entityFolderName';
            const entityFileName = 'entityFileName';
            const content =
                `|export * from './${entityFolderName}/${entityFileName}-dialog.component';
                 |export * from './${entityFolderName}/${entityFileName}-delete-dialog.component';
                 |export * from './${entityFolderName}/${entityFileName}-detail.component';
                 |export * from './${entityFolderName}/${entityFileName}.component';
                 |export * from './${entityFolderName}/${entityFileName}.state';`;
            const out =
`export * from './entityFolderName/entityFileName-dialog.component';
export * from './entityFolderName/entityFileName-delete-dialog.component';
export * from './entityFolderName/entityFileName-detail.component';
export * from './entityFolderName/entityFileName.component';
export * from './entityFolderName/entityFileName.state';`;
            assert.equal(BaseGenerator.prototype.stripMargin(content), out);
        });
        it('should produce correct indented output without margin', () => {
            const routerName = 'routerName';
            const enableTranslation = true;
            const glyphiconName = 'glyphiconName';
            const content =
                `|<li ui-sref-active="active">
                 |    <a ui-sref="${routerName}" ng-click="vm.collapseNavbar()">
                 |        <span class="glyphicon glyphicon-${glyphiconName}"></span>&nbsp;
                 |        <span ${enableTranslation ? `data-translate="global.menu.${routerName}"` : ''}>${routerName}</span>
                 |    </a>
                 |</li>`;
            const out =
`<li ui-sref-active="active">
    <a ui-sref="routerName" ng-click="vm.collapseNavbar()">
        <span class="glyphicon glyphicon-glyphiconName"></span>&nbsp;
        <span data-translate="global.menu.routerName">routerName</span>
    </a>
</li>`;
            assert.equal(BaseGenerator.prototype.stripMargin(content), out);
        });
    });

    describe('getDBTypeFromDBValue', () => {
        describe('when called with sql DB name', () => {
            it('return SQL', () => {
                assert.equal(BaseGenerator.prototype.getDBTypeFromDBValue('mysql'), 'sql');
            });
        });
        describe('when called with mongo DB', () => {
            it('return mongodb', () => {
                assert.equal(BaseGenerator.prototype.getDBTypeFromDBValue('mongodb'), 'mongodb');
            });
        });
        describe('when called with cassandra', () => {
            it('return cassandra', () => {
                assert.equal(BaseGenerator.prototype.getDBTypeFromDBValue('cassandra'), 'cassandra');
            });
        });
    });
});
