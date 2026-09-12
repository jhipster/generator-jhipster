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
import { describe, expect, it } from 'esmocha';
import { basename } from 'node:path';

import { shouldSupportFeatures, testBlueprintSupport } from '../../test/support/tests.ts';

import Generator from './generator.ts';

import { defaultHelpers as helpers, result } from '#testing';

const generator = basename(import.meta.dirname);

describe(`generator - ${generator}`, () => {
  shouldSupportFeatures(Generator);
  describe('blueprint support', () => testBlueprintSupport(generator));

  describe('with a deployment configuration', () => {
    it('adds the docker compose scripts when the deployment is only in the in-memory file system', async () => {
      await helpers
        .runJHipster(generator)
        .withOptions({ workspaces: true, monorepository: true })
        .withJHipsterConfig({ baseName: 'workspaces' })
        .withWorkspaceApplicationAtFolder('gateway', { baseName: 'gateway', applicationType: 'gateway' })
        .withWorkspaceApplicationAtFolder('micro1', { baseName: 'micro1', applicationType: 'microservice' })
        .onGenerator(generator => {
          // The jdl generator writes the deployment configuration through the in-memory file system, it only reaches
          // the disk at the commit, after this generator has run.
          generator.fs.writeJSON(generator.destinationPath('docker-compose', '.yo-rc.json'), {
            'generator-jhipster': { deploymentType: 'docker-compose', appsFolders: ['gateway', 'micro1'] },
          });
        });

      result.assertJsonFileContent('package.json', {
        scripts: {
          'ci:e2e:prepare': 'npm run docker-compose',
          'ci:e2e:teardown': 'docker compose -f docker-compose/docker-compose.yml down -v',
        },
      });
    });
  });

  it('bootstrap migration', async () => {
    await helpers
      .runJHipster('jhipster:bootstrap-application-base')
      .prepareEnvironment()
      .withMockedGenerators(['jhipster:base-application:bootstrap']);
    expect(result.getComposedGenerators()).toContain('jhipster:base-application:bootstrap');
  });
});
