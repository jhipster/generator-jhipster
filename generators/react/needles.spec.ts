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

import { before, describe, it } from 'expect-node';

import { asPostWritingTask } from '../base-application/support/task-type-inference.ts';
import type { Application as ClientApplication, Entity as ClientEntity } from '../client/index.ts';
import { CLIENT_MAIN_SRC_DIR } from '../generator-constants.ts';

import { basicHelpers as helpers, result as runResult } from '#testing';

const addAboutTask = asPostWritingTask<ClientEntity, ClientApplication>(function ({ source }) {
  source.addItemToAccountMenu!({ route: 'about', translationKey: 'global.menu.about', name: 'About', icon: 'circle-info' });
});

describe('needle API React: an item added to the account menu', () => {
  before(() =>
    helpers
      .runJHipster('react')
      .withJHipsterConfig({
        clientFramework: 'react',
        skipServer: true,
      })
      .withTask('postWriting', addAboutTask),
  );

  it('adds the item before the account menu needle', () => {
    runResult.assertFileContent(
      `${CLIENT_MAIN_SRC_DIR}app/shared/layout/menus/account.tsx`,
      `
    <MenuItem icon="circle-info" to="/about">
      <Translate contentKey="global.menu.about">About</Translate>
    </MenuItem>
    {/* jhipster-needle-add-element-to-account-menu`,
    );
  });

  it('imports the icon and adds it to the library', () => {
    runResult.assertFileContent(
      `${CLIENT_MAIN_SRC_DIR}app/config/icon-loader.ts`,
      /^ {2}faCircleInfo,\n {2}\/\/ jhipster-needle-add-icon-import$/m,
    );
    runResult.assertFileContent(
      `${CLIENT_MAIN_SRC_DIR}app/config/icon-loader.ts`,
      /^ {4}faCircleInfo,\n {4}\/\/ jhipster-needle-add-icon-import$/m,
    );
  });

  it('should bail on any file change adding the same item again', async () => {
    await helpers.runJHipsterInApplication('jhipster:react').withTask('postWriting', addAboutTask).withOptions({ force: false });
  });
});
