const path = require('path');
const assert = require('yeoman-assert');
const helpers = require('yeoman-test');
const shelljs = require('shelljs');
const fse = require('fs-extra');
const expect = require('chai').expect;
const expectedFiles = require('./utils/expected-files');
const packageJson = require('../package.json');
const constants = require('../generators/generator-constants');
const { prepareTempDir } = require('./utils/utils');

const ANGULAR = constants.SUPPORTED_CLIENT_FRAMEWORKS.ANGULAR;

describe('JHipster upgrade generator', function () {
  this.timeout(400000);

  describe('default application', () => {
    let cleanup;
    before(() => {
      cleanup = prepareTempDir();
      return helpers
        .create(path.join(__dirname, '../generators/app'), { tmpdir: false })
        .withOptions({ skipInstall: true, skipChecks: true, fromCli: true })
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
          prodDatabaseType: 'postgresql',
          enableTranslation: true,
          nativeLanguage: 'en',
          languages: ['fr'],
          buildTool: 'maven',
          rememberMeKey: '5c37379956bd1242f5636c8cb322c2966ad81277',
          skipClient: false,
          skipUserManagement: false,
          serverSideOptions: [],
          upgradeConfig: false,
        })
        .run()
        .then(() => {
          return helpers
            .create(path.join(__dirname, '../generators/upgrade'), { tmpdir: false })
            .withOptions({
              fromCli: true,
              force: true,
              silent: false,
              targetVersion: packageJson.version,
            })
            .run();
        });
    });

    after(() => cleanup());

    it('creates expected files for default configuration', () => {
      assert.file(expectedFiles.common);
      assert.file(expectedFiles.server);
      assert.file(expectedFiles.maven);
      assert.file(expectedFiles.client);
    });

    it('generates expected number of commits', () => {
      const commitsCount = shelljs.exec('git rev-list --count HEAD', { silent: false }).stdout.replace('\n', '');
      // Expecting 5 commits in history (because we used `force` option):
      //   - master: initial commit
      //   - jhipster_upgrade; initial generation
      //   - master: block-merge commit of jhipster_upgrade
      //   - jhipster_upgrade: new generation in jhipster_upgrade
      //   - master: merge commit of jhipster_upgrade
      expect(commitsCount).to.equal('5');
    });
  });
  describe.skip('blueprint application', () => {
    const blueprintName = 'generator-jhipster-sample-blueprint';
    const blueprintVersion = '0.1.1';
    let cleanup;
    before(() => {
      cleanup = prepareTempDir();
      const dir = process.cwd();
      /* eslint-disable-next-line no-console */
      console.log(`Generating JHipster application in directory: ${dir}`);
      // Fake the presence of the blueprint in node_modules: we don't install it, but we need its version
      const packagejs = {
        name: blueprintName,
        version: blueprintVersion,
      };
      const fakeBlueprintModuleDir = path.join(dir, `node_modules/${blueprintName}`);
      fse.ensureDirSync(path.join(fakeBlueprintModuleDir, 'generators', 'fake'));
      fse.writeJsonSync(path.join(fakeBlueprintModuleDir, 'package.json'), packagejs);
      // Create an fake generator, otherwise env.lookup doesn't find it.
      fse.writeFileSync(path.join(fakeBlueprintModuleDir, 'generators', 'fake', 'index.js'), '');
      return helpers
        .create(path.join(__dirname, '../generators/app'), { tmpdir: false })
        .withOptions({ skipInstall: true, skipChecks: true, fromCli: true, blueprints: blueprintName })
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
          prodDatabaseType: 'postgresql',
          enableTranslation: true,
          nativeLanguage: 'en',
          languages: ['fr'],
          buildTool: 'maven',
          rememberMeKey: '5c37379956bd1242f5636c8cb322c2966ad81277',
          skipClient: false,
          skipUserManagement: false,
          serverSideOptions: [],
          upgradeConfig: false,
        })
        .run()
        .then(() => {
          return helpers
            .create(path.join(__dirname, '../generators/upgrade'), { tmpdir: false })
            .withOptions({
              fromCli: true,
              force: true,
              silent: false,
              skipChecks: true,
              targetVersion: packageJson.version,
            })
            .run();
        });
    });

    after(() => cleanup());

    it('creates expected files for default configuration', () => {
      assert.file(expectedFiles.common);
      assert.file(expectedFiles.server);
      assert.file(expectedFiles.maven);
      assert.file(expectedFiles.client);
    });

    it('generates expected number of commits', () => {
      const commitsCount = shelljs.exec('git rev-list --count HEAD', { silent: false }).stdout.replace('\n', '');
      // Expecting 5 commits in history (because we used `force` option):
      //   - master: initial commit
      //   - jhipster_upgrade; initial generation
      //   - master: block-merge commit of jhipster_upgrade
      //   - jhipster_upgrade: new generation in jhipster_upgrade
      //   - master: merge commit of jhipster_upgrade
      expect(commitsCount).to.equal('5');
    });

    it('still contains blueprint information', () => {
      assert.JSONFileContent('.yo-rc.json', {
        'generator-jhipster': { blueprints: [{ name: blueprintName, version: blueprintVersion }] },
      });
      assert.fileContent('package.json', new RegExp(`"${blueprintName}": "${blueprintVersion}"`));
    });
  });
});
