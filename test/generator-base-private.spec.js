/* global describe, before, it */

const expect = require('chai').expect;
// using base generator which extends the private base
const BaseGenerator = require('../generators/generator-base').prototype;

BaseGenerator.log = (msg) => { console.log(msg); }; // eslint-disable-line no-console

describe('Generator Base Private', () => {
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
            expect(BaseGenerator.stripMargin(content)).to.equal(out);
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
            it('return \'123\'', () => {
                expect(BaseGenerator.generateTestEntityId('String')).to.equal('\'123\'');
            });
        });
        describe('when called with String and cassandra', () => {
            it('return \'9fec3727-3421-4967-b213-ba36557ca194\'', () => {
                expect(BaseGenerator.generateTestEntityId('String', 'cassandra')).to.equal('\'9fec3727-3421-4967-b213-ba36557ca194\'');
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
                    expect(BaseGenerator.formatAsApiDescription('First line\n \nSecond line\n\nThird line')).to.equal('First line Second line Third line');
                });
            });
            describe('when having HTML tags', () => {
                it('keeps them', () => {
                    expect(BaseGenerator.formatAsApiDescription('Not boldy\n<b>boldy</b>')).to.equal('Not boldy<b>boldy</b>');
                });
            });
            describe('when having a plain text', () => {
                it('puts a space before each line', () => {
                    expect(BaseGenerator.formatAsApiDescription('JHipster is\na great generator')).to.equal('JHipster is a great generator');
                });
            });
            describe('when having quotes', () => {
                it('formats the text to make the string valid', () => {
                    // eslint-disable-next-line quotes
                    expect(BaseGenerator.formatAsApiDescription("JHipster is \"the\" best")).to.equal("JHipster is \"the\" best");
                });
            });
        });
    });
});
