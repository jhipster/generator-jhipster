/**
 * Copyright 2013-2022 the original author or authors from the JHipster project.
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
/* eslint-disable consistent-return */
const chalk = require('chalk');
const _ = require('lodash');
const BaseBlueprintGenerator = require('../generator-base-blueprint');
const {
  INITIALIZING_PRIORITY,
  PROMPTING_PRIORITY,
  CONFIGURING_PRIORITY,
  COMPOSING_PRIORITY,
  DEFAULT_PRIORITY,
  WRITING_PRIORITY,
  INSTALL_PRIORITY,
  END_PRIORITY,
} = require('../../lib/constants/priorities.cjs').compat;

const cleanup = require('../cleanup');
const prompts = require('./prompts');
const packagejs = require('../../package.json');
const statistics = require('../statistics');
const { appDefaultConfig } = require('../generator-defaults');
const { GENERATOR_APP } = require('../generator-list');
const { GENERATOR_JHIPSTER } = require('../generator-constants');
const { MICROSERVICE } = require('../../jdl/jhipster/application-types');
const { OptionNames } = require('../../jdl/jhipster/application-options');
const { NO: CLIENT_FRAMEWORK_NO } = require('../../jdl/jhipster/client-framework-types');

const { JHI_PREFIX, BASE_NAME, JWT_SECRET_KEY, PACKAGE_NAME, PACKAGE_FOLDER, REMEMBER_ME_KEY } = OptionNames;
const {
  GENERATOR_COMMON,
  GENERATOR_ENTITIES,
  GENERATOR_LANGUAGES,
  GENERATOR_CLIENT,
  GENERATOR_PAGE,
  GENERATOR_SERVER,
} = require('../generator-list');

module.exports = class JHipsterAppGenerator extends BaseBlueprintGenerator {
  constructor(args, options, features) {
    super(args, options, { unique: 'namespace', ...features });

    this.option('defaults', {
      desc: 'Execute jhipster with default config',
      type: Boolean,
      defaults: false,
    });
    this.option('base-name', {
      desc: 'Application base name',
      type: String,
    });
    this.option('application-type', {
      desc: 'Application type to generate',
      type: String,
    });

    this.option('client-framework', {
      desc: 'Provide client framework for the application',
      type: String,
    });

    // This adds support for a `--skip-client` flag
    this.option('skip-client', {
      desc: 'Skip the client-side application generation',
      type: Boolean,
    });

    // This adds support for a `--skip-server` flag
    this.option('skip-server', {
      desc: 'Skip the server-side application generation',
      type: Boolean,
    });

    // This adds support for a `--skip-git` flag
    this.option('skip-git', {
      desc: 'Skip the git initialization',
      type: Boolean,
      defaults: false,
    });

    // This adds support for a `--skip-commit-hook` flag
    this.option('skip-commit-hook', {
      desc: 'Skip adding husky commit hooks',
      type: Boolean,
    });

    // This adds support for a `--skip-user-management` flag
    this.option('skip-user-management', {
      desc: 'Skip the user management module during app generation',
      type: Boolean,
    });

    // This adds support for a `--skip-check-length-of-identifier` flag
    this.option('skip-check-length-of-identifier', {
      desc: 'Skip check the length of the identifier, only for recent Oracle databases that support 30+ characters metadata',
      type: Boolean,
    });

    // This adds support for a `--skip-fake-data` flag
    this.option('skip-fake-data', {
      desc: 'Skip generation of fake data for development',
      type: Boolean,
    });

    // This adds support for a `--with-entities` flag
    this.option('with-entities', {
      alias: 'e',
      desc: 'Regenerate the existing entities if any',
      type: Boolean,
    });

    // This adds support for a `--skip-checks` flag
    this.option('skip-checks', {
      desc: 'Check the status of the required tools',
      type: Boolean,
    });

    // This adds support for a `--jhi-prefix` flag
    this.option('jhi-prefix', {
      desc: 'Add prefix before services, controllers and states name',
      type: String,
    });

    // This adds support for a `--entity-suffix` flag
    this.option('entity-suffix', {
      desc: 'Add suffix after entities name',
      type: String,
    });

    // This adds support for a `--dto-suffix` flag
    this.option('dto-suffix', {
      desc: 'Add suffix after dtos name',
      type: String,
    });

    // This adds support for a `--auth` flag
    this.option('auth', {
      desc: 'Provide authentication type for the application when skipping server side generation',
      type: String,
    });

    // This adds support for a `--db` flag
    this.option('db', {
      desc: 'Provide DB name for the application when skipping server side generation',
      type: String,
    });

    // This adds support for a `--build` flag
    this.option('build', {
      desc: 'Provide build tool for the application when skipping server side generation',
      type: String,
    });

    // This adds support for a `--websocket` flag
    this.option('websocket', {
      desc: 'Provide websocket option for the application when skipping server side generation',
      type: String,
    });

    // This adds support for a `--search-engine` flag
    this.option('search-engine', {
      desc: 'Provide search engine for the application when skipping server side generation',
      type: String,
    });

    // NOTE: Deprecated!!! Use --blueprints instead
    this.option('blueprint', {
      desc: 'DEPRECATED: Specify a generator blueprint to use for the sub generators',
      type: String,
    });
    // This adds support for a `--blueprints` flag which can be used to specify one or more blueprints to use for generation
    this.option('blueprints', {
      desc: 'A comma separated list of one or more generator blueprints to use for the sub generators, e.g. --blueprints kotlin,vuejs',
      type: String,
    });

    // This adds support for a `--experimental` flag which can be used to enable experimental features
    this.option('experimental', {
      desc: 'Enable experimental features. Please note that these features may be unstable and may undergo breaking changes at any time',
      type: Boolean,
    });

    // This adds support for a `--creation-timestamp` flag which can be used create reproducible builds
    this.option('creation-timestamp', {
      desc: 'Project creation timestamp (used for reproducible builds)',
      type: String,
    });

    this.option('incremental-changelog', {
      desc: 'Creates incremental database changelogs',
      type: Boolean,
    });

    this.option('recreate-initial-changelog', {
      desc: 'Recreate the initial database changelog based on the current config',
      type: Boolean,
    });

    this.option('skip-jhipster-dependencies', {
      desc: "Don't write jhipster dependencies.",
      type: Boolean,
    });

    this.option('legacy-db-names', {
      desc: 'Generate database names with jhipster 6 compatibility.',
      type: Boolean,
    });

    this.option('ignore-errors', {
      desc: "Don't fail on prettier errors.",
      type: Boolean,
    });

    this.option('native-language', {
      alias: 'n',
      desc: 'Set application native language',
      type: String,
      required: false,
    });

    this.option('enable-translation', {
      desc: 'Enable translation',
      type: Boolean,
      required: false,
    });

    this.option('language', {
      alias: 'l',
      desc: 'Language to be added to application (existing languages are not removed)',
      type: Array,
    });

    this.option('pk-type', {
      desc: 'Default primary key type (beta)',
      type: String,
    });

    this.option('reproducible', {
      desc: 'Try to reproduce changelog',
      type: Boolean,
    });

    this.option('client-package-manager', {
      desc: 'Force an unsupported client package manager',
      type: String,
    });

    this.option('cypress-coverage', {
      desc: 'Enable Cypress code coverage report generation',
      type: Boolean,
    });

    this.option('cypress-audit', {
      desc: 'Enable cypress-audit/lighthouse report generation',
      type: Boolean,
    });

    this.option('microfrontend', {
      desc: 'Force generation of experimental microfrontend support',
      type: Boolean,
    });

    this.option('test-frameworks', {
      desc: 'Test frameworks to be generated',
      type: Array,
    });

    this.option('reactive', {
      desc: 'Generate a reactive backend',
      type: Boolean,
    });

    this.option('enable-swagger-codegen', {
      desc: 'API first development using OpenAPI-generator',
      type: Boolean,
    });

    this.option('cache-provider', {
      desc: 'Cache provider',
      type: String,
    });

    this.option('enable-hibernate-cache', {
      desc: 'Enable hibernate cache',
      type: Boolean,
    });

    this.option('auto-crlf', {
      desc: 'Detect line endings',
      type: Boolean,
    });

    // Just constructing help, stop here
    if (this.options.help) {
      return;
    }

    this.loadStoredAppOptions();
    this.loadRuntimeOptions();

    // Use jhipster defaults
    if (this.options.defaults || this.options.withEntities) {
      if (!this.jhipsterConfig.baseName) {
        this.jhipsterConfig.baseName = this.getDefaultAppName();
      }
      this.setConfigDefaults(this.getDefaultConfigForApplicationType());
    }

    this.existingProject = this.jhipsterConfig.baseName !== undefined && this.jhipsterConfig.applicationType !== undefined;
    // preserve old jhipsterVersion value for cleanup which occurs after new config is written into disk
    this.jhipsterOldVersion = this.jhipsterConfig.jhipsterVersion;
  }

  async _postConstruct() {
    if (!this.fromBlueprint) {
      await this.composeWithBlueprints(GENERATOR_APP);
    }
  }

  _initializing() {
    return {
      validateFromCli() {
        this.checkInvocationFromCLI();
      },

      displayLogo() {
        this.printJHipsterLogo();
      },

      validateBlueprint() {
        if (this.jhipsterConfig.blueprints && !this.skipChecks) {
          this.jhipsterConfig.blueprints.forEach(blueprint => {
            this._checkJHipsterBlueprintVersion(blueprint.name);
            this._checkBlueprint(blueprint.name);
          });
        }
      },

      validateJava() {
        this.checkJava();
      },

      validateNode() {
        this.checkNode();
      },

      validateGit() {
        this.checkGit();
      },

      checkForNewJHVersion() {
        if (!this.skipChecks) {
          this.checkForNewVersion();
        }
      },

      validate() {
        if (this.skipServer && this.skipClient) {
          this.error(`You can not pass both ${chalk.yellow('--skip-client')} and ${chalk.yellow('--skip-server')} together`);
        }
      },
    };
  }

  get [INITIALIZING_PRIORITY]() {
    if (this.delegateToBlueprint) {
      return;
    }
    return this._initializing();
  }

  _prompting() {
    return {
      askForInsightOptIn: prompts.askForInsightOptIn,
      askForApplicationType: prompts.askForApplicationType,
      askForModuleName: prompts.askForModuleName,
    };
  }

  get [PROMPTING_PRIORITY]() {
    if (this.delegateToBlueprint) return;
    return this._prompting();
  }

  _configuring() {
    return {
      setup() {
        // Update jhipsterVersion.
        this.jhipsterConfig.jhipsterVersion = packagejs.version;

        this.configOptions.logo = false;
        if (this.jhipsterConfig.applicationType === MICROSERVICE) {
          this.jhipsterConfig.skipClient =
            this.jhipsterConfig.skipClient ||
            !this.jhipsterConfig.clientFramework ||
            this.jhipsterConfig.clientFramework === CLIENT_FRAMEWORK_NO;
          this.jhipsterConfig.withAdminUi = false;
          this.jhipsterConfig.skipUserManagement = true;
        } else {
          this.jhipsterConfig.skipClient = this.jhipsterConfig.skipClient || this.jhipsterConfig.clientFramework === CLIENT_FRAMEWORK_NO;
        }

        if (this.jhipsterConfig.skipClient) {
          this.jhipsterConfig.clientFramework = CLIENT_FRAMEWORK_NO;
        }

        // Set app defaults
        this.setConfigDefaults(appDefaultConfig);
      },
      fixConfig() {
        this.jhipsterConfig.jhiPrefix = _.camelCase(this.jhipsterConfig.jhiPrefix);
      },
    };
  }

  get [CONFIGURING_PRIORITY]() {
    if (this.delegateToBlueprint) return;
    return this._configuring();
  }

  _composing() {
    return {
      /**
       * Composing with others generators, must be executed after `configuring` priority to let others
       * generators `configuring` priority to run.
       *
       * Generators `server`, `client`, `common`, `languages` depends on each other.
       * We are composing in the same task so every priority are executed in parallel.
       * - compose (app) -> initializing (common) -> initializing (server) -> ...
       *
       * When composing in different tasks the result would be:
       * - composeCommon (app) -> initializing (common) -> prompting (common) -> ... -> composeServer (app) -> initializing (server) -> ...
       */
      async compose() {
        await this.composeWithJHipster(GENERATOR_COMMON, true);
        if (!this.jhipsterConfig.skipServer) {
          await this.composeWithJHipster(GENERATOR_SERVER, true);
        }
        if (this.jhipsterConfig.clientFramework !== CLIENT_FRAMEWORK_NO) {
          await this.composeWithJHipster(GENERATOR_CLIENT, true);
        }
        if (!this.configOptions.skipI18n) {
          await this.composeWithJHipster(
            GENERATOR_LANGUAGES,
            {
              regenerate: true,
              skipPrompts: this.options.withEntities || this.existingProject || this.options.defaults,
            },
            true
          );
        }
      },
      askForTestOpts: prompts.askForTestOpts,

      askForMoreModules: prompts.askForMoreModules,

      /**
       * At this point every other generator should already be configured, so, enforce defaults fallback.
       */
      saveConfigWithDefaults() {
        this.setConfigDefaults();

        this._validateAppConfiguration();
      },

      saveBlueprintConfig() {
        const config = {};
        this.blueprints && (config.blueprints = this.blueprints);
        this.blueprintVersion && (config.blueprintVersion = this.blueprintVersion);
        this.config.set(config);
      },

      async composeEntities() {
        if (!this.options.withEntities) return;
        await this.composeWithJHipster(GENERATOR_ENTITIES, { skipInstall: true }, true);
      },

      async composePages() {
        if (!this.jhipsterConfig.pages || this.jhipsterConfig.pages.length === 0 || this.configOptions.skipComposePage) return;
        this.configOptions.skipComposePage = true;
        await Promise.all(
          this.jhipsterConfig.pages.map(page => {
            return this.composeWithJHipster(page.generator || GENERATOR_PAGE, [page.name], {
              skipInstall: true,
              page,
            });
          })
        );
      },
    };
  }

  get [COMPOSING_PRIORITY]() {
    if (this.delegateToBlueprint) return;
    return this._composing();
  }

  _default() {
    return {
      ...super._missingPreDefault(),

      insight() {
        const yorc = {
          ..._.omit(this.jhipsterConfig, [JHI_PREFIX, BASE_NAME, JWT_SECRET_KEY, PACKAGE_NAME, PACKAGE_FOLDER, REMEMBER_ME_KEY]),
        };
        yorc.applicationType = this.jhipsterConfig.applicationType;
        statistics.sendYoRc(yorc, this.existingProject, this.jhipsterConfig.jhipsterVersion);
      },
    };
  }

  get [DEFAULT_PRIORITY]() {
    if (this.delegateToBlueprint) return;
    return this._default();
  }

  _writing() {
    return {
      cleanup() {
        cleanup.cleanupOldFiles(this);
        cleanup.upgradeFiles(this);
      },

      ...super._missingPostWriting(),
    };
  }

  get [WRITING_PRIORITY]() {
    if (this.delegateToBlueprint) return;
    return this._writing();
  }

  // Public API method used by the getter and also by Blueprints
  _install() {
    return {
      /** Initialize git repository before package manager install for commit hooks */
      initGitRepo() {
        if (!this.options.skipGit) {
          this.initializeGitRepository();
        }
      },
    };
  }

  get [INSTALL_PRIORITY]() {
    if (this.delegateToBlueprint) return;
    return this._install();
  }

  _end() {
    return {
      /** Initial commit to git repository after package manager install for package-lock.json */
      gitCommit() {
        if (!this.options.skipGit && this.isGitInstalled()) {
          let commitMsg = `Initial version of ${this.jhipsterConfig.baseName} generated by ${GENERATOR_JHIPSTER}@${this.jhipsterConfig.jhipsterVersion}`;
          if (this.jhipsterConfig.blueprints && this.jhipsterConfig.blueprints.length > 0) {
            const bpInfo = this.jhipsterConfig.blueprints.map(bp => `${bp.name}@${bp.version}`).join(', ');
            commitMsg += ` with blueprints: ${bpInfo}`;
          }

          this.commitFilesToGit(commitMsg, this.async());
        }
      },

      afterRunHook() {
        try {
          const modules = this.getModuleHooks();
          if (modules.length > 0) {
            this.log(`\n${chalk.bold.green('Running post run module hooks\n')}`);
            // run through all post app creation module hooks
            this.callHooks('app', 'post', {
              appConfig: this.configOptions,
              force: this.options.force,
            });
          }
        } catch (err) {
          this.log(`\n${chalk.bold.red('Running post run module hooks failed. No modification done to the generated app.')}`);
          this.debug('Error:', err);
        }
        this.log(
          chalk.green(
            `\nIf you find JHipster useful consider sponsoring the project ${chalk.yellow('https://www.jhipster.tech/sponsors/')}`
          )
        );
      },
    };
  }

  get [END_PRIORITY]() {
    if (this.delegateToBlueprint) return;
    return this._end();
  }

  _validateAppConfiguration(config = this.jhipsterConfig) {
    if (config.entitySuffix === config.dtoSuffix) {
      this.error('Entities cannot be generated as the entity suffix and DTO suffix are equals !');
    }
  }
};
