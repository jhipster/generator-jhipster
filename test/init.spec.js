const path = require('path');
const expect = require('expect');
const normalizePath = require('normalize-path');

const { skipPrettierHelpers: helpers } = require('./utils/utils');

describe('JHipster init generator', () => {
  describe('with default options', () => {
    let runResult;
    before(async () => {
      runResult = await helpers.run(path.join(__dirname, '../generators/init'));
    });
    it('should create expected files', () => {
      expect(runResult.getStateSnapshot()).toMatchSnapshot();
    });
  });
  describe('with custom prompt values', () => {
    let runResult;
    const promptValues = {
      projectName: 'Beautiful Project',
      baseName: 'BeautifulProject',
      prettierDefaultIndent: 4,
      prettierJavaIndent: 2,
    };
    describe('and default options', () => {
      before(async () => {
        runResult = await helpers.run(path.join(__dirname, '../generators/init')).withPrompts(promptValues);
      });
      it('should write custom config to .yo-rc.json', () => {
        const yoFile = normalizePath(path.join(runResult.cwd, '.yo-rc.json'));
        expect(runResult.getSnapshot(file => file.path === yoFile)).toMatchSnapshot();
      });
    });
    describe('and skipPrompts option', () => {
      let runResult;
      before(async () => {
        runResult = await helpers
          .run(path.join(__dirname, '../generators/init'))
          .withOptions({ skipPrompts: true })
          .withPrompts(promptValues);
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
          .run(path.join(__dirname, '../generators/init'))
          .withOptions({ localConfig: { baseName: 'existing' } })
          .withPrompts(promptValues);
      });
      it('should not write custom prompt values', () => {
        const yoFile = normalizePath(path.join(runResult.cwd, '.yo-rc.json'));
        expect(runResult.getSnapshot(file => file.path === yoFile)).toMatchSnapshot();
      });
    });
    describe('and askAnsweredOption on a exiting project', () => {
      let runResult;
      before(async () => {
        runResult = await helpers
          .run(path.join(__dirname, '../generators/init'))
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
        runResult = await helpers.run(path.join(__dirname, '../generators/init')).withOptions({ skipCommitHook: true });
      });
      it('should create expected files', () => {
        expect(runResult.getStateSnapshot()).toMatchSnapshot();
      });
    });
  });
});
