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

import { before, describe, expect, it } from 'expect-node';

import { CLIENT_MAIN_SRC_DIR } from '../generator-constants.ts';

import type { Application as ClientApplication } from './index.ts';

import { basicHelpers as helpers, result as runResult } from '#testing';

const pageFiles = {
  angular: [`${CLIENT_MAIN_SRC_DIR}app/home/home.html`, `${CLIENT_MAIN_SRC_DIR}app/account/register/register.html`],
  react: [`${CLIENT_MAIN_SRC_DIR}app/modules/home/home.tsx`, `${CLIENT_MAIN_SRC_DIR}app/modules/account/register/register.tsx`],
  vue: [`${CLIENT_MAIN_SRC_DIR}app/home/home.vue`, `${CLIENT_MAIN_SRC_DIR}app/account/register/register.vue`],
} as const;

const withAccounts =
  (clientDefaultAccounts: ClientApplication['clientDefaultAccounts']) =>
  ({ application }: { application: ClientApplication }) => {
    application.clientDefaultAccounts = clientDefaultAccounts;
  };

// The account list is an input of the generator, which the tests of the generated application cannot change.
for (const clientFramework of ['angular', 'react', 'vue'] as const) {
  describe(`client default accounts: ${clientFramework}`, () => {
    describe('with the accounts of the application', () => {
      before(() =>
        helpers
          .runJHipster(clientFramework)
          .withJHipsterConfig({ clientFramework, skipServer: true })
          .withTask('preparing', withAccounts([{ login: 'owner', password: 'secret', admin: true }])),
      );

      for (const file of pageFiles[clientFramework]) {
        it(`suggests the accounts of the application in ${file}`, () => {
          const content = runResult.fs.read(`${runResult.cwd}/${file}`);
          expect(content).toContain('global.messages.info.authenticated.suffix');
          expect(content.match(/global\.messages\.info\.authenticated\.adminAccount/g)).toHaveLength(1);
          expect(content).not.toContain('global.messages.info.authenticated.userAccount');
          expect(content).toMatch(/login: 'owner', password: 'secret'/);
        });
      }
    });

    describe('without accounts', () => {
      before(() =>
        helpers
          .runJHipster(clientFramework)
          .withJHipsterConfig({ clientFramework, skipServer: true })
          .withTask('preparing', withAccounts([])),
      );

      for (const file of pageFiles[clientFramework]) {
        it(`keeps the sign in link without suggesting accounts in ${file}`, () => {
          const content = runResult.fs.read(`${runResult.cwd}/${file}`);
          expect(content).toContain('global.messages.info.authenticated.link');
          expect(content).not.toContain('global.messages.info.authenticated.suffix');
          expect(content).not.toMatch(/global\.messages\.info\.authenticated\.(admin|user)Account/);
        });
      }
    });
  });
}

describe('client default accounts: in memory credentials', () => {
  before(() => helpers.runJHipster('angular').withJHipsterConfig({ authenticationType: 'jwt', skipUserManagement: true }));

  it('suggests the admin alone, which is the user too', () => {
    const content = runResult.fs.read(`${runResult.cwd}/${CLIENT_MAIN_SRC_DIR}app/home/home.html`);
    expect(content.match(/global\.messages\.info\.authenticated\.adminAccount/g)).toHaveLength(1);
    expect(content).not.toContain('global.messages.info.authenticated.userAccount');
  });
});
