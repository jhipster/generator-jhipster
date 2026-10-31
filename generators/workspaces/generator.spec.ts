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
import { basename } from 'node:path';

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
    it('keeps the application in the workspaces', async () => {
      await helpers
        .runJHipster(generator)
        .withOptions({ workspaces: true, monorepository: true, workspacesFolders: ['gateway', 'mobile'] })
        .withJHipsterConfig({ baseName: 'workspaces' })
        .withWorkspaceApplicationAtFolder('gateway', { baseName: 'gateway', applicationType: 'gateway' })
        .withWorkspaceApplicationAtFolder('mobile', { baseName: 'mobile', applicationType: 'expo' });

      result.assertJsonFileContent('package.json', { workspaces: { packages: ['gateway', 'mobile'] } });
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

  describe('with defaults', () => {
    before(async () => {
      await helpers
        .runJHipster(generator)
        .withOptions({ workspaces: true, monorepository: true, workspacesFolders: ['gateway', 'micro1'] })
        .withJHipsterConfig({ baseName: 'workspaces' })
        .withWorkspaceApplicationAtFolder('gateway', { baseName: 'gateway', applicationType: 'gateway' })
        .withWorkspaceApplicationAtFolder('micro1', { baseName: 'micro1', applicationType: 'microservice' })
        .withFiles({ 'gateway/package.json': { allowScripts: { cypress: true }, overrides: { foo: '1.0.0' } } });
    });

    it('writes the workspaces, the overrides and the approved scripts to package.json', () => {
      result.assertNoFile('pnpm-workspace.yaml');
      result.assertJsonFileContent('package.json', {
        workspaces: { packages: ['gateway', 'micro1'] },
        overrides: { foo: '1.0.0' },
        allowScripts: { cypress: true },
      });
    });

    it('declares the npm version of the applications as the package manager', () => {
      result.assertJsonFileContent('package.json', { packageManager: 'npm@NPM_VERSION' });
    });

    it('runs the scripts of the workspaces with npm', () => {
      result.assertJsonFileContent('package.json', {
        scripts: {
          'ci:backend:test': 'npm run ci:backend:test --workspaces --if-present',
          'docker:build': 'concurrently npm:docker:build:gateway npm:docker:build:micro1',
          'docker:build:gateway': 'npm run docker:build --workspace gateway --if-present',
        },
      });
    });
  });

  describe('with pnpm', () => {
    before(async () => {
      await helpers
        .runJHipster(generator)
        .withOptions({ workspaces: true, monorepository: true, workspacesFolders: ['gateway', 'micro1'], nodePackageManager: 'pnpm' })
        .withJHipsterConfig({ baseName: 'workspaces' })
        .withWorkspaceApplicationAtFolder('gateway', { baseName: 'gateway', applicationType: 'gateway' })
        .withWorkspaceApplicationAtFolder('micro1', { baseName: 'micro1', applicationType: 'microservice' })
        .withFiles({ 'gateway/package.json': { allowScripts: { cypress: true }, overrides: { foo: '1.0.0' } } });
    });

    it('writes the workspaces, the overrides and the approved builds to pnpm-workspace.yaml', () => {
      result.assertFileContent('pnpm-workspace.yaml', /packages:\n {2}- gateway\n {2}- micro1\n/);
      result.assertFileContent('pnpm-workspace.yaml', /strictDepBuilds: false\n/);
      result.assertFileContent('pnpm-workspace.yaml', /overrides:\n {2}foo: 1\.0\.0\n/);
      result.assertFileContent('pnpm-workspace.yaml', /allowBuilds:\n {2}cypress: true\n/);
      const packageJson = result.fs.readJSON(`${result.cwd}/package.json`) as Record<string, unknown>;
      expect(packageJson).not.toHaveProperty('workspaces');
      expect(packageJson).not.toHaveProperty('overrides');
      expect(packageJson).not.toHaveProperty('allowScripts');
    });

    it('declares the pnpm version of the applications as the package manager', () => {
      result.assertJsonFileContent('package.json', { packageManager: 'pnpm@PNPM_VERSION' });
    });

    it('runs the scripts of the workspaces with pnpm', () => {
      result.assertJsonFileContent('package.json', {
        scripts: {
          'ci:backend:test': 'pnpm -r --workspace-concurrency=1 --if-present run ci:backend:test',
          'docker:build': 'concurrently pnpm:docker:build:gateway pnpm:docker:build:micro1',
          'docker:build:gateway': 'pnpm --filter ./gateway --if-present run docker:build',
        },
      });
    });
  });

  describe('with an application using pnpm', () => {
    before(async () => {
      await helpers
        .runJHipster(generator)
        .withOptions({ workspaces: true, monorepository: true, workspacesFolders: ['gateway', 'micro1'] })
        .withJHipsterConfig({ baseName: 'workspaces' })
        .withWorkspaceApplicationAtFolder('gateway', { baseName: 'gateway', applicationType: 'gateway', nodePackageManager: 'pnpm' })
        .withWorkspaceApplicationAtFolder('micro1', { baseName: 'micro1', applicationType: 'microservice' });
    });

    it('keeps pnpm', () => {
      result.assertJsonFileContent('.yo-rc.json', { 'generator-jhipster': { nodePackageManager: 'pnpm' } });
      result.assertFile('pnpm-workspace.yaml');
    });
  });
});
