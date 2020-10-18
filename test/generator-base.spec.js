/* eslint-disable no-unused-expressions */
const expect = require('chai').expect;
const sinon = require('sinon');
const path = require('path');
const assert = require('yeoman-assert');
const helpers = require('yeoman-test');

const expectedFiles = require('./utils/expected-files');
const Base = require('../generators/generator-base');
const { testInTempDir, revertTempDir } = require('./utils/utils');
const { parseLiquibaseChangelogDate } = require('../utils/liquibase');

const BaseGenerator = Base.prototype;

BaseGenerator.log = msg => {
    // eslint-disable-next-line no-console
    console.log(msg);
};

const fakeGenerator = custom => {
    return {
        debug: sinon.spy(),
        warning: sinon.spy(),
        copy: sinon.spy(),
        processJs: sinon.spy(),
        processHtml: sinon.spy(),
        template: sinon.spy(),
        templatePath: sinon.stub().callsFake((...dest) => path.join(...dest)),
        ...custom,
    };
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
    describe.only('getJoinTableName', () => {
        describe('when called with a value', () => {
            it('returns a join table name', () => {
                expect(BaseGenerator.getJoinTableName('entityName', 'relationshipName', 'postgresql')).to.equal(
                    'rel_entity_name__relationship_name'
                );
            });
        });
        describe('when called with a long name', () => {
            it('returns a proper join table name', () => {
                expect(BaseGenerator.getJoinTableName('entityNameLonger', 'relationshipName', 'oracle')).to.equal(
                    'rel_entity_name_l__relation_be'
                );
                expect(BaseGenerator.getJoinTableName('entityNameLonger', 'relationshipName', 'oracle')).to.have.length(30);
            });
        });
        describe('when legacyRelationshipTableName is set', () => {
            it('returns a proper join table name', () => {
                function TestClass() {}
                TestClass.prototype = Object.create(Base.prototype);
                TestClass.prototype.jhipsterConfig = { legacyRelationshipTableName: true };
                expect(TestClass.prototype.getJoinTableName('entityNameLonger', 'relationshipName', 'oracle')).to.equal(
                    'entity_name_lon_relationship_n'
                );
                expect(TestClass.prototype.getJoinTableName('entityNameLonger', 'relationshipName', 'oracle')).to.have.length(30);
            });
        });
    });
    describe('getFKConstraintName', () => {
        describe('when called with a value', () => {
            it('returns a constraint name', () => {
                expect(BaseGenerator.getFKConstraintName('entityName', 'relationshipName', 'postgresql')).to.equal(
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
        describe('when called with a long name and postgresql', () => {
            it('returns a proper constraint name', () => {
                expect(
                    BaseGenerator.getFKConstraintName(
                        'entityLongerNameWithPaginationAndDTO',
                        'relationshipLongerNameWithPaginationAndDTO',
                        'postgresql'
                    )
                ).to.have.length(63);
                expect(
                    BaseGenerator.getFKConstraintName(
                        'entityLongerNameWithPaginationAndDTO',
                        'relationshipLongerNameWithPaginationAndDTO',
                        'postgresql'
                    )
                ).to.equal('entity_longer_name_with_pagina_relationship_longer_name_with_id');
            });
        });
        describe('when called with a long name that is near limit and postgresql', () => {
            it('returns a proper constraint name', () => {
                expect(
                    BaseGenerator.getFKConstraintName('testCustomTableName', 'userManyToManyUserManyToMany', 'postgresql').length
                ).to.be.lessThan(64);
                expect(BaseGenerator.getFKConstraintName('testCustomTableName', 'userManyToManyUserManyToMany', 'postgresql')).to.equal(
                    'test_custom_table_name_user_many_to_many_user_many_to_many_id'
                );
                expect(
                    BaseGenerator.getFKConstraintName('testCustomTableName', 'userManyToManyUserManyToManies', 'postgresql').length
                ).to.be.lessThan(64);
                expect(BaseGenerator.getFKConstraintName('testCustomTableName', 'userManyToManyUserManyToManies', 'postgresql')).to.equal(
                    'test_custom_table_name_user_many_to_many_user_many_to_manies_id'
                );
            });
        });
        describe('when called with a long name that is equal to limit and postgresql', () => {
            it('returns a proper constraint name', () => {
                expect(
                    BaseGenerator.getFKConstraintName('testCustomTableNames', 'userManyToManyUserManyToManies', 'postgresql')
                ).to.have.length(63);
                expect(BaseGenerator.getFKConstraintName('testCustomTableNames', 'userManyToManyUserManyToManies', 'postgresql')).to.equal(
                    'test_custom_table_names_user_many_to_many_user_many_to_manie_id'
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
                expect(BaseGenerator.getUXConstraintName('entityName', 'columnName', 'postgresql')).to.equal('ux_entity_name_column_name');
            });
        });
        describe('when called with a value and no snake case', () => {
            it('returns a constraint name', () => {
                expect(BaseGenerator.getUXConstraintName('entityName', 'columnName', 'postgresql', true)).to.equal(
                    'ux_entityName_columnName'
                );
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
        describe('when called with a long name and postgresql', () => {
            it('returns a proper constraint name', () => {
                expect(
                    BaseGenerator.getUXConstraintName(
                        'entityLongerNameWithPaginationAndDTO',
                        'columnLongerNameWithPaginationAndDTO',
                        'postgresql'
                    )
                ).to.have.length(63);
                expect(
                    BaseGenerator.getUXConstraintName(
                        'entityLongerNameWithPaginationAndDTO',
                        'columnLongerNameWithPaginationAndDTO',
                        'postgresql'
                    )
                ).to.equal('ux_entity_longer_name_with_pagina_column_longer_name_with_pagin');
            });
        });
        describe('when called with a long name that is near limit and postgresql', () => {
            it('returns a proper constraint name', () => {
                expect(
                    BaseGenerator.getUXConstraintName('testCustomTableName', 'userManyToManyUserManyToManies', 'postgresql').length
                ).to.be.lessThan(64);
                expect(BaseGenerator.getUXConstraintName('testCustomTableName', 'userManyToManyUserManyToManies', 'postgresql')).to.equal(
                    'ux_test_custom_table_name_user_many_to_many_user_many_to_manies'
                );
            });
        });
        describe('when called with a long name that is equal to limit and postgresql', () => {
            it('returns a proper constraint name', () => {
                expect(
                    BaseGenerator.getUXConstraintName('testCustomTableNames', 'userManyToManyUserManyToManies', 'postgresql')
                ).to.have.length(63);
                expect(BaseGenerator.getUXConstraintName('testCustomTableNames', 'userManyToManyUserManyToManies', 'postgresql')).to.equal(
                    'ux_test_custom_table_names_user_many_to_many_user_many_to_manie'
                );
            });
        });
        describe('when called with a long name and postgresql and no snake case', () => {
            it('returns a proper constraint name', () => {
                expect(
                    BaseGenerator.getUXConstraintName(
                        'entityLongerNameWithPaginationAndDTO',
                        'columnLongerNameWithPaginationAndDTO',
                        'postgresql',
                        true
                    )
                ).to.have.length(63);
                expect(
                    BaseGenerator.getUXConstraintName(
                        'entityLongerNameWithPaginationAndDTO',
                        'columnLongerNameWithPaginationAndDTO',
                        'postgresql',
                        true
                    )
                ).to.equal('ux_entityLongerNameWithPagination_columnLongerNameWithPaginatio');
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
    describe('getFrontendAppName', () => {
        describe('when called with name having App', () => {
            it('returns the frontend app name', () => {
                BaseGenerator.jhipsterConfig = { baseName: 'myAmazingApp' };
                expect(BaseGenerator.getFrontendAppName()).to.equal('myAmazingApp');
            });
        });
        describe('when called with name', () => {
            it('returns the frontend app name with the App suffix added', () => {
                BaseGenerator.jhipsterConfig = { baseName: 'myAwesomeProject' };
                expect(BaseGenerator.getFrontendAppName()).to.equal('myAwesomeProjectApp');
            });
        });
        describe('when called with name starting with a digit', () => {
            it('returns the default frontend app name - App', () => {
                BaseGenerator.jhipsterConfig = { baseName: '1derful' };
                expect(BaseGenerator.getFrontendAppName()).to.equal('App');
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
                    testFrameworks: [],
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
                    testFrameworks: [],
                };
                let filesToAssert = expectedFiles.client;
                filesToAssert = filesToAssert.concat(expectedFiles.jwtClient);
                filesToAssert = filesToAssert.sort();
                const out = BaseGenerator.writeFilesToDisk(files, generator, true).sort();
                expect(out).to.eql(filesToAssert);
            });
        });
        describe('when called without jhipsterTemplatesFolders and without rootTemplatesPath', () => {
            const files = { files: [{ templates: ['foo'] }] };
            const generator = fakeGenerator();
            let out;
            before('should produce correct files', () => {
                out = BaseGenerator.writeFilesToDisk(files, generator).sort();
            });
            it('should return template file names', () => {
                expect(out).to.eql(['foo']);
            });
            it('should call template with file', () => {
                expect(generator.template.calledOnce).to.be.true;
                expect(generator.template.getCall(0).args[0]).to.be.eql('foo.ejs');
            });
        });
        describe('when called with jhipsterTemplatesFolders', () => {
            const fixturesPath = path.join(__dirname, 'fixtures', 'writeFilesToDisk');
            let generator;
            beforeEach(() => {
                generator = fakeGenerator({
                    jhipsterTemplatesFolders: [
                        path.join(fixturesPath, 'templates', 'specific'),
                        path.join(fixturesPath, 'templates', 'common'),
                    ],
                });
            });
            describe('exiting file in templates/specific and templates/common folders', () => {
                const templates = ['all'];
                const files = { files: [{ templates }] };
                let out;
                beforeEach('should produce correct files', () => {
                    out = BaseGenerator.writeFilesToDisk(files, generator).sort();
                });
                it('should return template file names', () => {
                    expect(out).to.eql(templates);
                });
                it('should call template with the file in templates/specific', () => {
                    expect(generator.template.calledOnce).to.be.true;
                    expect(generator.template.getCall(0).args[0]).to.be.eql(
                        path.join(fixturesPath, 'templates', 'specific', `${templates[0]}.ejs`)
                    );
                });
                it('should forward jhipsterTemplatesFolders as options.root', () => {
                    expect(generator.template.getCall(0).args[3].root).to.be.eql(generator.jhipsterTemplatesFolders);
                });
            });
            describe('exiting file only in templates/common folder', () => {
                const templates = ['common'];
                const files = { files: [{ templates }] };
                let out;
                beforeEach('should produce correct files', () => {
                    out = BaseGenerator.writeFilesToDisk(files, generator).sort();
                });
                it('should return template file names', () => {
                    expect(out).to.eql(templates);
                });
                it('should call template with the file in templates/common', () => {
                    expect(generator.template.calledOnce).to.be.true;
                    expect(generator.template.getCall(0).args[0]).to.be.eql(
                        path.join(fixturesPath, 'templates', 'common', `${templates[0]}.ejs`)
                    );
                });
                it('should forward jhipsterTemplatesFolders as options.root', () => {
                    expect(generator.template.getCall(0).args[3].root).to.be.eql(generator.jhipsterTemplatesFolders);
                });
            });
        });
        describe('when called with jhipsterTemplatesFolders and rootTemplatesPath', () => {
            const fixturesPath = path.join(__dirname, 'fixtures', 'writeFilesToDisk');
            const rootTemplatesPath = ['specific', 'common'];
            let generator;
            beforeEach(() => {
                generator = fakeGenerator({
                    jhipsterTemplatesFolders: [path.join(fixturesPath, 'templates_override'), path.join(fixturesPath, 'templates')],
                });
            });
            describe('exiting file in templates_override/specific, templates/specific, templates/common folders', () => {
                const templates = ['all'];
                const files = { files: [{ templates }] };
                let out;
                beforeEach('should produce correct files', () => {
                    out = BaseGenerator.writeFilesToDisk(files, generator, rootTemplatesPath).sort();
                });
                it('should return template file names', () => {
                    expect(out).to.eql(templates);
                });
                it('should call template with the file in templates_override/specific', () => {
                    expect(generator.template.calledOnce).to.be.true;
                    expect(generator.template.getCall(0).args[0]).to.be.eql(
                        path.join(fixturesPath, 'templates_override', 'specific', `${templates[0]}.ejs`)
                    );
                });
                it('should forward jhipsterTemplatesFolders concatenated with rootTemplatesPath as options.root', () => {
                    expect(generator.template.getCall(0).args[3].root).to.be.eql([
                        path.join(generator.jhipsterTemplatesFolders[0], rootTemplatesPath[0]),
                        path.join(generator.jhipsterTemplatesFolders[0], rootTemplatesPath[1]),
                        path.join(generator.jhipsterTemplatesFolders[1], rootTemplatesPath[0]),
                        path.join(generator.jhipsterTemplatesFolders[1], rootTemplatesPath[1]),
                    ]);
                });
            });
            describe('exiting file only templates/specific folder', () => {
                const templates = ['specific'];
                const files = { files: [{ templates }] };
                let out;
                beforeEach('should produce correct files', () => {
                    out = BaseGenerator.writeFilesToDisk(files, generator, rootTemplatesPath).sort();
                });
                it('should return template file names', () => {
                    expect(out).to.eql(templates);
                });
                it('should call template with the file in templates/specific', () => {
                    expect(generator.template.calledOnce).to.be.true;
                    expect(generator.template.getCall(0).args[0]).to.be.eql(
                        path.join(fixturesPath, 'templates', 'specific', `${templates[0]}.ejs`)
                    );
                });
                it('should forward jhipsterTemplatesFolders concatenated with rootTemplatesPath as options.root', () => {
                    expect(generator.template.getCall(0).args[3].root).to.be.eql([
                        path.join(generator.jhipsterTemplatesFolders[0], rootTemplatesPath[0]),
                        path.join(generator.jhipsterTemplatesFolders[0], rootTemplatesPath[1]),
                        path.join(generator.jhipsterTemplatesFolders[1], rootTemplatesPath[0]),
                        path.join(generator.jhipsterTemplatesFolders[1], rootTemplatesPath[1]),
                    ]);
                });
            });
            describe('exiting file only templates/common folder', () => {
                const templates = ['common'];
                const files = { files: [{ templates }] };
                let out;
                beforeEach('should produce correct files', () => {
                    out = BaseGenerator.writeFilesToDisk(files, generator, rootTemplatesPath).sort();
                });
                it('should return template file names', () => {
                    expect(out).to.eql(['common']);
                });
                it('should call template with the file in templates/common', () => {
                    expect(generator.template.callCount).to.be.equal(1);
                    expect(generator.template.getCall(0).args[0]).to.be.eql(
                        path.join(fixturesPath, 'templates', 'common', `${templates[0]}.ejs`)
                    );
                });
                it('should forward jhipsterTemplatesFolders concatenated with rootTemplatesPath as options.root', () => {
                    expect(generator.template.getCall(0).args[3].root).to.be.eql([
                        path.join(generator.jhipsterTemplatesFolders[0], rootTemplatesPath[0]),
                        path.join(generator.jhipsterTemplatesFolders[0], rootTemplatesPath[1]),
                        path.join(generator.jhipsterTemplatesFolders[1], rootTemplatesPath[0]),
                        path.join(generator.jhipsterTemplatesFolders[1], rootTemplatesPath[1]),
                    ]);
                });
            });
        });
    });
    describe('dateFormatForLiquibase', () => {
        let base;
        let oldCwd;
        let options;
        beforeEach(() => {
            oldCwd = testInTempDir(() => {}, true);
            base = new Base({ ...options });
        });
        afterEach(() => {
            revertTempDir(oldCwd);
        });
        describe('when there is no configured lastLiquibaseTimestamp', () => {
            let firstChangelogDate;
            beforeEach(() => {
                assert.noFile('.yo-rc.json');
                firstChangelogDate = base.dateFormatForLiquibase();
            });
            it('should return a valid changelog date', () => {
                expect(/^\d{14}$/.test(firstChangelogDate)).to.be.true;
            });
            it('should save lastLiquibaseTimestamp', () => {
                expect(base.config.get('lastLiquibaseTimestamp')).to.be.equal(parseLiquibaseChangelogDate(firstChangelogDate).getTime());
            });
        });
        describe('when a past lastLiquibaseTimestamp is configured', () => {
            let firstChangelogDate;
            beforeEach(() => {
                const lastLiquibaseTimestamp = new Date(2000, 1, 1);
                base.config.set('lastLiquibaseTimestamp', lastLiquibaseTimestamp.getTime());
                expect(base.config.get('lastLiquibaseTimestamp')).to.be.equal(lastLiquibaseTimestamp.getTime());
                firstChangelogDate = base.dateFormatForLiquibase();
            });
            it('should return a valid changelog date', () => {
                expect(/^\d{14}$/.test(firstChangelogDate)).to.be.true;
            });
            it('should not return a past changelog date', () => {
                expect(firstChangelogDate.startsWith('2000')).to.be.false;
            });
            it('should save lastLiquibaseTimestamp', () => {
                expect(base.config.get('lastLiquibaseTimestamp')).to.be.equal(parseLiquibaseChangelogDate(firstChangelogDate).getTime());
            });
        });
        describe('when a future lastLiquibaseTimestamp is configured', () => {
            let firstChangelogDate;
            let secondChangelogDate;
            beforeEach(() => {
                const lastLiquibaseTimestamp = new Date(Date.parse('2030-01-01'));
                base.config.set('lastLiquibaseTimestamp', lastLiquibaseTimestamp.getTime());
                expect(base.config.get('lastLiquibaseTimestamp')).to.be.equal(lastLiquibaseTimestamp.getTime());
                firstChangelogDate = base.dateFormatForLiquibase();
                secondChangelogDate = base.dateFormatForLiquibase();
            });
            it('should return a valid changelog date', () => {
                expect(/^\d{14}$/.test(firstChangelogDate)).to.be.true;
            });
            it('should return a future changelog date', () => {
                expect(firstChangelogDate.startsWith('2030')).to.be.true;
            });
            it('should return a reproducible changelog date', () => {
                expect(firstChangelogDate).to.be.equal('20300101000001');
                expect(secondChangelogDate).to.be.equal('20300101000002');
            });
            it('should save lastLiquibaseTimestamp', () => {
                expect(base.config.get('lastLiquibaseTimestamp')).to.be.equal(parseLiquibaseChangelogDate('20300101000002').getTime());
            });
        });
        describe('with withEntities option', () => {
            before(() => {
                options = { withEntities: true };
            });
            after(() => {
                options = undefined;
            });
            describe('with reproducible=false argument', () => {
                let firstChangelogDate;
                let secondChangelogDate;
                beforeEach(() => {
                    firstChangelogDate = base.dateFormatForLiquibase(false);
                    secondChangelogDate = base.dateFormatForLiquibase(false);
                });
                it('should return a valid changelog date', () => {
                    expect(/^\d{14}$/.test(firstChangelogDate)).to.be.true;
                    expect(/^\d{14}$/.test(secondChangelogDate)).to.be.true;
                });
                it('should return a reproducible changelog date incremental to lastLiquibaseTimestamp', () => {
                    expect(firstChangelogDate).to.not.be.equal(secondChangelogDate);
                });
                it('should save lastLiquibaseTimestamp', () => {
                    expect(base.config.get('lastLiquibaseTimestamp')).to.be.equal(
                        parseLiquibaseChangelogDate(secondChangelogDate).getTime()
                    );
                });
            });
            describe('with a past creationTimestamp option', () => {
                let firstChangelogDate;
                let secondChangelogDate;
                before(() => {
                    options.creationTimestamp = '2000-01-01';
                });
                beforeEach(() => {
                    firstChangelogDate = base.dateFormatForLiquibase();
                    secondChangelogDate = base.dateFormatForLiquibase();
                });
                it('should return a valid changelog date', () => {
                    expect(/^\d{14}$/.test(firstChangelogDate)).to.be.true;
                });
                it('should return a past changelog date', () => {
                    expect(firstChangelogDate.startsWith('2000')).to.be.true;
                });
                it('should return a reproducible changelog date', () => {
                    expect(firstChangelogDate).to.be.equal('20000101000100');
                    expect(secondChangelogDate).to.be.equal('20000101000200');
                });
                it('should save lastLiquibaseTimestamp', () => {
                    expect(base.config.get('lastLiquibaseTimestamp')).to.be.equal(parseLiquibaseChangelogDate('20000101000200').getTime());
                });
            });
            describe('with a future creationTimestamp option', () => {
                it('should throw', () => {
                    options.creationTimestamp = '2030-01-01';
                    expect(() => new Base({ ...options })).to.throw(/^Creation timestamp should not be in the future: 2030-01-01\.$/);
                });
            });
        });
    });
    describe('priorities', () => {
        let mockedPriorities;
        const priorities = [
            'initializing',
            'prompting',
            'configuring',
            'composing',
            'loading',
            'preparing',
            'default',
            'writing',
            'postWriting',
            'preConflicts',
            'install',
            'end',
        ];
        before(() => {
            mockedPriorities = {};
            priorities.forEach(priority => {
                mockedPriorities[priority] = sinon.fake();
            });
            const mockBlueprintSubGen = class extends Base {
                get initializing() {
                    return {
                        mocked() {
                            mockedPriorities.initializing();
                        },
                    };
                }

                get prompting() {
                    return {
                        mocked() {
                            mockedPriorities.prompting();
                        },
                    };
                }

                get configuring() {
                    return {
                        mocked() {
                            mockedPriorities.configuring();
                        },
                    };
                }

                get composing() {
                    return {
                        mocked() {
                            mockedPriorities.composing();
                        },
                    };
                }

                get loading() {
                    return {
                        mocked() {
                            mockedPriorities.loading();
                        },
                    };
                }

                get preparing() {
                    return {
                        mocked() {
                            mockedPriorities.preparing();
                        },
                    };
                }

                get default() {
                    return {
                        mocked() {
                            mockedPriorities.default();
                        },
                    };
                }

                get writing() {
                    return {
                        mocked() {
                            mockedPriorities.writing();
                        },
                    };
                }

                get postWriting() {
                    return {
                        mocked() {
                            mockedPriorities.postWriting();
                        },
                    };
                }

                get preConflicts() {
                    return {
                        mocked() {
                            mockedPriorities.preConflicts();
                        },
                    };
                }

                get install() {
                    return {
                        mocked() {
                            mockedPriorities.install();
                        },
                    };
                }

                get end() {
                    return {
                        mocked() {
                            mockedPriorities.end();
                        },
                    };
                }
            };
            return helpers.create(mockBlueprintSubGen).run();
        });

        priorities.forEach((priority, idx) => {
            it(`should execute ${priority}`, () => {
                assert(mockedPriorities[priority].calledOnce);
            });
            if (idx > 0) {
                const lastPriority = priorities[idx - 1];
                it(`should execute ${priority} after ${lastPriority} `, () => {
                    assert(mockedPriorities[priority].calledAfter(mockedPriorities[lastPriority]));
                });
            }
        });
    });
});
