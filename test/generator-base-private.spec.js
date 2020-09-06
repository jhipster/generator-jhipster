const path = require('path');
const expect = require('chai').expect;
// using base generator which extends the private base
const BaseGenerator = require('../generators/generator-base').prototype;
const constants = require('../generators/generator-constants');

const ANGULAR = constants.SUPPORTED_CLIENT_FRAMEWORKS.ANGULAR;
const REACT = constants.SUPPORTED_CLIENT_FRAMEWORKS.REACT;

BaseGenerator.log = msg => {
    // eslint-disable-next-line no-console
    console.log(msg);
};

describe('Generator Base Private', () => {
    describe('stripMargin', () => {
        it('should produce correct output without margin', () => {
            const entityFolderName = 'entityFolderName';
            const entityFileName = 'entityFileName';
            const content = `|export * from './${entityFolderName}/${entityFileName}-update.component';
                 |export * from './${entityFolderName}/${entityFileName}-delete-dialog.component';
                 |export * from './${entityFolderName}/${entityFileName}-detail.component';
                 |export * from './${entityFolderName}/${entityFileName}.component';
                 |export * from './${entityFolderName}/${entityFileName}.state';`;
            const out = `export * from './entityFolderName/entityFileName-update.component';
export * from './entityFolderName/entityFileName-delete-dialog.component';
export * from './entityFolderName/entityFileName-detail.component';
export * from './entityFolderName/entityFileName.component';
export * from './entityFolderName/entityFileName.state';`;
            expect(BaseGenerator.stripMargin(content)).to.equal(out);
        });
        it('should produce correct indented output without margin', () => {
            const routerName = 'routerName';
            const enableTranslation = true;
            const content = `|<li ui-sref-active="active">
                 |    <a ui-sref="${routerName}" ng-click="vm.collapseNavbar()">
                 |        <span ${enableTranslation ? `data-translate="global.menu.${routerName}"` : ''}>${routerName}</span>
                 |    </a>
                 |</li>`;
            const out = `<li ui-sref-active="active">
    <a ui-sref="routerName" ng-click="vm.collapseNavbar()">
        <span data-translate="global.menu.routerName">routerName</span>
    </a>
</li>`;
            expect(BaseGenerator.stripMargin(content)).to.equal(out);
        });
    });

    describe('getDBTypeFromDBValue', () => {
        describe('when called with sql DB name', () => {
            it('return SQL', () => {
                expect(BaseGenerator.getDBTypeFromDBValue('mysql')).to.equal('sql');
            });
        });
        describe('when called with mongo DB', () => {
            it('return mongodb', () => {
                expect(BaseGenerator.getDBTypeFromDBValue('mongodb')).to.equal('mongodb');
            });
        });
        describe('when called with cassandra', () => {
            it('return cassandra', () => {
                expect(BaseGenerator.getDBTypeFromDBValue('cassandra')).to.equal('cassandra');
            });
        });
    });

    describe('generateEntityClientImports', () => {
        describe('with relationships from or to the User', () => {
            const relationships = [
                {
                    otherEntityAngularName: 'User',
                },
                {
                    otherEntityAngularName: 'AnEntity',
                },
            ];
            describe('when called with dto option', () => {
                it('return an empty Map', () => {
                    const imports = BaseGenerator.generateEntityClientImports(relationships, 'yes');
                    expect(imports.size).to.eql(0);
                });
            });
            describe('when called with 2 distinct relationships without dto option', () => {
                it('return a Map with 2 imports', () => {
                    const imports = BaseGenerator.generateEntityClientImports(relationships, 'no');
                    expect(imports).to.have.all.keys('IUser', 'IAnEntity');
                    expect(imports.size).to.eql(relationships.length);
                });
            });
            describe('when called with 2 identical relationships without dto option', () => {
                const relationships = [
                    {
                        otherEntityAngularName: 'User',
                    },
                    {
                        otherEntityAngularName: 'User',
                    },
                ];
                it('return a Map with 1 import', () => {
                    const imports = BaseGenerator.generateEntityClientImports(relationships, 'no');
                    expect(imports).to.have.key('IUser');
                    expect(imports.size).to.eql(1);
                });
            });
        });
        describe('with no relationship from or to the User', () => {
            describe('when called to have models to be imported in the templates', () => {
                let importsForAngular = null;
                let importsForReact = null;
                const relationships = [
                    {
                        otherEntityAngularName: 'AnEntity',
                        otherEntityFileName: 'AnEntity',
                        otherEntityClientRootFolder: 'anEntity',
                    },
                    {
                        otherEntityAngularName: 'AnotherEntity',
                        otherEntityFileName: 'AnotherEntity',
                        otherEntityClientRootFolder: 'anotherEntity',
                    },
                ];

                before(() => {
                    importsForAngular = BaseGenerator.generateEntityClientImports(relationships, 'no', ANGULAR);
                    importsForReact = BaseGenerator.generateEntityClientImports(relationships, 'no', REACT);
                });

                it('adds the same imports regardless of the client framework', () => {
                    expect(importsForAngular).to.eql(importsForReact);
                });
            });
        });
    });

    describe('generateLanguageOptions', () => {
        describe('when called with empty array', () => {
            it('return empty', () => {
                expect(BaseGenerator.generateLanguageOptions([])).to.eql([]);
            });
        });
        describe('when called with languages array', () => {
            it('return languages pipe syntax', () => {
                expect(BaseGenerator.generateLanguageOptions(['en', 'fr'])).to.eql([
                    `'en': { name: 'English' }`, // eslint-disable-line
                    `'fr': { name: 'Français' }`, // eslint-disable-line
                ]);
            });
        });
    });

    describe('skipLanguageForLocale', () => {
        describe('when called with english', () => {
            it('return false', () => {
                expect(BaseGenerator.skipLanguageForLocale('en')).to.equal(false);
            });
        });
        describe('when called with languages ar-ly', () => {
            it('return true', () => {
                expect(BaseGenerator.skipLanguageForLocale('ar-ly')).to.equal(true);
            });
        });
    });

    describe('generateTestEntityId', () => {
        describe('when called with int', () => {
            it('return 123', () => {
                expect(BaseGenerator.generateTestEntityId('int')).to.equal(123);
            });
        });
        describe('when called with String', () => {
            it("return '123'", () => {
                expect(BaseGenerator.generateTestEntityId('String')).to.equal("'123'");
            });
        });
        describe('when called with UUID', () => {
            it("return '9fec3727-3421-4967-b213-ba36557ca194'", () => {
                expect(BaseGenerator.generateTestEntityId('UUID')).to.equal("'9fec3727-3421-4967-b213-ba36557ca194'");
            });
        });
    });

    describe('getJDBCUrl', () => {
        describe('when called for mysql', () => {
            it('return jdbc:mysql://localhost:3306/test?useUnicode=true&characterEncoding=utf8&useSSL=false&useLegacyDatetimeCode=false&serverTimezone=UTC&createDatabaseIfNotExist=true', () => {
                expect(BaseGenerator.getJDBCUrl('mysql', { databaseName: 'test', hostname: 'localhost' })).to.equal(
                    'jdbc:mysql://localhost:3306/test?useUnicode=true&characterEncoding=utf8&useSSL=false&useLegacyDatetimeCode=false&serverTimezone=UTC&createDatabaseIfNotExist=true'
                );
            });
        });
        describe('when called for mysql with skipExtraOptions enabled', () => {
            it('return jdbc:mysql://localhost:3306/test', () => {
                expect(BaseGenerator.getJDBCUrl('mysql', { databaseName: 'test', hostname: 'localhost', skipExtraOptions: true })).to.equal(
                    'jdbc:mysql://localhost:3306/test'
                );
            });
        });
        describe('when called for mariadb', () => {
            it('return jdbc:mariadb://localhost:3306/test?useLegacyDatetimeCode=false&serverTimezone=UTC', () => {
                expect(BaseGenerator.getJDBCUrl('mariadb', { databaseName: 'test', hostname: 'localhost' })).to.equal(
                    'jdbc:mariadb://localhost:3306/test?useLegacyDatetimeCode=false&serverTimezone=UTC'
                );
            });
        });
        describe('when called for mariadb with skipExtraOptions enabled', () => {
            it('return jdbc:mariadb://localhost:3306/test', () => {
                expect(
                    BaseGenerator.getJDBCUrl('mariadb', { databaseName: 'test', hostname: 'localhost', skipExtraOptions: true })
                ).to.equal('jdbc:mariadb://localhost:3306/test');
            });
        });
        describe('when called for postgresql', () => {
            it('return jdbc:postgresql://localhost:5432/test', () => {
                expect(BaseGenerator.getJDBCUrl('postgresql', { databaseName: 'test', hostname: 'localhost' })).to.equal(
                    'jdbc:postgresql://localhost:5432/test'
                );
            });
        });
        describe('when called for oracle', () => {
            it('return jdbc:oracle:thin:@localhost:1521:test', () => {
                expect(BaseGenerator.getJDBCUrl('oracle', { databaseName: 'test', hostname: 'localhost' })).to.equal(
                    'jdbc:oracle:thin:@localhost:1521:test'
                );
            });
        });
        describe('when called for mssql', () => {
            it('return jdbc:sqlserver://localhost:1433;database=test', () => {
                expect(BaseGenerator.getJDBCUrl('mssql', { databaseName: 'test', hostname: 'localhost' })).to.equal(
                    'jdbc:sqlserver://localhost:1433;database=test'
                );
            });
        });
        describe('when called for h2Disk', () => {
            it('return jdbc:h2:file:./build/h2db/db/test;DB_CLOSE_DELAY=-1', () => {
                expect(BaseGenerator.getJDBCUrl('h2Disk', { databaseName: 'test', localDirectory: './build/h2db/db' })).to.equal(
                    'jdbc:h2:file:./build/h2db/db/test;DB_CLOSE_DELAY=-1'
                );
            });
        });
        describe('when called for h2Disk with skipExtraOptions enabled', () => {
            it('return jdbc:h2:file:./build/h2db/db/test', () => {
                expect(
                    BaseGenerator.getJDBCUrl('h2Disk', { databaseName: 'test', localDirectory: './build/h2db/db', skipExtraOptions: true })
                ).to.equal('jdbc:h2:file:./build/h2db/db/test');
            });
        });
        describe('when called for h2Disk with missing `localDirectory` option', () => {
            it('throw an error', () => {
                expect(() => BaseGenerator.getJDBCUrl('h2Disk', { databaseName: 'test' })).to.throw(
                    "'localDirectory' option should be provided for h2Disk databaseType"
                );
            });
        });
        describe('when called for h2Memory', () => {
            it('return jdbc:h2:mem:test;DB_CLOSE_DELAY=-1;DB_CLOSE_ON_EXIT=FALSE', () => {
                expect(BaseGenerator.getJDBCUrl('h2Memory', { databaseName: 'test' })).to.equal(
                    'jdbc:h2:mem:test;DB_CLOSE_DELAY=-1;DB_CLOSE_ON_EXIT=FALSE'
                );
            });
        });
        describe('when called for h2Memory with skipExtraOptions enabled', () => {
            it('return jdbc:h2:mem:test', () => {
                expect(BaseGenerator.getJDBCUrl('h2Memory', { databaseName: 'test', skipExtraOptions: true })).to.equal('jdbc:h2:mem:test');
            });
        });
        describe('when called with missing `databaseName` option', () => {
            it('throw an error', () => {
                expect(() => BaseGenerator.getJDBCUrl('mysql')).to.throw("option 'databaseName' is required");
            });
        });
        describe('when called for an unknown databaseType', () => {
            it('throw an error', () => {
                expect(() => BaseGenerator.getJDBCUrl('foodb', { databaseName: 'test' })).to.throw('foodb databaseType is not supported');
            });
        });
    });

    describe('getR2DBCUrl', () => {
        describe('when called for mysql', () => {
            it('return r2dbc:mysql://localhost:3306/test?useUnicode=true&characterEncoding=utf8&useSSL=false&useLegacyDatetimeCode=false&serverTimezone=UTC&createDatabaseIfNotExist=true', () => {
                expect(BaseGenerator.getR2DBCUrl('mysql', { databaseName: 'test', hostname: 'localhost' })).to.equal(
                    'r2dbc:mysql://localhost:3306/test?useUnicode=true&characterEncoding=utf8&useSSL=false&useLegacyDatetimeCode=false&serverTimezone=UTC&createDatabaseIfNotExist=true'
                );
            });
        });
        describe('when called for mysql with skipExtraOptions enabled', () => {
            it('return r2dbc:mysql://localhost:3306/test', () => {
                expect(
                    BaseGenerator.getR2DBCUrl('mysql', { databaseName: 'test', hostname: 'localhost', skipExtraOptions: true })
                ).to.equal('r2dbc:mysql://localhost:3306/test');
            });
        });
        describe('when called for mariadb', () => {
            it('return r2dbc:mariadb://localhost:3306/test?useLegacyDatetimeCode=false&serverTimezone=UTC', () => {
                expect(BaseGenerator.getR2DBCUrl('mariadb', { databaseName: 'test', hostname: 'localhost' })).to.equal(
                    'r2dbc:mariadb://localhost:3306/test?useLegacyDatetimeCode=false&serverTimezone=UTC'
                );
            });
        });
        describe('when called for mariadb with skipExtraOptions enabled', () => {
            it('return r2dbc:mariadb://localhost:3306/test', () => {
                expect(
                    BaseGenerator.getR2DBCUrl('mariadb', { databaseName: 'test', hostname: 'localhost', skipExtraOptions: true })
                ).to.equal('r2dbc:mariadb://localhost:3306/test');
            });
        });
        describe('when called for postgresql', () => {
            it('return r2dbc:postgresql://localhost:5432/test', () => {
                expect(BaseGenerator.getR2DBCUrl('postgresql', { databaseName: 'test', hostname: 'localhost' })).to.equal(
                    'r2dbc:postgresql://localhost:5432/test'
                );
            });
        });
        describe('when called for oracle', () => {
            it('return r2dbc:oracle:thin:@localhost:1521:test', () => {
                expect(BaseGenerator.getR2DBCUrl('oracle', { databaseName: 'test', hostname: 'localhost' })).to.equal(
                    'r2dbc:oracle:thin:@localhost:1521:test'
                );
            });
        });
        describe('when called for mssql', () => {
            it('return r2dbc:sqlserver://localhost:1433;database=test', () => {
                expect(BaseGenerator.getR2DBCUrl('mssql', { databaseName: 'test', hostname: 'localhost' })).to.equal(
                    'r2dbc:sqlserver://localhost:1433;database=test'
                );
            });
        });
        describe('when called for h2Disk', () => {
            it('return r2dbc:h2:file:./build/h2db/db/test;DB_CLOSE_DELAY=-1', () => {
                expect(BaseGenerator.getR2DBCUrl('h2Disk', { databaseName: 'test', localDirectory: './build/h2db/db' })).to.equal(
                    'r2dbc:h2:file:./build/h2db/db/test;DB_CLOSE_DELAY=-1'
                );
            });
        });
        describe('when called for h2Disk with skipExtraOptions enabled', () => {
            it('return r2dbc:h2:file:./build/h2db/db/test', () => {
                expect(
                    BaseGenerator.getR2DBCUrl('h2Disk', { databaseName: 'test', localDirectory: './build/h2db/db', skipExtraOptions: true })
                ).to.equal('r2dbc:h2:file:./build/h2db/db/test');
            });
        });
        describe('when called for h2Disk with missing `localDirectory` option', () => {
            it('throw an error', () => {
                expect(() => BaseGenerator.getR2DBCUrl('h2Disk', { databaseName: 'test' })).to.throw(
                    "'localDirectory' option should be provided for h2Disk databaseType"
                );
            });
        });
        describe('when called for h2Memory', () => {
            it('return r2dbc:h2:mem:///test;DB_CLOSE_DELAY=-1;DB_CLOSE_ON_EXIT=FALSE', () => {
                expect(BaseGenerator.getR2DBCUrl('h2Memory', { databaseName: 'test' })).to.equal(
                    'r2dbc:h2:mem:///test;DB_CLOSE_DELAY=-1;DB_CLOSE_ON_EXIT=FALSE'
                );
            });
        });
        describe('when called for h2Memory with skipExtraOptions enabled', () => {
            it('return r2dbc:h2:mem:///test', () => {
                expect(BaseGenerator.getR2DBCUrl('h2Memory', { databaseName: 'test', skipExtraOptions: true })).to.equal(
                    'r2dbc:h2:mem:///test'
                );
            });
        });
        describe('when called with missing `databaseName` option', () => {
            it('throw an error', () => {
                expect(() => BaseGenerator.getR2DBCUrl('mysql')).to.throw("option 'databaseName' is required");
            });
        });
        describe('when called for an unknown databaseType', () => {
            it('throw an error', () => {
                expect(() => BaseGenerator.getR2DBCUrl('foodb', { databaseName: 'test' })).to.throw('foodb databaseType is not supported');
            });
        });
    });

    describe('formatAsApiDescription', () => {
        describe('when formatting a nil text', () => {
            it('returns it', () => {
                expect(BaseGenerator.formatAsApiDescription()).to.equal(undefined);
            });
        });
        describe('when formatting an empty text', () => {
            it('returns it', () => {
                expect(BaseGenerator.formatAsApiDescription('')).to.equal('');
            });
        });
        describe('when formatting normal texts', () => {
            describe('when having empty lines', () => {
                it('discards them', () => {
                    expect(BaseGenerator.formatAsApiDescription('First line\n \nSecond line\n\nThird line')).to.equal(
                        'First line Second line Third line'
                    );
                });
            });
            describe('when having HTML tags', () => {
                it('keeps them', () => {
                    expect(BaseGenerator.formatAsApiDescription('Not boldy\n<b>boldy</b>')).to.equal('Not boldy<b>boldy</b>');
                });
            });
            describe('when having a plain text', () => {
                it('puts a space before each line', () => {
                    expect(BaseGenerator.formatAsApiDescription('JHipster is\na great generator')).to.equal(
                        'JHipster is a great generator'
                    );
                });
            });
            describe('when having quotes', () => {
                it('formats the text to make the string valid', () => {
                    expect(BaseGenerator.formatAsApiDescription('JHipster is "the" best')).to.equal('JHipster is \\"the\\" best');
                });
            });
        });
    });

    describe('formatAsLiquibaseRemarks', () => {
        describe('when formatting a nil text', () => {
            it('returns it', () => {
                expect(BaseGenerator.formatAsLiquibaseRemarks()).to.equal(undefined);
            });
        });
        describe('when formatting an empty text', () => {
            it('returns it', () => {
                expect(BaseGenerator.formatAsLiquibaseRemarks('')).to.equal('');
            });
        });
        describe('when formatting normal texts', () => {
            describe('when having empty lines', () => {
                it('discards them', () => {
                    expect(BaseGenerator.formatAsLiquibaseRemarks('First line\n \nSecond line\n\nThird line')).to.equal(
                        'First line Second line Third line'
                    );
                });
            });
            describe('when having a plain text', () => {
                it('puts a space before each line', () => {
                    expect(BaseGenerator.formatAsLiquibaseRemarks('JHipster is\na great generator')).to.equal(
                        'JHipster is a great generator'
                    );
                });
            });
            describe('when having ampersand', () => {
                it('formats the text to escape it', () => {
                    expect(BaseGenerator.formatAsLiquibaseRemarks('JHipster uses Spring & Hibernate')).to.equal(
                        'JHipster uses Spring &amp; Hibernate'
                    );
                });
            });
            describe('when having quotes', () => {
                it('formats the text to escape it', () => {
                    expect(BaseGenerator.formatAsLiquibaseRemarks('JHipster is "the" best')).to.equal('JHipster is &quot;the&quot; best');
                });
            });
            describe('when having apostrophe', () => {
                it('formats the text to escape it', () => {
                    expect(BaseGenerator.formatAsLiquibaseRemarks("JHipster is 'the' best")).to.equal('JHipster is &apos;the&apos; best');
                });
            });
            describe('when having HTML tags < and >', () => {
                it('formats the text to escape it', () => {
                    expect(BaseGenerator.formatAsLiquibaseRemarks('Not boldy\n<b>boldy</b>')).to.equal('Not boldy&lt;b&gt;boldy&lt;/b&gt;');
                });
            });
        });
    });

    describe('getEntityParentPathAddition', () => {
        describe('when passing /', () => {
            it('returns an empty string', () => {
                expect(BaseGenerator.getEntityParentPathAddition('/')).to.equal('');
            });
        });
        describe('when passing /foo/', () => {
            it('returns ../', () => {
                expect(BaseGenerator.getEntityParentPathAddition('/foo/')).to.equal('../');
            });
        });
        describe('when passing undefined', () => {
            it('returns an empty string', () => {
                expect(BaseGenerator.getEntityParentPathAddition()).to.equal('');
            });
        });
        describe('when passing empty', () => {
            it('returns an empty string', () => {
                expect(BaseGenerator.getEntityParentPathAddition('')).to.equal('');
            });
        });
        describe('when passing foo', () => {
            it('returns ../', () => {
                expect(BaseGenerator.getEntityParentPathAddition('foo')).to.equal('../');
            });
        });
        describe('when passing foo/bar', () => {
            it('returns ../../', () => {
                expect(BaseGenerator.getEntityParentPathAddition('foo/bar')).to.equal(`..${path.sep}../`);
            });
        });
        describe('when passing ../foo', () => {
            it('returns an empty string', () => {
                expect(BaseGenerator.getEntityParentPathAddition('../foo')).to.equal('');
            });
        });
        describe('when passing ../foo/bar', () => {
            it('returns ../', () => {
                expect(BaseGenerator.getEntityParentPathAddition('../foo/bar')).to.equal('../');
            });
        });
        describe('when passing ../foo/bar/foo2', () => {
            it('returns ../../', () => {
                expect(BaseGenerator.getEntityParentPathAddition('../foo/bar/foo2')).to.equal(`..${path.sep}../`);
            });
        });
        describe('when passing ../../foo', () => {
            it('throw an error', () => {
                expect(() => BaseGenerator.getEntityParentPathAddition('../../foo')).to.throw();
            });
        });
    });
});
