import assert from 'yeoman-assert';
import helpers from 'yeoman-test';
import { getGenerator } from '../support/index.mjs';
import { clientFrameworkTypes } from '../../jdl/jhipster/index.mjs';

import ClientGenerator from '../../generators/client/index.mjs';
import { CLIENT_MAIN_SRC_DIR } from '../../generators/generator-constants.mjs';
import BaseApplicationGenerator from '../../generators/base-application/index.mjs';

const { ANGULAR } = clientFrameworkTypes;

const mockBlueprintSubGen = class extends ClientGenerator {
  constructor(args, opts, features) {
    super(args, opts, features);
    this.sbsBlueprint = true;
  }

  get [BaseApplicationGenerator.POST_WRITING]() {
    return {
      addCssStylesProperty() {
        this.addMainSCSSStyle('@import style_without_comment;');
        this.addMainSCSSStyle('@import style;', 'my comment');
        this.addVendorSCSSStyle('@import style;', 'my comment');
        this.addVendorSCSSStyle('@import style_without_comment;');
      },
      addToMenuStep() {
        this.addElementToMenu('routerName1', 'iconName1', true, ANGULAR);
      },
      addToModuleStep() {
        this.addAdminToModule('appName', 'adminAngularName', 'adminFolderName', 'adminFileName', true, ANGULAR);
        this.addAngularModule('appName', 'angularName', 'folderName', 'fileName', true, ANGULAR);
        this.addAdminRoute('entity-audit', './entity-audit/entity-audit.module', 'EntityAuditModule', 'entityAudit.home.title');
      },
    };
  }
};

describe('needle API Client for Angular: JHipster client generator with blueprint', () => {
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
        skipServer: true,
      })
      .withGenerators([[mockBlueprintSubGen, 'jhipster-myblueprint:client']])
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
