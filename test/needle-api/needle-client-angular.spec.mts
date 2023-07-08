import { basicHelpers as helpers, result as runResult } from '../support/index.mjs';
import { getGenerator } from '../support/index.mjs';
import { clientFrameworkTypes } from '../../jdl/jhipster/index.mjs';

import { CLIENT_MAIN_SRC_DIR } from '../../generators/generator-constants.mjs';
import BaseApplicationGenerator from '../../generators/base-application/index.mjs';
import AngularGenerator from '../../generators/angular/index.mjs';

const { ANGULAR } = clientFrameworkTypes;

const mockBlueprintSubGen = class extends AngularGenerator {
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

describe('needle API Angular: JHipster angular generator with blueprint', () => {
  before(async () => {
    await helpers
      .create(getGenerator('angular'))
      .withJHipsterConfig()
      .withOptions({
        blueprint: 'myblueprint',
        skipServer: true,
      })
      .withGenerators([[mockBlueprintSubGen, { namespace: 'jhipster-myblueprint:angular' }]])
      .run();
  });

  it('vendor.scss contains the specific change (without comment) added by needle api', () => {
    runResult.assertFileContent(`${CLIENT_MAIN_SRC_DIR}content/scss/vendor.scss`, /\n@import style_without_comment;\n/);
  });

  it('global.scss contains the specific change (without comment) added by needle api', () => {
    runResult.assertFileContent(`${CLIENT_MAIN_SRC_DIR}content/scss/global.scss`, /\n@import style_without_comment;\n/);
  });

  it('vendor.scss contains the specific change added by needle api', () => {
    runResult.assertFileContent(`${CLIENT_MAIN_SRC_DIR}content/scss/vendor.scss`, /\n@import style;\n/);
    runResult.assertFileContent(
      `${CLIENT_MAIN_SRC_DIR}content/scss/vendor.scss`,
      '* ==========================================================================\n' +
        'my comment\n' +
        '========================================================================== */\n'
    );
  });

  it('global.scss contains the specific change added by needle api', () => {
    runResult.assertFileContent(`${CLIENT_MAIN_SRC_DIR}content/scss/global.scss`, /\n@import style;\n/);
    runResult.assertFileContent(
      `${CLIENT_MAIN_SRC_DIR}content/scss/global.scss`,
      '* ==========================================================================\n' +
        'my comment\n' +
        '========================================================================== */\n'
    );
  });

  it('menu contains the element added by needle api', () => {
    runResult.assertFileContent(
      `${CLIENT_MAIN_SRC_DIR}app/layouts/navbar/navbar.component.html`,
      `
        <li class="nav-item" routerLinkActive="active" [routerLinkActiveOptions]="{ exact: true }">
          <a class="nav-link" routerLink="/routerName1" (click)="collapseNavbar()">
            <fa-icon icon="iconName1" [fixedWidth]="true"></fa-icon>
            <span jhiTranslate="global.menu.routerName1">Router Name 1</span>
          </a>
        </li>
`
    );
  });

  it('icon imports contains a new icon added by a new menu method of needle api ', () => {
    runResult.assertFileContent(`${CLIENT_MAIN_SRC_DIR}app/config/font-awesome-icons.ts`, '  faIconName1');
  });

  it('admin module contains the import and the module added by needle api', () => {
    runResult.assertFileContent(
      `${CLIENT_MAIN_SRC_DIR}app/admin/admin-routing.module.ts`,
      "import { appNameadminAngularNameModule } from './adminFolderName/adminFileName.module';"
    );
    runResult.assertFileContent(`${CLIENT_MAIN_SRC_DIR}app/admin/admin-routing.module.ts`, 'appNameadminAngularNameModule,');
  });

  it('admin module contains the routing added by needle api', () => {
    runResult.assertFileContent(
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
    runResult.assertFileContent(
      `${CLIENT_MAIN_SRC_DIR}app/app.module.ts`,
      "import { appNameangularNameModule } from './folderName/fileName.module';"
    );
    runResult.assertFileContent(`${CLIENT_MAIN_SRC_DIR}app/app.module.ts`, 'appNameangularNameModule,');
  });
});
