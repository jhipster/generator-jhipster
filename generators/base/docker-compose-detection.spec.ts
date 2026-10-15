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

import { after, before, describe, expect, it } from 'esmocha';
import childProcess from 'node:child_process';
import { syncBuiltinESMExports } from 'node:module';

import BaseGenerator from './index.ts';

import { defaultHelpers as helpers } from '#testing';

describe('generator - base - docker compose detection', () => {
  const originalSpawnSync = childProcess.spawnSync;
  let dockerCalls = 0;

  before(() => {
    // execa runs `docker compose version` through spawnSync: count the calls, running them as they are.
    childProcess.spawnSync = ((file: string, ...args: any[]) => {
      if (file === 'docker') dockerCalls++;
      return (originalSpawnSync as any)(file, ...args);
    }) as typeof childProcess.spawnSync;
    syncBuiltinESMExports();
  });

  after(() => {
    childProcess.spawnSync = originalSpawnSync;
    syncBuiltinESMExports();
  });

  // First: the answer is kept for the process once detected.
  it('does not detect docker compose with skipChecks', async () => {
    // The test helpers pass skipChecks.
    await helpers
      .runJHipster('spring-boot')
      .withJHipsterConfig({ prodDatabaseType: 'postgresql' })
      .withMockedJHipsterGenerators()
      .withSharedApplication({ dockerServices: ['postgresql'] })
      .withSkipWritingPriorities();
    expect(dockerCalls).toBe(0);
  });

  it('detects docker compose once for the generations of the process', async () => {
    const CheckingGenerator = class extends BaseGenerator {
      get [BaseGenerator.END]() {
        return this.asEndTaskGroup({
          check({ control }) {
            expect(typeof control.environmentHasDockerCompose).toBe('boolean');
          },
        });
      }
    };
    // Another spec of the process may have detected it already.
    const callsBefore = dockerCalls;
    await helpers.run(CheckingGenerator).withJHipsterGenerators({ useDefaultMocks: true });
    await helpers.run(CheckingGenerator).withJHipsterGenerators({ useDefaultMocks: true });
    expect(dockerCalls - callsBefore).toBeLessThanOrEqual(1);
  });
});
