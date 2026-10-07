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
import { mkdirSync, mkdtempSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';

import type CoreGenerator from '../../generators/base-core/index.ts';

import { defaultHelpers as helpers, defineDefaults, runResult } from './helpers.ts';

const DUMMY_NAMESPACE = 'jhipster:dummy';

describe('helpers', () => {
  describe('run defaults', () => {
    before(async () => {
      await helpers.run(helpers.createDummyGenerator<typeof CoreGenerator>(), { namespace: DUMMY_NAMESPACE });
    });
    it('should register not jhipster generators namespaces', () => {
      expect(
        Object.keys(runResult.env.getGeneratorsMeta())
          .filter(ns => ns !== DUMMY_NAMESPACE)
          .sort(),
      ).toHaveLength(0);
    });
  });
  describe('runJHipster defaults', () => {
    before(async () => {
      await helpers.runJHipster('dummy').withGenerators([[helpers.createDummyGenerator(), { namespace: DUMMY_NAMESPACE }]]);
    });
    it('should register jhipster generators namespaces', () => {
      expect(
        Object.keys(runResult.env.getGeneratorsMeta())
          .filter(ns => ns !== DUMMY_NAMESPACE)
          .sort(),
      ).toMatchSnapshot();
    });
  });
  describe('run using withJHipsterGenerators', () => {
    before(async () => {
      await helpers.run(helpers.createDummyGenerator<typeof CoreGenerator>(), { namespace: DUMMY_NAMESPACE }).withJHipsterGenerators();
    });
    it('should register jhipster generators namespaces', () => {
      expect(
        Object.keys(runResult.env.getGeneratorsMeta())
          .filter(ns => ns !== DUMMY_NAMESPACE)
          .sort(),
      ).toMatchSnapshot();
    });
  });
  describe('runJHipster with useDefaultMocks', () => {
    before(async () => {
      await helpers
        .runJHipster('dummy', { useDefaultMocks: true })
        .withGenerators([[helpers.createDummyGenerator(), { namespace: DUMMY_NAMESPACE }]]);
    });
    it('should register jhipster generators namespaces', () => {
      expect(
        Object.keys(runResult.env.getGeneratorsMeta())
          .filter(ns => ns !== DUMMY_NAMESPACE)
          .sort(),
      ).toMatchSnapshot();
    });
  });
  describe('withConfiguredBlueprint of a blueprint in a folder not named after it', () => {
    let blueprintPackagePath: string;

    before(async () => {
      // Like a git worktree of the blueprint.
      blueprintPackagePath = join(mkdtempSync(join(tmpdir(), 'jhi-blueprint-')), 'agent-worktree');
      mkdirSync(join(blueprintPackagePath, 'generators/app'), { recursive: true });
      writeFileSync(join(blueprintPackagePath, 'package.json'), JSON.stringify({ name: 'generator-jhipster-foo' }));
      writeFileSync(join(blueprintPackagePath, 'generators/app/index.js'), 'export default class {}\n');
      await defineDefaults({ blueprint: 'generator-jhipster-foo', blueprintPackagePath });
      await helpers.run(helpers.createDummyGenerator<typeof CoreGenerator>(), { namespace: DUMMY_NAMESPACE }).withConfiguredBlueprint();
    });

    after(async () => {
      await defineDefaults({ blueprint: undefined, blueprintPackagePath: undefined });
      rmSync(join(blueprintPackagePath, '..'), { recursive: true, force: true });
    });

    it('should register the blueprint generators under the blueprint namespace', () => {
      expect(runResult.env.isPackageRegistered('jhipster-foo')).toBe(true);
      expect(runResult.env.isPackageRegistered('agent-worktree')).toBe(false);
    });
  });
});
