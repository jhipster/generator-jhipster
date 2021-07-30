/**
 * Copyright 2013-2021 the original author or authors from the JHipster project.
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
const path = require('path');
const expect = require('expect');
const { access } = require('fs/promises');

const { basicTests, testBlueprintSupport } = require('../../test/support/index.cjs');
const { skipPrettierHelpers: helpers } = require('../../test/utils/utils');
const { defaultConfig, requiredConfig } = require('./config.cjs');
const { GENERATOR_JHIPSTER } = require('../generator-constants');
const { GENERATOR_INIT } = require('../generator-list');

const generatorPath = path.join(__dirname, 'index.cjs');
const generator = path.basename(__dirname);
const contextBuilder = () => helpers.create(generatorPath).withOptions({ skipGit: true });

describe(`JHipster ${generator} generator`, () => {
  it('generator-list constant matches folder name', () => {
    expect(GENERATOR_INIT).toBe(generator);
  });
  basicTests({
    requiredConfig,
    defaultConfig,
    customPrompts: {
      prettierDefaultIndent: 4,
    },
    contextBuilder,
  });
  describe('with', () => {
    describe('default config', () => {
      let runResult;
      before(async () => {
        runResult = await helpers.run(generatorPath);
      });
      it('should write files and match snapshot', () => {
        expect(runResult.getStateSnapshot()).toMatchSnapshot();
      });
    });
    describe('skipCommitHook option', () => {
      let runResult;
      const options = { skipCommitHook: true };
      before(async () => {
        runResult = await helpers.run(generatorPath).withOptions({ ...options });
      });
      it('should write options to .yo-rc.json', () => {
        runResult.assertJsonFileContent('.yo-rc.json', { [GENERATOR_JHIPSTER]: options });
      });
      it('should not create husky files and match snapshot', () => {
        expect(runResult.getStateSnapshot()).toMatchSnapshot();
      });
    });
  });
  describe('git feature', () => {
    describe('with default option', () => {
      let runResult;
      before(async () => {
        runResult = await helpers.run(generatorPath);
      });
      it('should create .git', async () => {
        await expect(access(path.resolve(runResult.cwd, '.git'))).resolves.toBeUndefined();
      });
      it('should create 1 commit', async () => {
        const git = runResult.generator._createGit();
        await expect(git.log()).resolves.toMatchObject({
          total: 1,
          latest: { message: expect.stringMatching(/^Initial version of/) },
        });
      });
    });
    describe('with skipGit option', () => {
      let runResult;
      before(async () => {
        runResult = await helpers.run(generatorPath).withOptions({ skipGit: true });
      });
      it('should not create .git', async () => {
        await expect(access(path.resolve(runResult.cwd, '.git'))).rejects.toMatchObject({ code: 'ENOENT' });
      });
    });
    describe('regenerating', () => {
      let runResult;
      before(async () => {
        runResult = await helpers.run(generatorPath);
        runResult = await runResult.create(generatorPath).withOptions({ skipPrettier: true, jhipsterVersion: '1.0.0' }).run();
      });
      it('should have 1 commit', async () => {
        const git = runResult.generator._createGit();
        await expect(git.log()).resolves.toMatchObject({ total: 1 });
      });
      it('should have uncommited files', async () => {
        const git = runResult.generator._createGit();
        await expect(git.diff()).resolves.toMatch(/\+ {4}"jhipsterVersion": "1\.0\.0"/);
      });
    });
  });
  describe('blueprint support', () => testBlueprintSupport('init'));
});
