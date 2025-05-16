import { before, describe, it } from 'esmocha';
import { defaultHelpers as helpers, runResult } from '../../lib/testing/index.js';

import { CLIENT_MAIN_SRC_DIR } from '../generator-constants.js';

import { asPostWritingEntitiesTask } from '../base-application/support/task-type-inference.js';

const postWritingTask = asPostWritingEntitiesTask(function ({ source, application }) {
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
});

describe('needle API Angular angular generator : JHipster with blueprint', () => {
  before(async () => {
    await helpers
      .runJHipster('angular')
      .withJHipsterConfig({
        skipServer: true,
      })
      .withTask('postWriting', postWritingTask);
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
    await helpers.runJHipsterInApplication('jhipster:angular').withTask('postWriting', postWritingTask).withOptions({
      force: false,
    });
  });
});
