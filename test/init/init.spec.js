const path = require('path');
const expect = require('expect');
const { access } = require('fs/promises');
const normalizePath = require('normalize-path');

const { skipPrettierHelpers: helpers } = require('../utils/utils');
const { defaultConfig } = require('../../generators/init/config');

const initGeneratorPath = path.join(__dirname, '../../generators/init');

const testDefaultConfg = { ...defaultConfig, jhipsterVersion: '0.0.0' };

describe('JHipster init generator', () => {
  describe('with default options', () => {
    let runResult;
    before(async () => {
      runResult = await helpers.run(initGeneratorPath);
    });
    it('should create expected files', () => {
      expect(runResult.getStateSnapshot()).toMatchSnapshot();
    });
  });
  describe('with defaults option', () => {
    let runResult;
    before(async () => {
      runResult = await helpers.run(initGeneratorPath).withOptions({ defaults: true });
    });
    it('should load default config into the generator', () => {
      expect(runResult.generator).toMatchObject(testDefaultConfg);
    });
  });
  describe('with custom prompt values', () => {
    let runResult;
    const promptValues = {
      prettierDefaultIndent: 4,
      prettierJavaIndent: 2,
    };
    describe('and default options', () => {
      before(async () => {
        runResult = await helpers.run(initGeneratorPath).withOptions({ baseName: 'jhipster' }).withPrompts(promptValues);
      });
      it('should write custom config to .yo-rc.json', () => {
        const yoFile = normalizePath(path.join(runResult.cwd, '.yo-rc.json'));
        expect(runResult.getSnapshot(file => file.path === yoFile)).toMatchSnapshot();
      });
    });
    describe('and defaults option', () => {
      before(async () => {
        runResult = await helpers.run(initGeneratorPath).withOptions({ baseName: 'jhipster', defaults: true }).withPrompts(promptValues);
      });
      it('should not write custom config to .yo-rc.json', () => {
        const yoFile = normalizePath(path.join(runResult.cwd, '.yo-rc.json'));
        expect(runResult.getSnapshot(file => file.path === yoFile)).toMatchSnapshot();
      });
    });
    describe('and skipPrompts option', () => {
      let runResult;
      before(async () => {
        runResult = await helpers.run(initGeneratorPath).withOptions({ skipPrompts: true, baseName: 'jhipster' }).withPrompts(promptValues);
      });
      it('should write default values to .yo-rc.json', () => {
        const yoFile = normalizePath(path.join(runResult.cwd, '.yo-rc.json'));
        expect(runResult.getSnapshot(file => file.path === yoFile)).toMatchSnapshot();
      });
    });
    describe('and existing config', () => {
      let runResult;
      before(async () => {
        runResult = await helpers
          .run(initGeneratorPath)
          .withOptions({ localConfig: { baseName: 'existing' } })
          .withPrompts(promptValues);
      });
      it('should not write custom prompt values', () => {
        const yoFile = normalizePath(path.join(runResult.cwd, '.yo-rc.json'));
        expect(runResult.getSnapshot(file => file.path === yoFile)).toMatchSnapshot();
      });
    });
    describe('and askAnswered option on an exiting project', () => {
      let runResult;
      before(async () => {
        runResult = await helpers
          .run(initGeneratorPath)
          .withOptions({ askAnswered: true, localConfig: { baseName: 'existing' } })
          .withPrompts(promptValues);
      });
      it('should write custom prompt values', () => {
        const yoFile = normalizePath(path.join(runResult.cwd, '.yo-rc.json'));
        expect(runResult.getSnapshot(file => file.path === yoFile)).toMatchSnapshot();
      });
    });
  });
  describe('with custom', () => {
    describe('skipCommitHook option', () => {
      let runResult;
      before(async () => {
        runResult = await helpers.run(initGeneratorPath).withOptions({ skipCommitHook: true });
      });
      it('should create expected files', () => {
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
});
