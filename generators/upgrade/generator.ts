/**
 * Copyright 2013-2025 the original author or authors from the JHipster project.
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
import { setTimeout } from 'timers/promises';
import { readdir, rm } from 'fs/promises';
import chalk from 'chalk';
import gitignore from 'parse-gitignore';
import semver from 'semver';
import { ResetMode } from 'simple-git';

import BaseGenerator from '../base/index.js';
import { packageJson } from '../../lib/index.js';
import EnvironmentBuilder from '../../cli/environment-builder.mjs';
import { SERVER_MAIN_RES_DIR } from '../generator-constants.js';
import type { BaseApplicationConfiguration, BaseApplicationFeatures } from '../base-application/api.js';
import type { JHipsterGeneratorOptions } from '../../lib/types/application/options.js';
import type {
  BaseApplicationApplication,
  BaseApplicationControl,
  BaseApplicationEntity,
  BaseApplicationField,
  BaseApplicationPrimaryKey,
  BaseApplicationRelationship,
  BaseApplicationSources,
} from '../base-application/types.js';
import type {
  Entity as DeprecatedEntity,
  Field as DeprecatedField,
  Relationship as DeprecatedRelationship,
} from '../../lib/types/application/index.js';
import type { PrimaryKey as DeprecatedPrimarykey } from '../../lib/types/application/entity.js';
import type { ApplicationType, DeprecatedBaseApplicationSource } from '../../lib/types/application/application.js';
import type { TaskTypes as DefaultTaskTypes } from '../base-application/tasks.js';
import type { ApplicationConfiguration } from '../../lib/types/application/yo-rc.js';
import type { DeprecatedControl } from '../../lib/types/application/control.js';
import { GIT_VERSION_NOT_ALLOW_MERGE_UNRELATED_HISTORIES, UPGRADE_BRANCH } from './support/index.js';

/* Constants used throughout */
const GENERATOR_JHIPSTER = 'generator-jhipster';
const GENERATOR_APP = 'app';
const DEFAULT_CLI_OPTIONS = '--force --skip-install --skip-git --ignore-errors --no-insight --skip-checks';
const DEFAULT_NON_INTERATIVE_OPTIONS = {
  skipInstall: true,
  skipGit: true,
  skipChecks: true,
  force: true,
  ignoreErrors: true,
  skipPriorities: ['prompting'],
};
const DEFAULT_MERGE_OPTIONS = ['--strategy', 'ours'];

export default class UpgradeGenerator<
  // FIXME For the ones that are trying to fix the types, remove the equals and look at the consequences
  Options extends JHipsterGeneratorOptions = JHipsterGeneratorOptions,
  Field extends BaseApplicationField = DeprecatedField,
  PK extends BaseApplicationPrimaryKey<Field> = DeprecatedPrimarykey<Field>,
  Relationship extends BaseApplicationRelationship<any> = DeprecatedRelationship<any>,
  // @ts-ignore
  Entity extends BaseApplicationEntity<Field, PK, Relationship> = DeprecatedEntity<Field, PK, Relationship>,
  Application extends BaseApplicationApplication<Field, PK, Relationship, Entity> = ApplicationType,
  Sources extends BaseApplicationSources<Field, PK, Relationship, Entity, Application> = DeprecatedBaseApplicationSource<
    Field,
    Relationship,
    Application
  >,
  Control extends BaseApplicationControl = DeprecatedControl,
  TaskTypes extends DefaultTaskTypes<Field, PK, Relationship, Entity, Application, Sources, Control> = DefaultTaskTypes<
    Field,
    PK,
    Relationship,
    Entity,
    Application,
    Sources,
    Control
  >,
  Configuration extends BaseApplicationConfiguration = ApplicationConfiguration,
  Features extends BaseApplicationFeatures = BaseApplicationFeatures,
> extends BaseGenerator<Options, Entity, Application, Sources, Control, TaskTypes, Configuration, Features> {
  requiredPackage = GENERATOR_JHIPSTER;
  createEnvBuilder;
  actualApplicationBranch;
  silent;
  applyConfig;
  spawnStdio: 'inherit' | 'ignore' | 'pipe' | 'overlapped' = 'inherit';
  executable;
  verbose!: boolean;

  async beforeQueue() {
    if (!this.fromBlueprint) {
      await this.composeWithBlueprints();
    }
  }

  get initializing() {
    return this.asInitializingTaskGroup({
      displayLogo() {
        this.log.log(chalk.green('Welcome to the JHipster Upgrade Sub-Generator'));
        this.log.log(chalk.green(`This will upgrade your current application codebase to JHipster version ${packageJson.version}`));
        this.log.log(
          chalk.green(
            'For advanced options, please use the jhipster-migrate blueprint (https://github.com/jhipster/generator-jhipster-migrate/)',
          ),
        );
        this.log.log('');
      },
      initializeOptions() {
        if (this.silent) {
          this.spawnStdio = 'ignore';
        }
        this.executable = this.executable ?? this.options.programName ?? 'jhipster';
        this.createEnvBuilder = this.options.createEnvBuilder ?? EnvironmentBuilder.createDefaultBuilder;
      },

      assertJHipsterProject() {
        if (!this.config.existed) {
          throw new Error(
            "Could not find a valid JHipster application configuration, check if the '.yo-rc.json' file exists and if the 'generator-jhipster' key exists inside it.",
          );
        }

        if (!this.config.get('baseName')) {
          throw new Error('Current directory does not contain a JHipster project.');
        }
      },

      async checkoutDependency() {
        if (this.applyConfig) return;

        const jhipsterVersion = this.getPackageJsonVersion();
        if (!jhipsterVersion) {
          throw new Error('No generator-jhipster dependency found in your package.json');
        }
        if (this.isV7(jhipsterVersion)) {
          if (jhipsterVersion !== '7.9.4') {
            throw new Error('Upgrade the project to JHipster 7.9.4 before upgrading to the latest version.');
          }
          if ((this.jhipsterConfig.blueprints ?? []).length > 0) {
            const errorMessage =
              'Upgrade does not support upgrading a v7 project with blueprints. Please use the jhipster-migrate blueprint.';
            if (!this.skipChecks) {
              throw new Error(errorMessage);
            } else {
              this.log.warn(errorMessage);
            }
          }
        }
      },

      async assertGitPresent() {
        if (!(await this.checkGitVersion(GIT_VERSION_NOT_ALLOW_MERGE_UNRELATED_HISTORIES))) {
          this.log.warn('git is not found on your computer.\n', ` Install git: ${chalk.yellow('https://git-scm.com/')}`);
          throw new Error('Exiting the process.');
        }
      },

      async assertGitRepository() {
        const git = this.createGit();
        if (!(await git.checkIsRepo())) {
          this.log.warn('Current directory is not a git repository. Initializing git.');
          await git.init().add('.').commit('initial commit', ['--allow-empty', '--no-verify']);
        }
      },

      async assertNoLocalChanges() {
        const result = await this.createGit().status();
        if (!result.isClean()) {
          throw new Error(
            ` local changes found.\n\tPlease commit/stash them before upgrading\n\t${result.files
              .map(file => `${file.index} ${file.path}`)
              .join('\n\t')}`,
          );
        }
      },

      async detectCurrentBranch() {
        this.actualApplicationBranch = await this.createGit().revparse(['--abbrev-ref', 'HEAD']);
        if (this.actualApplicationBranch === UPGRADE_BRANCH) {
          throw new Error('You are on the upgrade branch, please switch to another branch before upgrading.');
        }
      },
    });
  }

  get [BaseGenerator.INITIALIZING]() {
    return this.delegateTasksToBlueprint(() => this.initializing);
  }

  get default() {
    return this.asDefaultTaskGroup({
      async prepareUpgradeBranch() {
        const git = this.createGit();

        // Checkout upgrade branch
        try {
          await git.revparse(['--verify', UPGRADE_BRANCH]);
          await git.checkout(UPGRADE_BRANCH);
        } catch {
          // Branch does not exist
          await git.checkout(['--orphan', UPGRADE_BRANCH]);
        }

        // Cleanup sources
        await this.cleanUp();

        if (this.applyConfig) {
          // Regenerate sources
          await this.runNonInteractive(false);
        } else {
          // Make sure the node_modules is up to date
          await this.spawnCommand('npm install', { stdio: this.spawnStdio });

          const customCliOptions: string[] = [];
          if (this.getPackageJsonVersion() === '7.9.4') {
            customCliOptions.push('--with-entities');
          }
          // Regenerate sources
          this.log.info(`Regenerating sources using ${this.executable} executable`);
          await this.spawn('npx', ['--no', this.executable, ...customCliOptions, ...DEFAULT_CLI_OPTIONS.split(' ')], {
            stdio: this.spawnStdio,
          });
        }

        await this.rmRf(`${SERVER_MAIN_RES_DIR}config/tls/keystore.p12`);

        // Commit changes
        await git.add('.').commit(`generated ${UPGRADE_BRANCH} using JHipster ${this.getPackageJsonVersion()}`, ['--no-verify']);

        this.log.info('reference application created');

        // Add 1s between commits for more consistent git log
        await setTimeout(1000);
      },

      async prepareSourceBranch() {
        const git = this.createGit();
        await git
          .checkout(this.actualApplicationBranch, ['-f'])
          .merge([
            UPGRADE_BRANCH,
            ...DEFAULT_MERGE_OPTIONS,
            '-m',
            `reference merge of ${UPGRADE_BRANCH} branch into ${this.actualApplicationBranch}`,
            '--allow-unrelated-histories',
          ]);

        this.log.info('reference application merged into source branch');

        // Add 1s between commits for more consistent git log
        await setTimeout(1000);
      },

      async updateUpgradeBranch() {
        const git = this.createGit();
        // Switch back to upgrade branch
        await git.checkout(UPGRADE_BRANCH);

        // Cleanup sources
        await this.cleanUp();

        // Regenerate sources
        await this.runNonInteractive();

        await this.rmRf(`${SERVER_MAIN_RES_DIR}config/tls/keystore.p12`);

        // Commit changes
        await git.add('.').commit(`generated ${UPGRADE_BRANCH} using JHipster ${packageJson.version}`, ['--no-verify']);

        this.log.info('upgrade commit created');

        // Add 1s between commits for more consistent git log
        await setTimeout(1000);
      },

      async upgradeSourceBranch() {
        const git = this.createGit();
        await git
          .checkout(this.actualApplicationBranch, ['-f'])
          .merge([UPGRADE_BRANCH, '-m', `upgrade merge of ${UPGRADE_BRANCH} branch into ${this.actualApplicationBranch}`])
          .reset(ResetMode.HARD);

        this.log.info('upgrade application merged into source branch');

        if (!this.applyConfig) {
          // Remove packages to allow a clean install
          await this.rmRf('node_modules');
          await this.rmRf('package-lock.json');

          this.log.info('node_modules and package-lock.json removed to allow a clean install');
        }
      },
    });
  }

  get [BaseGenerator.DEFAULT]() {
    return this.delegateTasksToBlueprint(() => this.default);
  }

  get end() {
    return this.asEndTaskGroup({
      async end() {
        const diff = await this.createGit().diff(['--name-only', '--diff-filter', 'U']);
        this.log.ok(chalk.bold('upgraded successfully.'));
        if (diff) {
          this.log.warn(`please fix conflicts listed below and commit!\n${diff}`);
        }
      },
    });
  }

  get [BaseGenerator.END]() {
    return this.delegateTasksToBlueprint(() => this.end);
  }

  async rmRf(file) {
    const absolutePath = this.destinationPath(file);
    if (this.verbose) {
      this.log.verboseInfo(`Removing ${absolutePath}`);
    }

    try {
      await rm(absolutePath, { recursive: true });
    } catch {
      // ignore
    }
  }

  /**
   * Remove every generated file not related to the generation.
   */
  async cleanUp() {
    const gitignoreContent = this.readDestination('.gitignore', { defaults: '' });
    const ignoredFiles = gitignoreContent ? (gitignore(gitignoreContent).patterns ?? []) : [];
    const filesToKeep = ['.yo-rc.json', '.jhipster', 'package.json', 'package-lock.json', 'node_modules', '.git', ...ignoredFiles];
    for (const file of await readdir(this.destinationPath())) {
      if (!filesToKeep.includes(file)) {
        await this.rmRf(file);
      }
    }
    this.log.info('cleaned up project directory');
  }

  getPackageJsonVersion() {
    return this.readDestinationJSON('package.json').devDependencies?.['generator-jhipster'];
  }

  isV7(version) {
    return version.includes('.') && parseInt(version.split('.', 2), 10) < 8;
  }

  async runNonInteractive(inherit = true) {
    const adapter = this.env.adapter.newAdapter?.();
    const sharedFs = inherit ? this.env.sharedFs : undefined;
    const inheritedOptions = inherit ? this.options : {};
    const envOptions = { sharedFs, adapter };
    const generatorOptions = { ...inheritedOptions, ...DEFAULT_NON_INTERATIVE_OPTIONS };

    const envBuilder = await this.createEnvBuilder(envOptions);
    const env = envBuilder.getEnvironment();
    await env.run([`jhipster:${GENERATOR_APP}`], generatorOptions);
  }

  /**
   * Check git version.
   */
  async checkGitVersion(minVersion) {
    try {
      const rawVersion = await this.createGit().raw('--version');
      const gitVersion = String(rawVersion.match(/([0-9]+\.[0-9]+\.[0-9]+)/g));
      if (minVersion) {
        return semver.gte(gitVersion, minVersion);
      }

      return true;
    } catch {
      return false;
    }
  }
}
