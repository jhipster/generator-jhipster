const expect = require('chai').expect;
// using base generator which extends the private base
const BaseGenerator = require('../generators/generator-base').prototype;

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
            const glyphiconName = 'glyphiconName';
            const content = `|<li ui-sref-active="active">
                 |    <a ui-sref="${routerName}" ng-click="vm.collapseNavbar()">
                 |        <span class="glyphicon glyphicon-${glyphiconName}"></span>&nbsp;
                 |        <span ${enableTranslation ? `data-translate="global.menu.${routerName}"` : ''}>${routerName}</span>
                 |    </a>
                 |</li>`;
            const out = `<li ui-sref-active="active">
    <a ui-sref="routerName" ng-click="vm.collapseNavbar()">
        <span class="glyphicon glyphicon-glyphiconName"></span>&nbsp;
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
                    otherEntityAngularName: 'User'
                },
                {
                    otherEntityAngularName: 'AnEntity'
                }
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
                        otherEntityAngularName: 'User'
                    },
                    {
                        otherEntityAngularName: 'User'
                    }
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
                        otherEntityClientRootFolder: 'anEntity'
                    },
                    {
                        otherEntityAngularName: 'AnotherEntity',
                        otherEntityFileName: 'AnotherEntity',
                        otherEntityClientRootFolder: 'anotherEntity'
                    }
                ];

                before(() => {
                    importsForAngular = BaseGenerator.generateEntityClientImports(relationships, 'no', 'angularX');
                    importsForReact = BaseGenerator.generateEntityClientImports(relationships, 'no', 'react');
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
                    `'fr': { name: 'Français' }` // eslint-disable-line
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
                    // eslint-disable-next-line quotes
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
                    // eslint-disable-next-line quotes
                    expect(BaseGenerator.formatAsLiquibaseRemarks('JHipster is "the" best')).to.equal('JHipster is &quot;the&quot; best');
                });
            });
            describe('when having apostrophe', () => {
                it('formats the text to escape it', () => {
                    // eslint-disable-next-line quotes
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
});
