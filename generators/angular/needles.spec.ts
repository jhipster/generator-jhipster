/**
 * Copyright 2013-2026 the original author or authors from the JHipster project.
 *
 * This file is part of the JHipster project, see https://www.jhipster.tech/
 * for more information.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *      https://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

import { before, describe, it } from 'esmocha';

import { asPostWritingEntitiesTask } from '../base-application/support/task-type-inference.ts';
import { CLIENT_MAIN_SRC_DIR } from '../generator-constants.ts';

import type { Application as AngularApplication, Entity as AngularEntity, Source as AngularSource } from './types.ts';

import { defaultHelpers as helpers, runResult } from '#testing';

const postWritingTask = asPostWritingEntitiesTask<AngularEntity, AngularApplication, AngularSource>(function ({ source, application }) {
  source.addEntitiesToClient({
    application,
    entities: [
      {
        name: 'entityName',
        entityInstance: 'entityInstance',
        entityFolderName: 'entityFolderName',
        entityFileName: 'entityFileName',
        entityUrl: 'entityUrl',
        i18nKeyPrefix: 'entity',
        entityPage: 'entityPage',
        entityTranslationKeyMenuPath: 'entityTranslationKeyMenuPath',
        entityNameHumanized: 'entityNameHumanized',
      } as AngularEntity,
    ],
  });
});

describe('needle API Angular generator : JHipster with blueprint', () => {
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
      `${CLIENT_MAIN_SRC_DIR}app/layouts/navbar/navbar.html`,
      `
            <li>
              <a class="dropdown-item" routerLink="/entityPage" routerLinkActive="active" [routerLinkActiveOptions]="{ exact: true }" (click)="collapseNavbar()">
                <fa-icon icon="asterisk" [fixedWidth]="true" />
                <span jhiTranslate="entityTranslationKeyMenuPath">entityNameHumanized</span>
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
