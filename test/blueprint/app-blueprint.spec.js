/* eslint-disable no-unused-expressions */
const path = require('path');
const assert = require('yeoman-assert');
const helpers = require('yeoman-test');
const fse = require('fs-extra');
const expect = require('chai').expect;
const expectedFiles = require('../utils/expected-files');
const getFilesForOptions = require('../utils/utils').getFilesForOptions;
const angularFiles = require('../../generators/client/files-angular').files;
const jhipsterVersion = require('../../package.json').version;
const constants = require('../../generators/generator-constants');
const EnvironmentBuilder = require('../../cli/environment-builder');

const ANGULAR = constants.SUPPORTED_CLIENT_FRAMEWORKS.ANGULAR;

describe('JHipster application generator with blueprint', () => {
  describe('generate application with a version-compatible blueprint', () => {
    before(() => {
      return helpers
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
      assert.file(expectedFiles.common);
      assert.file(expectedFiles.server);
      assert.file(
        getFilesForOptions(angularFiles, {
          enableTranslation: true,
          serviceDiscoveryType: false,
          authenticationType: 'jwt',
          testFrameworks: [],
        })
      );
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
    it('throws an error', done => {
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
        })
        .withPrompts({
          baseName: 'jhipster',
          clientFramework: ANGULAR,
          packageName: 'com.mycompany.myapp',
          packageFolder: 'com/mycompany/myapp',
          serviceDiscoveryType: false,
          authenticationType: 'jwt',
          cacheProvider: 'ehcache',
          enableHibernateCache: true,
          databaseType: 'sql',
          devDatabaseType: 'h2Memory',
          prodDatabaseType: 'mysql',
          enableTranslation: true,
          nativeLanguage: 'en',
          languages: ['fr'],
        })
        .on('error', error => {
          expect(error.message.includes('targets JHipster v1.1.1 and is not compatible with this JHipster version')).to.be.true;
          done();
        })
        .on('end', () => {
          expect(true).to.be.false;
          done();
        });
    });
  });

  describe('generate application with a peer version-compatible blueprint', () => {
    before(() => {
      return helpers
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
      assert.file(expectedFiles.common);
      assert.file(expectedFiles.server);
      assert.file(
        getFilesForOptions(angularFiles, {
          enableTranslation: true,
          serviceDiscoveryType: false,
          authenticationType: 'jwt',
          testFrameworks: [],
        })
      );
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
    it('throws an error', done => {
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
        })
        .withPrompts({
          baseName: 'jhipster',
          clientFramework: ANGULAR,
          packageName: 'com.mycompany.myapp',
          packageFolder: 'com/mycompany/myapp',
          serviceDiscoveryType: false,
          authenticationType: 'jwt',
          cacheProvider: 'ehcache',
          enableHibernateCache: true,
          databaseType: 'sql',
          devDatabaseType: 'h2Memory',
          prodDatabaseType: 'mysql',
          enableTranslation: true,
          nativeLanguage: 'en',
          languages: ['fr'],
        })
        .on('error', error => {
          expect(error.message.includes('targets JHipster 1.1.1 and is not compatible with this JHipster version')).to.be.true;
          done();
        })
        .on('end', () => {
          expect(true).to.be.false;
          done();
        });
    });
  });
});
