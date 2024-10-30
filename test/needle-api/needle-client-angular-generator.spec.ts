import { before, describe, it } from 'esmocha';
import { defaultHelpers as helpers, runResult } from '../../lib/testing/index.js';

import AngularGenerator from '../../generators/angular/index.js';
import { CLIENT_MAIN_SRC_DIR } from '../../generators/generator-constants.js';

import BaseApplicationGenerator from '../../generators/base-application/index.js';

const mockAngularBlueprintSubGen = class extends AngularGenerator {
  constructor(args, opts, features) {
    super(args, opts, { ...features, sbsBlueprint: true });
  }

  get [BaseApplicationGenerator.POST_WRITING_ENTITIES]() {
    return this.asPostWritingEntitiesTaskGroup({
      addToMenuStep() {
        this.addElementToAdminMenu('routerName2', 'iconName2', true);
      },
      addToModuleStep({ source, application }) {
        source.addEntitiesToClient({
          application,
          entities: [
            {
              name: 'entityName',
              entityInstance: 'entityInstance',
              entityClass: 'entityClass',
              entityFolderName: 'entityFolderName',
              entityFileName: 'entityFileName',
              entityUrl: 'entityUrl',
              i18nKeyPrefix: 'entity',
              entityPage: 'entityPage',
              entityTranslationKeyMenu: 'entityTranslationKeyMenu',
              entityClassHumanized: 'entityClassHumanized',
            } as any,
          ],
        });
      },
    });
  }
};

describe('needle API Angular angular generator : JHipster with blueprint', () => {
  before(async () => {
    await helpers
      .runJHipster('angular')
      .withJHipsterConfig({
        skipServer: true,
      })
      .withOptions({
        blueprint: ['myblueprint2'],
      })
      .withGenerators([[mockAngularBlueprintSubGen, { namespace: 'jhipster-myblueprint2:angular' }]]);
  });

  it('entity menu contains the entity added by needle api', () => {
    runResult.assertFileContent(
      `${CLIENT_MAIN_SRC_DIR}app/layouts/navbar/navbar.component.html`,
      `
            <li>
              <a class="dropdown-item" routerLink="/entityPage" routerLinkActive="active" [routerLinkActiveOptions]="{ exact: true }" (click)="collapseNavbar()">
                <fa-icon icon="asterisk" [fixedWidth]="true"></fa-icon>
                <span jhiTranslate="global.menu.entities.entityTranslationKeyMenu">entityClassHumanized</span>
              </a>
            </li>
`,
    );
  });

  it('admin menu contains the admin element added by needle api', () => {
    runResult.assertFileContent(
      `${CLIENT_MAIN_SRC_DIR}app/layouts/navbar/navbar.component.html`,
      `
          <li>
                        <a class="dropdown-item" routerLink="/routerName2" routerLinkActive="active" (click)="collapseNavbar()">
                            <fa-icon icon="iconName2" [fixedWidth]="true"></fa-icon>
                            <span jhiTranslate="global.menu.admin.routerName2">Router Name 2</span>
                        </a>
                    </li>
`,
    );
  });

  it('icon imports contains a new icon added by a new admin menu method of needle api ', () => {
    runResult.assertFileContent(`${CLIENT_MAIN_SRC_DIR}app/config/font-awesome-icons.ts`, '  faIconName2');
  });

  it('entity module contains the microservice object added by needle api', () => {
    runResult.assertFileContent(
      `${CLIENT_MAIN_SRC_DIR}app/entities/entity.routes.ts`,
      '  {\n' +
        "    path: 'entityUrl',\n" +
        "    data: { pageTitle: 'entity.home.title' },\n" +
        "    loadChildren: () => import('./entityFolderName/entityFileName.routes'),\n" +
        '  }',
    );
  });
  it('should bail on any file change adding same needles again', async () => {
    await helpers
      .runJHipsterInApplication('jhipster:angular')
      .withGenerators([[mockAngularBlueprintSubGen, { namespace: 'jhipster-myblueprint2:angular' }]])
      .withOptions({
        blueprint: ['myblueprint2'],
        force: false,
      });
  });
});
