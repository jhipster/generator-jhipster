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
import { basename, join } from 'node:path';

import { CONTEXT_DATA_APPLICATION_KEY } from '../base-simple-application/support/index.ts';

import Generator from './generator.ts';

import { shouldSupportFeatures, testBlueprintSupport } from '#test-support';
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

  describe('with an application of a type of a blueprint', () => {
    it('keeps the application with a package.json in the workspaces', async () => {
      await helpers
        .runJHipster(generator)
        .withOptions({ workspaces: true, monorepository: true, workspacesFolders: ['gateway', 'mobile'] })
        .withJHipsterConfig({ baseName: 'workspaces' })
        .withWorkspaceApplicationAtFolder('gateway', { baseName: 'gateway', applicationType: 'gateway' })
        .withWorkspaceApplicationAtFolder('mobile', { baseName: 'mobile', applicationType: 'expo' })
        .withFiles({ 'mobile/package.json': { name: 'mobile' } });

      result.assertJsonFileContent('package.json', {
        workspaces: { packages: ['gateway', 'mobile'] },
        scripts: { 'docker:build': 'concurrently npm:docker:build:gateway npm:docker:build:mobile' },
      });
    });

    it('keeps the application with node dependencies in the workspaces', async () => {
      await helpers
        .runJHipster(generator)
        .withOptions({ workspaces: true, monorepository: true, workspacesFolders: ['gateway', 'mobile'] })
        .withJHipsterConfig({ baseName: 'workspaces' })
        .withWorkspaceApplicationAtFolder('gateway', { baseName: 'gateway', applicationType: 'gateway' })
        .withWorkspaceApplicationAtFolder('mobile', { baseName: 'mobile', applicationType: 'expo' })
        // The application its blueprint bootstraps, with the javascript-simple-application bootstrap, before its package.json is written.
        .onEnvironment(env => {
          env.getContextMap(join(env.cwd, 'mobile')).set(CONTEXT_DATA_APPLICATION_KEY, { applicationType: 'expo', nodeDependencies: {} });
        });

      result.assertJsonFileContent('package.json', {
        workspaces: { packages: ['gateway', 'mobile'] },
        scripts: { 'docker:build': 'concurrently npm:docker:build:gateway npm:docker:build:mobile' },
      });
    });

    describe('without a package.json', () => {
      before(async () => {
        await helpers
          .runJHipster(generator)
          // The application of the blueprint first: the dependencies of the workspaces are looked up in the applications in order.
          .withOptions({ workspaces: true, monorepository: true, workspacesFolders: ['mobile', 'gateway'] })
          .withJHipsterConfig({ baseName: 'workspaces' })
          .withWorkspaceApplicationAtFolder('mobile', { baseName: 'mobile', applicationType: 'flutter' })
          .withWorkspaceApplicationAtFolder('gateway', { baseName: 'gateway', applicationType: 'gateway' });
      });

      it('leaves the application out of the npm workspaces and their scripts', () => {
        result.assertJsonFileContent('package.json', {
          workspaces: { packages: ['gateway'] },
          scripts: {
            'docker:build': 'concurrently npm:docker:build:gateway',
            'docker:build:gateway': 'npm run docker:build --workspace gateway --if-present',
          },
        });
        result.assertNoFileContent('package.json', /--workspace mobile/);
      });
    });
  });

  describe('with applications', () => {
    it('builds the Docker images of the applications with their docker:build scripts', async () => {
      await helpers
        .runJHipster(generator)
        .withOptions({ workspaces: true, monorepository: true, workspacesFolders: ['gateway', 'micro1'] })
        .withJHipsterConfig({ baseName: 'workspaces' })
        .withWorkspaceApplicationAtFolder('gateway', { baseName: 'gateway', applicationType: 'gateway' })
        .withWorkspaceApplicationAtFolder('micro1', { baseName: 'micro1', applicationType: 'microservice' });

      result.assertJsonFileContent('package.json', {
        scripts: {
          'docker:build': 'concurrently npm:docker:build:gateway npm:docker:build:micro1',
          'docker:build:gateway': 'npm run docker:build --workspace gateway --if-present',
        },
      });
    });
  });
});
