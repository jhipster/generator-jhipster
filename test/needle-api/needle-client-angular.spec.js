const path = require('path');
const assert = require('yeoman-assert');
const helpers = require('yeoman-test');

const ClientGenerator = require('../../generators/client');
const constants = require('../../generators/generator-constants');

const CLIENT_MAIN_SRC_DIR = constants.CLIENT_MAIN_SRC_DIR;

const mockBlueprintSubGen = class extends ClientGenerator {
    constructor(args, opts) {
        super(args, { fromBlueprint: true, ...opts }); // fromBlueprint variable is important
        const jhContext = (this.jhipsterContext = this.options.jhipsterContext);
        if (!jhContext) {
            this.error("This is a JHipster blueprint and should be used only like 'jhipster --blueprint myblueprint')}");
        }
        this.configOptions = jhContext.configOptions || {};
        // This sets up options for this sub generator and is being reused from JHipster
        jhContext.setupClientOptions(this, jhContext);
    }

    get initializing() {
        return super._initializing();
    }

    get prompting() {
        return super._prompting();
    }

    get configuring() {
        return super._configuring();
    }

    get default() {
        return super._default();
    }

    get writing() {
        const phaseFromJHipster = super._writing();
        const customPhaseSteps = {
            addCssStylesProperty() {
                this.addMainSCSSStyle('@import style_without_comment');
                this.addMainSCSSStyle('@import style', 'my comment');
                this.addVendorSCSSStyle('@import style', 'my comment');
                this.addVendorSCSSStyle('@import style_without_comment');
            },
            addToMenuStep() {
                this.addElementToMenu('routerName1', 'glyphiconName1', true, 'angularX');
                this.addElementToAdminMenu('routerName2', 'glyphiconName2', true, 'angularX');
                this.addEntityToMenu('routerName3', true, 'angularX', 'routerName3');
            },
            addToModuleStep() {
                this.addEntityToModule(
                    'entityInstance',
                    'entityClass',
                    'entityName',
                    'entityFolderName',
                    'entityFileName',
                    'entityUrl',
                    'angularX',
                    'microServiceName'
                );
                this.addAdminToModule('appName', 'adminAngularName', 'adminFolderName', 'adminFileName', true, 'angularX');
                this.addAngularModule('appName', 'angularName', 'folderName', 'fileName', true, 'angularX');
            }
        };
        return { ...phaseFromJHipster, ...customPhaseSteps };
    }

    get install() {
        return super._install();
    }

    get end() {
        return super._end();
    }
};

describe('needle API Angular: JHipster client generator with blueprint', () => {
    before(done => {
        helpers
            .run(path.join(__dirname, '../../generators/client'))
            .withOptions({
                'from-cli': true,
                build: 'maven',
                auth: 'jwt',
                db: 'mysql',
                skipInstall: true,
                blueprint: 'myblueprint',
                skipChecks: true
            })
            .withGenerators([[mockBlueprintSubGen, 'jhipster-myblueprint:client']])
            .withPrompts({
                baseName: 'jhipster',
                clientFramework: 'angularX',
                enableTranslation: true,
                nativeLanguage: 'en',
                languages: ['fr']
            })
            .on('end', done);
    });

    it('vendor.scss contains the specific change (without comment) added by needle api', () => {
        assert.fileContent(`${CLIENT_MAIN_SRC_DIR}content/scss/vendor.scss`, /@import style_without_comment/);
    });

    it('global.scss contains the specific change (without comment) added by needle api', () => {
        assert.fileContent(`${CLIENT_MAIN_SRC_DIR}content/scss/global.scss`, /@import style_without_comment/);
    });

    it('vendor.scss contains the specific change added by needle api', () => {
        assert.fileContent(`${CLIENT_MAIN_SRC_DIR}content/scss/vendor.scss`, /@import style/);
        assert.fileContent(
            `${CLIENT_MAIN_SRC_DIR}content/scss/vendor.scss`,
            '* ==========================================================================\n' +
                'my comment\n' +
                '========================================================================== */\n'
        );
    });

    it('global.scss contains the specific change added by needle api', () => {
        assert.fileContent(`${CLIENT_MAIN_SRC_DIR}content/scss/global.scss`, /@import style/);
        assert.fileContent(
            `${CLIENT_MAIN_SRC_DIR}content/scss/global.scss`,
            '* ==========================================================================\n' +
                'my comment\n' +
                '========================================================================== */\n'
        );
    });

    it('menu contains the element added by needle api', () => {
        assert.fileContent(
            `${CLIENT_MAIN_SRC_DIR}app/layouts/navbar/navbar.component.html`,
            '            <li class="nav-item" routerLinkActive="active" [routerLinkActiveOptions]="{exact: true}">\n' +
                '                                <a class="nav-link" routerLink="routerName1" (click)="collapseNavbar()">\n' +
                '                                    <fa-icon [icon]="\'glyphiconName1\'" [fixedWidth]="true"></fa-icon>&nbsp;\n' +
                '                                    <span jhiTranslate="global.menu.routerName1">Router Name 1</span>\n' +
                '                                </a>\n' +
                '                            </li>'
        );
    });

    it('admin menu contains the admin element added by needle api', () => {
        assert.fileContent(
            `${CLIENT_MAIN_SRC_DIR}app/layouts/navbar/navbar.component.html`,
            '                    <li>\n' +
                '                        <a class="dropdown-item" routerLink="routerName2" routerLinkActive="active" (click)="collapseNavbar()">\n' +
                '                            <fa-icon [icon]="\'glyphiconName2\'" [fixedWidth]="true"></fa-icon>&nbsp;\n' +
                '                            <span jhiTranslate="global.menu.admin.routerName2">Router Name 2</span>\n' +
                '                        </a>\n' +
                '                    </li>'
        );
    });

    it('entity menu contains the entity added by needle api', () => {
        assert.fileContent(
            `${CLIENT_MAIN_SRC_DIR}app/layouts/navbar/navbar.component.html`,
            '                    <li>\n' +
                '                        <a class="dropdown-item" routerLink="routerName3" routerLinkActive="active" [routerLinkActiveOptions]="{ exact: true }" (click)="collapseNavbar()">\n' +
                '                            <fa-icon icon="asterisk" fixedWidth="true"></fa-icon>\n' +
                '                            <span jhiTranslate="global.menu.entities.routerName3">Router Name 3</span>\n' +
                '                        </a>\n' +
                '                    </li>'
        );
    });

    it('entity module contains the microservice object added by needle api', () => {
        assert.fileContent(
            `${CLIENT_MAIN_SRC_DIR}app/entities/entity.module.ts`,
            '            {\n' +
                "                path: 'entityUrl',\n" +
                "                loadChildren: () => import('./entityFolderName/entityFileName.module').then(m => m.MicroServiceNameentityNameModule)\n" +
                '            }'
        );
    });

    it('admin module contains the import and the module added by needle api', () => {
        assert.fileContent(
            `${CLIENT_MAIN_SRC_DIR}app/admin/admin-routing.module.ts`,
            "import { appNameadminAngularNameModule } from './adminFolderName/adminFileName.module';"
        );
        assert.fileContent(`${CLIENT_MAIN_SRC_DIR}app/admin/admin-routing.module.ts`, 'appNameadminAngularNameModule,');
    });

    it('app module contains the import and the module added by needle api', () => {
        assert.fileContent(
            `${CLIENT_MAIN_SRC_DIR}app/app.module.ts`,
            "import { appNameangularNameModule } from './folderName/fileName.module';"
        );
        assert.fileContent(`${CLIENT_MAIN_SRC_DIR}app/app.module.ts`, 'appNameangularNameModule,');
    });
});
