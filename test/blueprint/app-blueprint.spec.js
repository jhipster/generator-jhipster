/* eslint-disable no-unused-expressions */
const path = require('path');
const assert = require('yeoman-assert');
const helpers = require('yeoman-test');
const fse = require('fs-extra');
const jestExpect = require('expect');
const jhipsterVersion = require('../../package.json').version;
const EnvironmentBuilder = require('../../cli/environment-builder');

describe('JHipster application generator with blueprint', () => {
  describe('generate application with a version-compatible blueprint', () => {
    let runResult;
    before(async () => {
      runResult = await helpers
        .create('jhipster:app', {}, { createEnv: EnvironmentBuilder.createEnv })
        .inTmpDir(dir => {
          // Fake the presence of the blueprint in node_modules
          const packagejs = {
            name: 'generator-jhipster-myblueprint',
            version: '9.9.9',
            dependencies: {
              'generator-jhipster': jhipsterVersion,
            },
          };
          const fakeBlueprintModuleDir = path.join(dir, 'node_modules/generator-jhipster-myblueprint');
          fse.ensureDirSync(fakeBlueprintModuleDir);
          fse.copySync(path.join(__dirname, '../../test/templates/fake-blueprint'), fakeBlueprintModuleDir);
          fse.writeJsonSync(path.join(fakeBlueprintModuleDir, 'package.json'), packagejs);
        })
        .withOptions({
          fromCli: true,
          skipInstall: true,
          skipChecks: false,
          blueprint: 'myblueprint',
          baseName: 'jhipster',
          defaults: true,
        })
        .run();
    });

    it('creates expected default files for server and angularX', () => {
      jestExpect(runResult.getStateSnapshot()).toMatchSnapshot();
    });

    it('blueprint version is saved in .yo-rc.json', () => {
      assert.JSONFileContent('.yo-rc.json', {
        'generator-jhipster': { blueprints: [{ name: 'generator-jhipster-myblueprint', version: '9.9.9' }] },
      });
    });
    it('blueprint module and version are in package.json', () => {
      assert.fileContent('package.json', /"generator-jhipster-myblueprint": "9.9.9"/);
    });
  });

  describe('generate application with a conflicting version blueprint', () => {
    it('throws an error', () =>
      jestExpect(() =>
        helpers
          .run(path.join(__dirname, '../../generators/app'))
          .inTmpDir(dir => {
            // Fake the presence of the blueprint in node_modules
            const packagejs = {
              name: 'generator-jhipster-myblueprint',
              version: '9.9.9',
              dependencies: {
                'generator-jhipster': '1.1.1',
              },
            };
            const fakeBlueprintModuleDir = path.join(dir, 'node_modules/generator-jhipster-myblueprint');
            fse.ensureDirSync(fakeBlueprintModuleDir);
            fse.copySync(path.join(__dirname, '../../test/templates/fake-blueprint'), fakeBlueprintModuleDir);
            fse.writeJsonSync(path.join(fakeBlueprintModuleDir, 'package.json'), packagejs);
          })
          .withOptions({
            fromCli: true,
            skipInstall: true,
            skipChecks: false,
            blueprint: 'myblueprint',
            defaults: true,
          })
      ).rejects.toThrow(/targets JHipster v1.1.1 and is not compatible with this JHipster version/));
  });

  describe('generating application with a git blueprint', () => {
    it('should succeed', () =>
      helpers
        .run(path.join(__dirname, '../../generators/app'))
        .inTmpDir(dir => {
          // Fake the presence of the blueprint in node_modules
          const packagejs = {
            name: 'generator-jhipster-myblueprint',
            version: '9.9.9',
            dependencies: {
              'generator-jhipster': 'gitlab:jhipster/generator-jhipster#main',
            },
          };
          const fakeBlueprintModuleDir = path.join(dir, 'node_modules/generator-jhipster-myblueprint');
          fse.ensureDirSync(fakeBlueprintModuleDir);
          fse.copySync(path.join(__dirname, '../../test/templates/fake-blueprint'), fakeBlueprintModuleDir);
          fse.writeJsonSync(path.join(fakeBlueprintModuleDir, 'package.json'), packagejs);
        })
        .withOptions({
          defaults: true,
          skipInstall: true,
          skipChecks: false,
          blueprint: 'myblueprint',
        }));
  });

  describe('generate application with a peer version-compatible blueprint', () => {
    let runResult;
    before(async () => {
      runResult = await helpers
        .create('jhipster:app', {}, { createEnv: EnvironmentBuilder.createEnv })
        .inTmpDir(dir => {
          // Fake the presence of the blueprint in node_modules
          const packagejs = {
            name: 'generator-jhipster-myblueprint',
            version: '9.9.9',
            peerDependencies: {
              'generator-jhipster': '^7.0.0-beta.0',
            },
          };
          const fakeBlueprintModuleDir = path.join(dir, 'node_modules/generator-jhipster-myblueprint');
          fse.ensureDirSync(fakeBlueprintModuleDir);
          fse.copySync(path.join(__dirname, '../../test/templates/fake-blueprint'), fakeBlueprintModuleDir);
          fse.writeJsonSync(path.join(fakeBlueprintModuleDir, 'package.json'), packagejs);
        })
        .withOptions({
          fromCli: true,
          skipInstall: true,
          skipChecks: false,
          blueprint: 'myblueprint',
          baseName: 'jhipster',
          defaults: true,
        })
        .run();
    });

    it('creates expected default files for server and angularX', () => {
      jestExpect(runResult.getStateSnapshot()).toMatchSnapshot();
    });

    it('blueprint version is saved in .yo-rc.json', () => {
      assert.JSONFileContent('.yo-rc.json', {
        'generator-jhipster': { blueprints: [{ name: 'generator-jhipster-myblueprint', version: '9.9.9' }] },
      });
    });
    it('blueprint module and version are in package.json', () => {
      assert.fileContent('package.json', /"generator-jhipster-myblueprint": "9.9.9"/);
    });
  });

  describe('generate application with a peer conflicting version blueprint', () => {
    it('throws an error', () =>
      jestExpect(() =>
        helpers
          .run(path.join(__dirname, '../../generators/app'))
          .inTmpDir(dir => {
            // Fake the presence of the blueprint in node_modules
            const packagejs = {
              name: 'generator-jhipster-myblueprint',
              version: '9.9.9',
              peerDependencies: {
                'generator-jhipster': '1.1.1',
              },
            };
            const fakeBlueprintModuleDir = path.join(dir, 'node_modules/generator-jhipster-myblueprint');
            fse.ensureDirSync(fakeBlueprintModuleDir);
            fse.copySync(path.join(__dirname, '../../test/templates/fake-blueprint'), fakeBlueprintModuleDir);
            fse.writeJsonSync(path.join(fakeBlueprintModuleDir, 'package.json'), packagejs);
          })
          .withOptions({
            fromCli: true,
            skipInstall: true,
            skipChecks: false,
            blueprint: 'myblueprint',
            defaults: true,
          })
      ).rejects.toThrow(/targets JHipster 1.1.1 and is not compatible with this JHipster version/));
  });
});
