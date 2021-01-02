const path = require('path');
const assert = require('yeoman-assert');
const helpers = require('yeoman-test');
const shelljs = require('shelljs');
const fse = require('fs-extra');
const expect = require('chai').expect;
const expectedFiles = require('./utils/expected-files');
const packageJson = require('../package.json');
const constants = require('../generators/generator-constants');

const ANGULAR = constants.SUPPORTED_CLIENT_FRAMEWORKS.ANGULAR;

describe('JHipster upgrade generator', function () {
    this.timeout(400000);
    describe('default application', () => {
        const cwd = process.cwd();
        before(done => {
            let workingDirectory;
            helpers
                .run(path.join(__dirname, '../generators/app'))
                .withOptions({ skipInstall: true, skipChecks: true, fromCli: true })
                .inTmpDir(dir => {
                    /* eslint-disable-next-line no-console */
                    console.log(`Generating JHipster application in directory: ${dir}`);
                    // Save directory, in order to run the upgrade generator in the same directory
                    workingDirectory = dir;
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
                .on('end', () => {
                    helpers
                        .run(path.join(__dirname, '../generators/upgrade'))
                        .withOptions({
                            fromCli: true,
                            force: true,
                            silent: false,
                            targetVersion: packageJson.version,
                        })
                        .inTmpDir(() => {
                            /* eslint-disable-next-line no-console */
                            console.log('Upgrading the JHipster application');
                            process.chdir(workingDirectory);
                        })
                        .on('end', done);
                });
        });

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

        after(() => {
            process.chdir(cwd);
        });
    });
    describe('blueprint application', () => {
        const cwd = process.cwd();
        const blueprintName = 'generator-jhipster-sample-blueprint';
        const blueprintVersion = '0.1.1';
        before(done => {
            let workingDirectory;
            helpers
                .run(path.join(__dirname, '../generators/app'))
                .withOptions({ skipInstall: true, skipChecks: true, fromCli: true, blueprints: blueprintName })
                .inTmpDir(dir => {
                    /* eslint-disable-next-line no-console */
                    console.log(`Generating JHipster application in directory: ${dir}`);
                    // Save directory, in order to run the upgrade generator in the same directory
                    workingDirectory = dir;
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
                .on('end', () => {
                    helpers
                        .run(path.join(__dirname, '../generators/upgrade'))
                        .withOptions({
                            fromCli: true,
                            force: true,
                            silent: false,
                            skipChecks: true,
                            targetVersion: packageJson.version,
                        })
                        .inTmpDir(() => {
                            /* eslint-disable-next-line no-console */
                            console.log('Upgrading the JHipster application');
                            process.chdir(workingDirectory);
                        })
                        .on('end', done);
                });
        });

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

        after(() => {
            process.chdir(cwd);
        });
    });
});
