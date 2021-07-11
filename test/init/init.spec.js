const path = require('path');
const expect = require('expect');
const { access } = require('fs/promises');

const { basicTests, testBlueprintSupport } = require('../support');
const { skipPrettierHelpers: helpers } = require('../utils/utils');
const { defaultConfig, requiredConfig } = require('../../generators/init/config');
const { GENERATOR_JHIPSTER } = require('../../generators/generator-constants');

const initGeneratorPath = path.join(__dirname, '../../generators/init');
const contextBuilder = () => helpers.create(initGeneratorPath).withOptions({ skipGit: true });

describe('JHipster init generator', () => {
  basicTests({
    requiredConfig,
    defaultConfig,
    customPrompts: {
      prettierDefaultIndent: 4,
      prettierJavaIndent: 2,
    },
    contextBuilder,
  });
  describe('with', () => {
    describe('default config', () => {
      let runResult;
      before(async () => {
        runResult = await helpers.run(initGeneratorPath);
      });
      it('should write files and match snapshot', () => {
        expect(runResult.getStateSnapshot()).toMatchSnapshot();
      });
    });
    describe('skipCommitHook option', () => {
      let runResult;
      const options = { skipCommitHook: true };
      before(async () => {
        runResult = await helpers.run(initGeneratorPath).withOptions({ ...options });
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
        runResult = await helpers.run(initGeneratorPath);
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
        runResult = await helpers.run(initGeneratorPath).withOptions({ skipGit: true });
      });
      it('should not create .git', async () => {
        await expect(access(path.resolve(runResult.cwd, '.git'))).rejects.toMatchObject({ code: 'ENOENT' });
      });
    });
    describe('regenerating', () => {
      let runResult;
      before(async () => {
        runResult = await helpers.run(initGeneratorPath);
        runResult = await runResult.create(initGeneratorPath).withOptions({ skipPrettier: true, jhipsterVersion: '1.0.0' }).run();
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
