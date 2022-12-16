import assert from 'yeoman-assert';
import helpers from 'yeoman-test';
import { getGenerator } from '../support/index.mjs';

import ClientGenerator from '../../generators/client/index.mjs';
import constants from '../../generators/generator-constants.cjs';

const ANGULAR = constants.SUPPORTED_CLIENT_FRAMEWORKS.ANGULAR;
const CLIENT_MAIN_SRC_DIR = constants.CLIENT_MAIN_SRC_DIR;

const mockBlueprintSubGen = class extends ClientGenerator {
  constructor(args, opts, features) {
    super(args, opts, features);
    this.sbsBlueprint = true;
  }

  get [ClientGenerator.POST_WRITING]() {
    return {
      addCssStylesProperty() {
        this.addMainSCSSStyle('@import style_without_comment;');
        this.addMainSCSSStyle('@import style;', 'my comment');
        this.addVendorSCSSStyle('@import style;', 'my comment');
        this.addVendorSCSSStyle('@import style_without_comment;');
      },
      addToMenuStep() {
        this.addElementToMenu('routerName1', 'iconName1', true, ANGULAR);
        this.addElementToAdminMenu('routerName2', 'iconName2', true, ANGULAR);
        this.addEntityToMenu('routerName3', true, ANGULAR, 'routerName3');
      },
      addToModuleStep() {
        this.addEntityToModule(
          'entityInstance',
          'entityClass',
          'entityName',
          'entityFolderName',
          'entityFileName',
          'entityUrl',
          ANGULAR,
          'microserviceName',
          false,
          'entity.home.title'
        );
        this.addAdminToModule('appName', 'adminAngularName', 'adminFolderName', 'adminFileName', true, ANGULAR);
        this.addAngularModule('appName', 'angularName', 'folderName', 'fileName', true, ANGULAR);
        this.addAdminRoute('entity-audit', './entity-audit/entity-audit.module', 'EntityAuditModule', 'entityAudit.home.title');
      },
    };
  }
};

describe('needle API Angular: JHipster client generator with blueprint', () => {
  let runContext;
  let runResult;

  before(async () => {
    runContext = helpers.create(getGenerator('client'));
    runResult = await runContext
      .withOptions({
        defaults: true,
        skipInstall: true,
        blueprint: 'myblueprint',
        skipChecks: true,
      })
      .withGenerators([[mockBlueprintSubGen, 'jhipster-myblueprint:client']])
      .run();
  });

  it('should bail on any file change adding same needles again', async () => {
    await runResult
      .create('jhipster-myblueprint:client')
      .withGenerators([[mockBlueprintSubGen, 'jhipster-myblueprint:client']])
      .withOptions({ force: false, bail: true, skipChecks: true, skipInstall: true })
      .run();
  });

  it('vendor.scss contains the specific change (without comment) added by needle api', () => {
    assert.fileContent(`${CLIENT_MAIN_SRC_DIR}content/scss/vendor.scss`, /\n@import style_without_comment;\n/);
  });

  it('global.scss contains the specific change (without comment) added by needle api', () => {
    assert.fileContent(`${CLIENT_MAIN_SRC_DIR}content/scss/global.scss`, /\n@import style_without_comment;\n/);
  });

  it('vendor.scss contains the specific change added by needle api', () => {
    assert.fileContent(`${CLIENT_MAIN_SRC_DIR}content/scss/vendor.scss`, /\n@import style;\n/);
    assert.fileContent(
      `${CLIENT_MAIN_SRC_DIR}content/scss/vendor.scss`,
      '* ==========================================================================\n' +
        'my comment\n' +
        '========================================================================== */\n'
    );
  });

  it('global.scss contains the specific change added by needle api', () => {
    assert.fileContent(`${CLIENT_MAIN_SRC_DIR}content/scss/global.scss`, /\n@import style;\n/);
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
      `
        <li class="nav-item" routerLinkActive="active" [routerLinkActiveOptions]="{ exact: true }">
          <a class="nav-link" routerLink="routerName1" (click)="collapseNavbar()">
            <fa-icon icon="iconName1" [fixedWidth]="true"></fa-icon>
            <span jhiTranslate="global.menu.routerName1">Router Name 1</span>
          </a>
        </li>
`
    );
  });

  it('icon imports contains a new icon added by a new menu method of needle api ', () => {
    assert.fileContent(`${CLIENT_MAIN_SRC_DIR}app/config/font-awesome-icons.ts`, '  faIconName1');
  });

  it('admin menu contains the admin element added by needle api', () => {
    assert.fileContent(
      `${CLIENT_MAIN_SRC_DIR}app/layouts/navbar/navbar.component.html`,
      `
            <li>
              <a class="dropdown-item" routerLink="routerName2" routerLinkActive="active" (click)="collapseNavbar()">
                <fa-icon icon="iconName2" [fixedWidth]="true"></fa-icon>
                <span jhiTranslate="global.menu.admin.routerName2">Router Name 2</span>
              </a>
            </li>
`
    );
  });

  it('icon imports contains a new icon added by a new admin menu method of needle api ', () => {
    assert.fileContent(`${CLIENT_MAIN_SRC_DIR}app/config/font-awesome-icons.ts`, '  faIconName2');
  });

  it('entity menu contains the entity added by needle api', () => {
    assert.fileContent(
      `${CLIENT_MAIN_SRC_DIR}app/layouts/navbar/navbar.component.html`,
      `
            <li>
              <a
                class="dropdown-item"
                routerLink="routerName3"
                routerLinkActive="active"
                [routerLinkActiveOptions]="{ exact: true }"
                (click)="collapseNavbar()"
              >
                <fa-icon icon="asterisk" [fixedWidth]="true"></fa-icon>
                <span jhiTranslate="global.menu.entities.routerName3">Router Name 3</span>
              </a>
            </li>
`
    );
  });

  it('entity module contains the microservice object added by needle api', () => {
    assert.fileContent(
      `${CLIENT_MAIN_SRC_DIR}app/entities/entity-routing.module.ts`,
      '      {\n' +
        "        path: 'entityUrl',\n" +
        "        data: { pageTitle: 'entity.home.title' },\n" +
        "        loadChildren: () => import('./entityFolderName/entityFileName.routes'),\n" +
        '      }'
    );
  });

  it('admin module contains the import and the module added by needle api', () => {
    assert.fileContent(
      `${CLIENT_MAIN_SRC_DIR}app/admin/admin-routing.module.ts`,
      "import { appNameadminAngularNameModule } from './adminFolderName/adminFileName.module';"
    );
    assert.fileContent(`${CLIENT_MAIN_SRC_DIR}app/admin/admin-routing.module.ts`, 'appNameadminAngularNameModule,');
  });

  it('admin module contains the routing added by needle api', () => {
    assert.fileContent(
      `${CLIENT_MAIN_SRC_DIR}app/admin/admin-routing.module.ts`,
      '      },\n' +
        '      {\n' +
        "        path: 'entity-audit',\n" +
        "        data: { pageTitle: 'entityAudit.home.title' },\n" +
        "        loadChildren: () => import('./entity-audit/entity-audit.module').then(m => m.EntityAuditModule),\n" +
        '      },'
    );
  });

  it('app module contains the import and the module added by needle api', () => {
    assert.fileContent(
      `${CLIENT_MAIN_SRC_DIR}app/app.module.ts`,
      "import { appNameangularNameModule } from './folderName/fileName.module';"
    );
    assert.fileContent(`${CLIENT_MAIN_SRC_DIR}app/app.module.ts`, 'appNameangularNameModule,');
  });
});
