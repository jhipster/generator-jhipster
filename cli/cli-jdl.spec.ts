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

import { describe, it } from 'esmocha';
import { join } from 'node:path';

import { execa } from 'execa';

import { getPackageRoot } from '../lib/index.ts';

import { basicHelpers as helpers, runResult } from '#testing';

const jhipsterCli = join(getPackageRoot(), 'bin/jhipster.cjs');

describe('allows customizing JDL definitions', () => {
  it('accepts a custom JDL definition', async () => {
    await helpers
      .prepareTemporaryDir()
      .withFiles({
        '.blueprint/app/index.mjs': `export const command = {
  configs: {
    fooConfig: {
      jdl: {
        type: 'boolean',
        tokenType: 'BOOLEAN',
      },
      scope: 'storage',
    },
  },
};`,
      })
      .commitFiles();
    await execa(jhipsterCli, ['jdl', '--json-only', '--inline', 'application { config { fooConfig false } }'], { stdio: 'pipe' });
    runResult.assertJsonFileContent('.yo-rc.json', {
      'generator-jhipster': {
        fooConfig: false,
      },
    });
  });
});
