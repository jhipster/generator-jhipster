const expect = require('chai').expect;
const jhiCore = require('jhipster-core');
const expectedFiles = require('./utils/expected-files');
const BaseGenerator = require('../generators/generator-base').prototype;

BaseGenerator.log = msg => {
    // eslint-disable-next-line no-console
    console.log(msg);
};

describe('Generator Base', () => {
    describe('getAllSupportedLanguages', () => {
        describe('when called', () => {
            it('returns an array', () => {
                expect(BaseGenerator.getAllSupportedLanguages()).to.not.have.length(0);
            });
        });
    });
    describe('isSupportedLanguage', () => {
        describe('when called with valid language', () => {
            it('returns true', () => {
                expect(BaseGenerator.isSupportedLanguage('en')).to.equal(true);
            });
        });
        describe('when called with invalid language', () => {
            it('returns false', () => {
                expect(BaseGenerator.isSupportedLanguage('ab')).to.equal(false);
            });
        });
    });
    describe('getAllSupportedLanguageOptions', () => {
        describe('when called', () => {
            it('returns an array', () => {
                expect(BaseGenerator.getAllSupportedLanguages()).to.not.have.length(0);
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
                jhiCore.exportEntities({
                    entities,
                    forceNoFiltering: true,
                    application: {}
                });
                BaseGenerator.getExistingEntities();
                entities.Region.fields.push({ fieldName: 'regionDesc', fieldType: 'String' });
                jhiCore.exportEntities({
                    entities,
                    forceNoFiltering: true,
                    application: {}
                });
            });
            it('returns an up-to-date state', () => {
                expect(BaseGenerator.getExistingEntities().find(it => it.name === 'Region').definition.fields[1]).to.eql({
                    fieldName: 'regionDesc',
                    fieldType: 'String'
                });
            });
        });
    });
    describe('getTableName', () => {
        describe('when called with a value', () => {
            it('returns a table name', () => {
                expect(BaseGenerator.getTableName('tableName')).to.equal('table_name');
            });
        });
    });
    describe('getColumnName', () => {
        describe('when called with a value', () => {
            it('returns a column name', () => {
                expect(BaseGenerator.getColumnName('colName')).to.equal('col_name');
                expect(BaseGenerator.getColumnName('colNName')).to.equal('colnname');
            });
        });
    });
    describe('getPluralColumnName', () => {
        describe('when called with a value', () => {
            it('returns a plural column name', () => {
                expect(BaseGenerator.getPluralColumnName('colName')).to.equal('col_names');
            });
        });
    });
    describe('getJoinTableName', () => {
        describe('when called with a value', () => {
            it('returns a join table name', () => {
                expect(BaseGenerator.getJoinTableName('entityName', 'relationshipName', 'mysql')).to.equal('entity_name_relationship_name');
            });
        });
        describe('when called with a long name', () => {
            it('returns a proper join table name', () => {
                expect(BaseGenerator.getJoinTableName('entityNameLonger', 'relationshipName', 'oracle')).to.have.length(30);
                expect(BaseGenerator.getJoinTableName('entityNameLonger', 'relationshipName', 'oracle')).to.equal(
                    'entity_name_lon_relationship_n'
                );
            });
        });
    });
    describe('getFKConstraintName', () => {
        describe('when called with a value', () => {
            it('returns a constraint name', () => {
                expect(BaseGenerator.getFKConstraintName('entityName', 'relationshipName', 'mysql')).to.equal(
                    'fk_entity_name_relationship_name_id'
                );
            });
        });
        describe('when called with a long name and oracle', () => {
            it('returns a proper constraint name', () => {
                expect(BaseGenerator.getFKConstraintName('entityNameLongerName', 'relationshipLongerName', 'oracle')).to.have.length(30);
                expect(BaseGenerator.getFKConstraintName('entityNameLongerName', 'relationshipLongerName', 'oracle')).to.equal(
                    'entity_name_lo_relationship_id'
                );
            });
        });
        describe('when called with a long name and mysql', () => {
            it('returns a proper constraint name', () => {
                expect(
                    BaseGenerator.getFKConstraintName(
                        'entityLongerNameWithPaginationAndDTO',
                        'relationshipLongerNameWithPaginationAndDTO',
                        'mysql'
                    )
                ).to.have.length(64);
                expect(
                    BaseGenerator.getFKConstraintName(
                        'entityLongerNameWithPaginationAndDTO',
                        'relationshipLongerNameWithPaginationAndDTO',
                        'mysql'
                    )
                ).to.equal('entity_longer_name_with_paginat_relationship_longer_name_with_id');
            });
        });
        describe('when called with a long name that is near limit and mysql', () => {
            it('returns a proper constraint name', () => {
                expect(
                    BaseGenerator.getFKConstraintName('testCustomTableName', 'userManyToManyUserManyToMany', 'mysql').length
                ).to.be.lessThan(64);
                expect(BaseGenerator.getFKConstraintName('testCustomTableName', 'userManyToManyUserManyToMany', 'mysql')).to.equal(
                    'test_custom_table_name_user_many_to_many_user_many_to_many_id'
                );
                expect(
                    BaseGenerator.getFKConstraintName('testCustomTableName', 'userManyToManyUserManyToManies', 'mysql').length
                ).to.be.lessThan(64);
                expect(BaseGenerator.getFKConstraintName('testCustomTableName', 'userManyToManyUserManyToManies', 'mysql')).to.equal(
                    'test_custom_table_name_user_many_to_many_user_many_to_manies_id'
                );
            });
        });
        describe('when called with a long name that is equal to limit and mysql', () => {
            it('returns a proper constraint name', () => {
                expect(BaseGenerator.getFKConstraintName('testCustomTableNames', 'userManyToManyUserManyToManies', 'mysql')).to.have.length(
                    64
                );
                expect(BaseGenerator.getFKConstraintName('testCustomTableNames', 'userManyToManyUserManyToManies', 'mysql')).to.equal(
                    'test_custom_table_names_user_many_to_many_user_many_to_manies_id'
                );
            });
        });
        describe('when called with a long name and no snake case', () => {
            it('returns a proper constraint name', () => {
                expect(BaseGenerator.getFKConstraintName('entityNameLongerName', 'relationshipLongerName', 'oracle', true)).to.have.length(
                    30
                );
                expect(BaseGenerator.getFKConstraintName('entityNameLongerName', 'relationshipLongerName', 'oracle', true)).to.equal(
                    'entityNameLong_relationship_id'
                );
            });
        });
    });
    describe('getUXConstraintName', () => {
        describe('when called with a value', () => {
            it('returns a constraint name', () => {
                expect(BaseGenerator.getUXConstraintName('entityName', 'columnName', 'mysql')).to.equal('ux_entity_name_column_name');
            });
        });
        describe('when called with a value and no snake case', () => {
            it('returns a constraint name', () => {
                expect(BaseGenerator.getUXConstraintName('entityName', 'columnName', 'mysql', true)).to.equal('ux_entityName_columnName');
            });
        });
        describe('when called with a long name and oracle', () => {
            it('returns a proper constraint name', () => {
                expect(BaseGenerator.getUXConstraintName('entityNameLongerName', 'columnLongerName', 'oracle')).to.have.length(30);
                expect(BaseGenerator.getUXConstraintName('entityNameLongerName', 'columnLongerName', 'oracle')).to.equal(
                    'ux_entity_name_lo_column_longe'
                );
            });
        });
        describe('when called with a long name and mysql', () => {
            it('returns a proper constraint name', () => {
                expect(
                    BaseGenerator.getUXConstraintName(
                        'entityLongerNameWithPaginationAndDTO',
                        'columnLongerNameWithPaginationAndDTO',
                        'mysql'
                    )
                ).to.have.length(64);
                expect(
                    BaseGenerator.getUXConstraintName(
                        'entityLongerNameWithPaginationAndDTO',
                        'columnLongerNameWithPaginationAndDTO',
                        'mysql'
                    )
                ).to.equal('ux_entity_longer_name_with_paginat_column_longer_name_with_pagin');
            });
        });
        describe('when called with a long name that is near limit and mysql', () => {
            it('returns a proper constraint name', () => {
                expect(
                    BaseGenerator.getUXConstraintName('testCustomTableName', 'userManyToManyUserManyToManies', 'mysql').length
                ).to.be.lessThan(64);
                expect(BaseGenerator.getUXConstraintName('testCustomTableName', 'userManyToManyUserManyToManies', 'mysql')).to.equal(
                    'ux_test_custom_table_name_user_many_to_many_user_many_to_manies'
                );
            });
        });
        describe('when called with a long name that is equal to limit and mysql', () => {
            it('returns a proper constraint name', () => {
                expect(BaseGenerator.getUXConstraintName('testCustomTableNames', 'userManyToManyUserManyToManies', 'mysql')).to.have.length(
                    64
                );
                expect(BaseGenerator.getUXConstraintName('testCustomTableNames', 'userManyToManyUserManyToManies', 'mysql')).to.equal(
                    'ux_test_custom_table_names_user_many_to_many_user_many_to_manies'
                );
            });
        });
        describe('when called with a long name and mysql and no snake case', () => {
            it('returns a proper constraint name', () => {
                expect(
                    BaseGenerator.getUXConstraintName(
                        'entityLongerNameWithPaginationAndDTO',
                        'columnLongerNameWithPaginationAndDTO',
                        'mysql',
                        true
                    )
                ).to.have.length(64);
                expect(
                    BaseGenerator.getUXConstraintName(
                        'entityLongerNameWithPaginationAndDTO',
                        'columnLongerNameWithPaginationAndDTO',
                        'mysql',
                        true
                    )
                ).to.equal('ux_entityLongerNameWithPaginationA_columnLongerNameWithPaginatio');
            });
        });
    });
    describe('printJHipsterLogo', () => {
        describe('when called', () => {
            it('prints the logo', () => {
                expect(BaseGenerator.printJHipsterLogo()).to.equal(undefined);
            });
        });
    });
    describe('checkForNewVersion', () => {
        describe('when called', () => {
            it('prints the new version info', () => {
                expect(BaseGenerator.checkForNewVersion()).to.equal(undefined);
            });
        });
    });
    describe('getAngularAppName', () => {
        describe('when called with name', () => {
            it('return the angular app name', () => {
                BaseGenerator.baseName = 'myTest';
                expect(BaseGenerator.getAngularAppName()).to.equal('myTestApp');
            });
        });
        describe('when called with name having App', () => {
            it('return the angular app name', () => {
                BaseGenerator.baseName = 'myApp';
                expect(BaseGenerator.getAngularAppName()).to.equal('myApp');
            });
        });
    });
    describe('getMainClassName', () => {
        describe('when called with name', () => {
            it('return the app name', () => {
                BaseGenerator.baseName = 'myTest';
                expect(BaseGenerator.getMainClassName()).to.equal('MyTestApp');
            });
        });
        describe('when called with name having App', () => {
            it('return the app name', () => {
                BaseGenerator.baseName = 'myApp';
                expect(BaseGenerator.getMainClassName()).to.equal('MyApp');
            });
        });
        describe('when called with name having invalid java chars', () => {
            it('return the default app name', () => {
                BaseGenerator.baseName = '9myApp';
                expect(BaseGenerator.getMainClassName()).to.equal('Application');
            });
        });
    });

    describe('writeFilesToDisk', () => {
        describe('when called with default angular client options', () => {
            it('should produce correct files', () => {
                const files = require('../generators/client/files-angular').files; // eslint-disable-line global-require
                const generator = {
                    enableTranslation: true,
                    serviceDiscoveryType: false,
                    authenticationType: 'jwt',
                    testFrameworks: []
                };
                let filesToAssert = expectedFiles.client;
                filesToAssert = filesToAssert.concat(expectedFiles.jwtClient);
                filesToAssert = filesToAssert.concat(expectedFiles.userManagementClient).sort();
                const out = BaseGenerator.writeFilesToDisk(files, generator, true).sort();
                expect(out).to.eql(filesToAssert);
            });
        });
        describe('when called with default angular client options skipping user-management', () => {
            it('should produce correct files', () => {
                const files = require('../generators/client/files-angular').files; // eslint-disable-line global-require
                const generator = {
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
                expect(out).to.eql(filesToAssert);
            });
        });
    });
});
