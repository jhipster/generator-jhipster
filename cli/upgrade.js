/**
 * Copyright 2013-2019 the original author or authors from the JHipster project.
 *
 * This file is part of the JHipster project, see https://www.jhipster.tech/
 * for more information.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *      http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

const chalk = require('chalk');
const shelljs = require('shelljs');
const semver = require('semver');
const fs = require('fs');
const gitignore = require('parse-gitignore');
const constants = require('../generators/generator-constants');
const statistics = require('../generators/statistics');
const jhipsterUtils = require('../generators/utils');

const { GENERATOR_NAME, logger, toString } = require('./utils');

/* Constants used throughout */
const UPGRADE_BRANCH = 'jhipster_upgrade';
const GIT_VERSION_NOT_ALLOW_MERGE_UNRELATED_HISTORIES = '2.9.0';
const FIRST_CLI_SUPPORTED_VERSION = '4.5.1'; // The first version in which CLI support was added
const SERVER_MAIN_RES_DIR = constants.SERVER_MAIN_RES_DIR;

class Upgrader {
    constructor(options) {
        logger.debug(`Upgrade started with options: ${toString(options)}`);
        this.options = options;

        this.force = this.options.force || (this.options.interactive && this.options.interactive === false);
        this.targetJhipsterVersion = this.options['target-version'];
        this.targetBlueprintVersions = jhipsterUtils.parseBluePrints(this.options['target-blueprint-versions']);
        this.skipInstall = this.options['skip-install'];
        this.silent = this.options.silent;
    }

    init() {
        // Display Logo
        logger.log(chalk.green('Welcome to the JHipster Upgrade CLI'));
        logger.log(chalk.green('This will upgrade your current application codebase to the latest JHipster version'));

        // Load config
        this.config = jhipsterUtils.getAllJhipsterConfig();
        this.currentJhipsterVersion = this.config.jhipsterVersion;
        this.blueprints = jhipsterUtils.loadBlueprintsFromConfiguration(this.config);
        this.clientPackageManager = this.config.clientPackageManager;
        this.clientFramework = this.config.clientFramework;
    }

    validate() {
        if (!this.config.baseName) {
            logger.error('Current directory does not contain a JHipster project.');
        }

        // Assert git is present
        if (jhipsterUtils.isGitInstalled() === false) {
            logger.error('Exiting the process.');
        }
    }

    upgrade() {
        return this._checkForUpdates().then(() => {
            if (semver.lt(this.currentJhipsterVersion, this.latestJhipsterVersion)) {
                logger.info(`New ${GENERATOR_NAME} version found: ${this.latestJhipsterVersion}`);
            } else if (this.force) {
                logger.log(chalk.yellow('Forced re-generation'));
            } else if (!this.newBlueprintVersionFound) {
                logger.error(`${chalk.green('No update available.')} Application has already been generated with latest version.`);
            }

            this._prepare();
            this._preUpgrade();
            this._doUpgrade();
            this._postUpgrade();
        });
    }

    // region Check For updates steps

    _checkForUpdates() {
        return Promise.all([this._checkLatestBlueprintVersions(), this._checkLatestJhipsterVersion()]);
    }

    _checkLatestBlueprintVersions() {
        if (!this.blueprints || this.blueprints.length < 1) {
            logger.log('No blueprints detected, skipping check for new version of blueprints');
            return Promise.resolve();
        }

        logger.info(`Checking for new blueprint versions:${toString(this.blueprints)}`);
        return Promise.all(
            this.blueprints
                .filter(blueprint => {
                    if (this.targetBlueprintVersions && this.targetBlueprintVersions.length > 0) {
                        const targetBlueprint = this.targetBlueprintVersions.find(elem => {
                            return elem.name === blueprint.name;
                        });
                        if (targetBlueprint && targetBlueprint.version && targetBlueprint.version !== 'latest') {
                            logger.log(`Blueprint ${targetBlueprint.name} will be upgraded to target version: ${targetBlueprint.version}`);
                            blueprint.latestBlueprintVersion = targetBlueprint.version;
                            return false;
                        }
                    }
                    return true;
                })
                .map(blueprint => {
                    return new Promise(resolve => {
                        logger.log(`Checking for new version of blueprint:${blueprint.name}`);
                        this._retrieveLatestVersion(blueprint.name, latestVersion => {
                            blueprint.latestBlueprintVersion = latestVersion;
                            if (semver.lt(blueprint.version, blueprint.latestBlueprintVersion)) {
                                this.newBlueprintVersionFound = true;
                                logger.info(`New ${blueprint.name} version found: ${blueprint.latestBlueprintVersion}`);
                            } else if (this.force) {
                                this.newBlueprintVersionFound = true;
                                logger.log(chalk.yellow('Forced re-generation'));
                            } else {
                                if (this.newBlueprintVersionFound === undefined) {
                                    this.newBlueprintVersionFound = false;
                                }
                                logger.warn(
                                    `${chalk.green(
                                        'No update available.'
                                    )} Application has already been generated with latest version for blueprint: ${blueprint.name}`
                                );
                            }
                            logger.info(`Done checking for new version for blueprint ${blueprint.name}`);
                            resolve();
                        });
                    });
                })
        );
    }

    _checkLatestJhipsterVersion() {
        if (this.targetJhipsterVersion) {
            logger.log(`Upgrading to the target JHipster version: ${this.targetJhipsterVersion}`);
            this.latestJhipsterVersion = this.targetJhipsterVersion;
            return Promise.resolve();
        }
        logger.info(`Checking for latest ${GENERATOR_NAME} version...`);

        return new Promise(resolve => {
            this._retrieveLatestVersion(GENERATOR_NAME, latestVersion => {
                this.latestJhipsterVersion = latestVersion;
                resolve();
            });
        });
    }

    // endregion

    // region Preparation steps

    _prepare() {
        this._assertGitRepository();
        this._detectCurrentBranch();
        this._prepareUpgradeBranch();
    }

    _assertGitRepository() {
        const code = jhipsterUtils.gitExec(['rev-parse', '-q', '--is-inside-work-tree'], { silent: this.silent }).code;
        if (code !== 0) {
            const shellStr = jhipsterUtils.gitExec('init', { silent: this.silent });
            if (shellStr.code !== 0) {
                logger.error(`Unable to initialize a new Git repository:\n${shellStr.stdout} ${shellStr.stderr}`);
            }
            logger.info('Initialized a new Git repository');

            this._gitCommitAll('Initial');
        } else {
            logger.info('Git repository detected');

            // Assert NO local changes
            const shellStr = jhipsterUtils.gitExec(['status', '--porcelain'], { silent: this.silent });
            if (shellStr.code !== 0) {
                logger.error(`Unable to check for local changes:\n${shellStr.stdout} ${shellStr.stderr}`);
            }
            if (shellStr.stdout) {
                logger.warn(' Local changes found.\n\tPlease commit/stash them before upgrading');
                logger.error('Exiting process');
            }
        }
    }

    _detectCurrentBranch() {
        const shellStr = jhipsterUtils.gitExec(['rev-parse', '-q', '--abbrev-ref', 'HEAD'], { silent: this.silent });
        if (shellStr.code !== 0) logger.error(`Unable to detect current Git branch:\n${shellStr.stdout} ${shellStr.stderr}`);
        this.sourceBranch = shellStr.stdout.replace('\n', '');
    }

    _prepareUpgradeBranch() {
        const code = jhipsterUtils.gitExec(['rev-parse', '-q', '--verify', UPGRADE_BRANCH], { silent: this.silent }).code;
        if (code === 0) return;

        const shellStr = jhipsterUtils.gitExec(['checkout', '--orphan', UPGRADE_BRANCH], { silent: this.silent });
        if (shellStr.code !== 0) logger.error(`Unable to create ${UPGRADE_BRANCH} branch:\n${shellStr.stdout} ${shellStr.stderr}`);
        logger.info(`Created branch ${UPGRADE_BRANCH}`);

        this._cleanUp();

        this._installNpmPackageLocally(GENERATOR_NAME, this.currentJhipsterVersion);

        if (this.blueprints && this.blueprints.length > 0) {
            logger.info('Installing blueprints locally...');
            this.blueprints.forEach(blueprint => {
                this._installNpmPackageLocally(blueprint.name, blueprint.version);
                logger.info(`Done installing blueprint: ${blueprint.name}@${blueprint.version}`);
            });
        }

        const blueprintInfo =
            this.blueprints && this.blueprints.length > 0
                ? ` and ${this.blueprints.map(bp => `${bp.name}@${bp.version}`).join(', ')} `
                : '';
        this._regenerate(this.currentJhipsterVersion, blueprintInfo);

        this._gitCheckout(this.sourceBranch);

        // consider code up-to-date
        this._recordCodeHasBeenGenerated();
    }

    _recordCodeHasBeenGenerated() {
        const msg = jhipsterUtils.gitExec(['--version'], { silent: this.silent }).stdout;
        const gitVersion = String(msg.match(/([0-9]+\.[0-9]+\.[0-9]+)/g));

        let args;
        if (semver.lt(gitVersion, GIT_VERSION_NOT_ALLOW_MERGE_UNRELATED_HISTORIES)) {
            args = ['merge', '--strategy=ours', '-q', '--no-edit', UPGRADE_BRANCH];
        } else {
            args = ['merge', '--strategy=ours', '-q', '--no-edit', '--allow-unrelated-histories', UPGRADE_BRANCH];
        }
        const shellStr = jhipsterUtils.gitExec(args, { silent: this.silent });
        if (shellStr.code !== 0) {
            logger.error(
                `Unable to record current code has been generated with version ${this.currentJhipsterVersion}:\n${shellStr.stdout} ${
                    shellStr.stderr
                }`
            );
        }
        logger.info(`Current code has been generated with version ${this.currentJhipsterVersion}`);
    }

    // endregion

    // region Pre-upgrade steps

    _preUpgrade() {
        this._sendInsight();

        this._gitCheckout(UPGRADE_BRANCH);

        this._fixConfigFile();
    }

    _sendInsight() {
        statistics.sendSubGenEvent('generator', 'upgrade');
    }

    _fixConfigFile() {
        const filePath = '.yo-rc.json';
        const yoRc = JSON.parse(fs.readFileSync(filePath, { encoding: 'utf-8' }));

        const modified = this._fixLanguages(yoRc);
        if (modified) {
            logger.debug(`Updating ${filePath} to:\n${JSON.stringify(yoRc)}`);
            fs.writeFileSync(filePath, JSON.stringify(yoRc));
            logger.info(`Updated ${filePath} successfully`);
        }
    }

    _fixLanguages(yoRc) {
        function fixLanguageKeys(configuration) {
            const languages = configuration.languages;
            let modified = false;
            if (languages && languages.length > 0) {
                const langConversions = {
                    id: 'in',
                    'uz-lat': 'uz-Latn-uz',
                    'uz-cyr': 'uz-Cyrl-uz'
                };
                const langKeys = Object.keys(langConversions);
                langKeys.forEach(key => {
                    const idx = languages.findIndex(elem => elem === key);
                    if (idx !== -1) {
                        languages[idx] = langConversions[key];
                        modified = true;
                    }
                });
            }
            return modified;
        }

        const configKeys = Object.keys(yoRc);
        let modified = false;
        configKeys.forEach(configKey => {
            if (configKey.startsWith('generator-')) {
                if (fixLanguageKeys(yoRc[configKey])) {
                    modified = true;
                }
            }
        });
        return modified;
    }

    // endregion

    // region Upgrade steps

    _doUpgrade() {
        this._updateJhipster();

        this._updateBlueprints();

        this._generateWithLatestVersion();

        this._checkoutSourceBranch();

        this._mergeChangesBack();

        this._checkConflictsInPackageJson();
    }

    _updateJhipster() {
        this._installNpmPackageLocally(GENERATOR_NAME, this.latestJhipsterVersion);
    }

    _updateBlueprints() {
        if (!this.blueprints || this.blueprints.length < 1) {
            logger.log('Skipping blueprint update since no blueprint has been detected');
            return;
        }

        logger.info('Upgrading blueprints...');
        this.blueprints.forEach(blueprint => {
            this._installNpmPackageLocally(blueprint.name, blueprint.latestBlueprintVersion);
        });
    }

    _generateWithLatestVersion() {
        this._cleanUp();

        const blueprintInfo =
            this.blueprints && this.blueprints.length > 0
                ? ` and ${this.blueprints.map(bp => `${bp.name}@${bp.latestBlueprintVersion}`).join(', ')} `
                : '';

        this._regenerate(this.latestJhipsterVersion, blueprintInfo);
    }

    _checkoutSourceBranch() {
        this._gitCheckout(this.sourceBranch);
    }

    _mergeChangesBack() {
        logger.log(`Merging changes back to ${this.sourceBranch}...`);
        const code = jhipsterUtils.gitExec(['merge', '-q', UPGRADE_BRANCH], { silent: this.silent }).code;
        if (code === 0) logger.info('Merge done!');
    }

    _checkConflictsInPackageJson() {
        const shellStr = jhipsterUtils.gitExec(['diff', '--name-only', '--diff-filter=U', 'package.json'], { silent: this.silent });
        if (shellStr.code !== 0) logger.error(`Unable to check for conflicts in package.json:\n${shellStr.stdout} ${shellStr.stderr}`);
        if (shellStr.stdout) {
            const installCommand = this.clientPackageManager === 'yarn' ? 'yarn' : 'npm install';
            logger.warn(`There are conflicts in package.json, please fix them and then run ${installCommand}`);
            this.skipInstall = true;
        }
    }

    // endregion

    // region Post-Upgrade steps

    _postUpgrade() {
        this._installDependencies();
        this._checkMergeConflicts();
    }

    _installDependencies() {
        if (!this.skipInstall) {
            logger.log('Installing dependencies, please wait...');
            logger.info('Removing the node_modules directory');
            shelljs.rm('-rf', 'node_modules');
            const installCommand = this.clientPackageManager === 'yarn' ? 'yarn' : 'npm install';
            logger.info(installCommand);
            const shellStr = shelljs.exec(installCommand, { silent: this.silent });
            if (shellStr.code !== 0) {
                logger.warn(`${installCommand} failed.\n ${shellStr.stderr}`);
            }
        } else {
            const logMsg = `Start your Webpack development server with:\n${chalk.yellow.bold(`${this.clientPackageManager} start`)}\n`;
            logger.info(logMsg);
        }
    }

    _checkMergeConflicts() {
        const shellStr = jhipsterUtils.gitExec(['diff', '--name-only', '--diff-filter=U'], { silent: this.silent });
        if (shellStr.code !== 0) {
            logger.warn(`Unable to check for conflicts:\n${shellStr.stdout} ${shellStr.stderr}`);
        }
        if (shellStr.stdout) {
            logger.warn(
                chalk.yellow.bold(
                    `Upgrade finished with merge conflicts. Please fix conflicts listed below and commit:\n\n${shellStr.stdout}`
                )
            );
        } else {
            logger.info(chalk.bold('Upgraded successfully.'));
        }
    }

    // endregion

    // region Utilities

    _gitCheckout(branch) {
        const shellStr = jhipsterUtils.gitExec(['checkout', '-q', branch], { silent: this.silent });
        if (shellStr.code !== 0) logger.error(`Unable to checkout branch ${branch}:\n${shellStr.stderr}`);
        logger.info(`Checked out branch "${branch}"`);
    }

    _cleanUp() {
        const ignoredFiles = gitignore(fs.readFileSync('.gitignore'));
        const filesToKeep = ['.yo-rc.json', '.jhipster', 'node_modules', '.git', '.idea', '.mvn', ...ignoredFiles];
        shelljs.ls('-A').forEach(file => {
            if (!filesToKeep.includes(file)) {
                logger.info(`Removing ${file}`);
                shelljs.rm('-rf', file);
            }
        });
        logger.info('Cleaned up project directory');
    }

    _generate(jhipsterVersion, blueprintInfo) {
        logger.log(`Regenerating application with JHipster ${jhipsterVersion}${blueprintInfo}...`);
        let generatorCommand = 'yo jhipster';
        if (semver.gte(jhipsterVersion, FIRST_CLI_SUPPORTED_VERSION)) {
            const generatorDir =
                this.clientPackageManager === 'yarn'
                    ? shelljs.exec('yarn bin', { silent: this.silent }).stdout
                    : shelljs.exec('npm bin', { silent: this.silent }).stdout;
            generatorCommand = `"${generatorDir.replace('\n', '')}/jhipster"`;
        }

        const regenerateCmd = `${generatorCommand} --with-entities --force --skip-install --skip-git --no-insight`;
        logger.info(regenerateCmd);

        const shellStr = shelljs.exec(regenerateCmd, { silent: this.silent });
        if (shellStr.code === 0) logger.info(`Successfully regenerated application with JHipster ${jhipsterVersion}${blueprintInfo}`);
        else logger.error(`Something went wrong while generating project! ${shellStr.stderr}`);
    }

    _gitCommitAll(commitMsg) {
        let shellStr = jhipsterUtils.gitExec(['add', '-A'], { maxBuffer: 1024 * 10000, silent: this.silent });
        if (shellStr.code !== 0) logger.error(`Unable to add resources in git:\n${shellStr.stderr}`);

        shellStr = jhipsterUtils.gitExec(['commit', '-q', '-m', `"${commitMsg}"`, '-a', '--allow-empty', '--no-verify'], {
            silent: this.silent
        });

        if (shellStr.code !== 0) logger.error(`Unable to commit in git:\n${shellStr.stderr}`);
        logger.info(`Committed with message "${commitMsg}"`);
    }

    _regenerate(jhipsterVersion, blueprintInfo) {
        this._generate(jhipsterVersion, blueprintInfo);

        const keystore = `${SERVER_MAIN_RES_DIR}config/tls/keystore.p12`;
        logger.info(`Removing ${keystore}`);
        shelljs.rm('-Rf', keystore);
        this._gitCommitAll(`Generated with JHipster ${jhipsterVersion}${blueprintInfo}`);
    }

    _retrieveLatestVersion(npmPackage, callback) {
        const commandPrefix = this.clientPackageManager === 'yarn' ? 'yarn info' : 'npm show';
        shelljs.exec(`${commandPrefix} ${npmPackage} version`, { silent: this.silent }, (code, msg, err) => {
            if (err) {
                logger.warn(`Something went wrong fetching the latest ${npmPackage} version number...\n${err}`);
                logger.error('Exiting process');
            }
            const latestVersion = this.clientPackageManager === 'yarn' ? msg.split('\n')[1] : msg.replace('\n', '');
            callback(latestVersion);
        });
    }

    _installNpmPackageLocally(npmPackage, version) {
        logger.log(`Installing ${npmPackage} ${version} locally`);
        const commandPrefix = this.clientPackageManager === 'yarn' ? 'yarn add' : 'npm install';
        const devDependencyParam = this.clientPackageManager === 'yarn' ? '--dev' : '--save-dev';
        const noPackageLockParam = this.clientPackageManager === 'yarn' ? '--no-lockfile' : '--no-package-lock';
        const generatorCommand = `${commandPrefix} ${npmPackage}@${version} ${devDependencyParam} ${noPackageLockParam} --ignore-scripts`;
        logger.info(generatorCommand);
        const shellStr = shelljs.exec(generatorCommand, { silent: this.silent });
        if (shellStr.code === 0) logger.info(`Installed ${npmPackage}@${version}`);
        else logger.error(`Something went wrong while installing ${npmPackage}! ${shellStr.stdout} ${shellStr.stderr}`);
    }

    // endregion
}

/**
 * Upgrade sub generator
 * @param {any} args arguments passed for upgrade
 * @param {any} options options passed from CLI
 * @param {any} env the yeoman environment
 */
module.exports = (args, options, env) => {
    logger.debug('cmd: upgrade');
    logger.debug(`args: ${toString(args)}`);
    logger.info(chalk.yellow('Executing upgrade'));
    logger.info(chalk.yellow(`Options: ${toString(options)}`));

    const upgrader = new Upgrader(options);
    upgrader.init();
    upgrader.validate();
    upgrader.upgrade().catch(reason => logger.error(`Error during upgrade: ${reason.message}`, reason));
};
