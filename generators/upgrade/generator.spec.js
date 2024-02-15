/**
 * Copyright 2013-2024 the original author or authors from the JHipster project.
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
import { basename, dirname } from 'path';
import { fileURLToPath } from 'url';
import { it, describe, expect } from 'esmocha';
import lodash from 'lodash';
import git from 'simple-git';

import Generator from './index.js';
import { shouldSupportFeatures } from '../../test/support/tests.js';
import { basicHelpers as helpers } from '../../test/support/index.js';
import { UPGRADE_BRANCH } from './support/index.js';

const { snakeCase } = lodash;

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const generator = basename(__dirname);

describe(`generator - ${generator}`, () => {
  it('generator-list constant matches folder name', async () => {
    await expect((await import('../generator-list.js'))[`GENERATOR_${snakeCase(generator).toUpperCase()}`]).toBe(generator);
  });
  shouldSupportFeatures(Generator);

  it('should throw without config', async () => {
    await expect(helpers.runJHipster(generator)).rejects.toThrow(
      "Could not find a valid JHipster application configuration, check if the '.yo-rc.json' file exists and if the 'generator-jhipster' key exists inside it.",
    );
  });
  it('should throw without baseName', async () => {
    await expect(helpers.runJHipster(generator).withFiles({ '.yo-rc.json': { 'generator-jhipster': { foo: 'bar' } } })).rejects.toThrow(
      'Current directory does not contain a JHipster project.',
    );
  });
  it('should throw with JHipster less than 7.9.3', async () => {
    await expect(
      helpers
        .runJHipster(generator)
        .withJHipsterConfig()
        .withFiles({
          'package.json': { devDependencies: { 'generator-jhipster': '7.9.3' } },
        }),
    ).rejects.toThrow('Upgrade the project to JHipster 7.9.4 before upgrading to the latest version.');
  });
  it('should throw with dirty git', async () => {
    await expect(
      helpers
        .runJHipster(generator)
        .withJHipsterConfig()
        .withFiles({
          'package.json': { devDependencies: { 'generator-jhipster': '7.9.4' } },
        })
        .commitFiles()
        .onEnvironment(async ctx => {
          await git(ctx.cwd).init().add('package.json').commit('project');
        }),
    ).rejects.toThrow('local changes found.');
  });
  it('should at upgrade branch', async () => {
    await expect(
      helpers
        .runJHipster(generator)
        .withJHipsterConfig()
        .withFiles({
          'package.json': { devDependencies: { 'generator-jhipster': '7.9.4' } },
        })
        .commitFiles()
        .onEnvironment(async ctx => {
          await git(ctx.cwd).init().add('.').commit('project', ['--no-verify']).checkoutLocalBranch(UPGRADE_BRANCH);
        }),
    ).rejects.toThrow('You are on the upgrade branch, please switch to another branch before upgrading.');
  });
});
