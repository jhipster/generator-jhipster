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
});
