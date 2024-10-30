import { before, describe, it } from 'esmocha';
import { basicHelpers as helpers, result as runResult } from '../../lib/testing/index.js';

import { CLIENT_MAIN_SRC_DIR } from '../../generators/generator-constants.js';
import BaseApplicationGenerator from '../../generators/base-application/index.js';
import AngularGenerator from '../../generators/angular/index.js';

const mockBlueprintSubGen = class extends AngularGenerator {
  constructor(args, opts, features) {
    super(args, opts, features);
    this.sbsBlueprint = true;
  }

  get [BaseApplicationGenerator.POST_WRITING]() {
    return this.asPostWritingTaskGroup({
      addCssStylesProperty() {
        this.addMainSCSSStyle('@import style_without_comment;');
        this.addMainSCSSStyle('@import style;', 'my comment');
        this.addVendorSCSSStyle('@import style;', 'my comment');
        this.addVendorSCSSStyle('@import style_without_comment;');
      },
      addToMenuStep() {
        this.addElementToMenu('routerName1', 'iconName1', true);
      },
      addToModuleStep() {
        this.addAngularModule('appName', 'angularName', 'folderName', 'fileName', true);
        this.addAdminRoute('entity-audit', './entity-audit/entity-audit.module', 'EntityAuditModule', 'entityAudit.home.title');
      },
    });
  }
};

describe('needle API Angular: JHipster angular generator with blueprint', () => {
  before(async () => {
    await helpers
      .runJHipster('angular')
      .withJHipsterConfig({
        skipServer: true,
      })
      .withOptions({
        blueprint: ['myblueprint'],
      })
      .withGenerators([[mockBlueprintSubGen, { namespace: 'jhipster-myblueprint:angular' }]]);
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
        '========================================================================== */\n',
    );
  });

  it('global.scss contains the specific change added by needle api', () => {
    runResult.assertFileContent(`${CLIENT_MAIN_SRC_DIR}content/scss/global.scss`, /\n@import style;\n/);
    runResult.assertFileContent(
      `${CLIENT_MAIN_SRC_DIR}content/scss/global.scss`,
      '* ==========================================================================\n' +
        'my comment\n' +
        '========================================================================== */\n',
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
`,
    );
  });

  it('icon imports contains a new icon added by a new menu method of needle api ', () => {
    runResult.assertFileContent(`${CLIENT_MAIN_SRC_DIR}app/config/font-awesome-icons.ts`, '  faIconName1');
  });

  it('admin routes contains the routing added by needle api', () => {
    runResult.assertFileContent(
      `${CLIENT_MAIN_SRC_DIR}app/admin/admin.routes.ts`,
      '  },\n' +
        '  {\n' +
        "    path: 'entity-audit',\n" +
        "    data: { pageTitle: 'entityAudit.home.title' },\n" +
        "    loadChildren: () => import('./entity-audit/entity-audit.module').then(m => m.EntityAuditModule),\n" +
        '  },',
    );
  });

  it('app module contains the import and the module added by needle api', () => {
    runResult.assertFileContent(
      `${CLIENT_MAIN_SRC_DIR}app/app.config.ts`,
      "import { appNameangularNameModule } from './folderName/fileName.module';",
    );
    runResult.assertFileContent(`${CLIENT_MAIN_SRC_DIR}app/app.config.ts`, 'appNameangularNameModule,');
  });
});
