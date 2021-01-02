/**
 * Copyright 2013-2020 the original author or authors from the JHipster project.
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
/* eslint-disable consistent-return */
const chalk = require('chalk');
const _ = require('lodash');
const BaseBlueprintGenerator = require('../generator-base-blueprint');
const prompts = require('./prompts');
const writeAngularFiles = require('./files-angular').writeFiles;
const writeReactFiles = require('./files-react').writeFiles;
const writeVueFiles = require('./files-vue').writeFiles;
const writeCommonFiles = require('./files-common').writeFiles;
const packagejs = require('../../package.json');
const constants = require('../generator-constants');
const statistics = require('../statistics');
const { clientDefaultConfig } = require('../generator-defaults');

const { ANGULAR, REACT, VUE } = constants.SUPPORTED_CLIENT_FRAMEWORKS;

let useBlueprints;

module.exports = class JHipsterClientGenerator extends BaseBlueprintGenerator {
    constructor(args, opts) {
        super(args, opts);

        // This adds support for a `--from-cli` flag
        this.option('from-cli', {
            desc: 'Indicates the command is run from JHipster CLI',
            type: Boolean,
            defaults: false,
        });
        // This adds support for a `--auth` flag
        this.option('auth', {
            desc: 'Provide authentication type for the application',
            type: String,
        });

        // This adds support for a `--skip-commit-hook` flag
        this.option('skip-commit-hook', {
            desc: 'Skip adding husky commit hooks',
            type: Boolean,
        });

        // This adds support for a `--experimental` flag which can be used to enable experimental features
        this.option('experimental', {
            desc:
                'Enable experimental features. Please note that these features may be unstable and may undergo breaking changes at any time',
            type: Boolean,
        });

        if (this.options.help) {
            return;
        }

        this.loadStoredAppOptions();
        this.loadRuntimeOptions();

        this.existingProject = !!this.jhipsterConfig.clientFramework;

        useBlueprints = !this.fromBlueprint && this.instantiateBlueprints('client');
    }

    // Public API method used by the getter and also by Blueprints
    _initializing() {
        return {
            validateFromCli() {
                this.checkInvocationFromCLI();
            },

            displayLogo() {
                if (this.logo) {
                    this.printJHipsterLogo();
                }
            },

            setupClientConstants() {
                // Make constants available in templates
                this.LOGIN_REGEX = constants.LOGIN_REGEX_JS;
                this.ANGULAR = ANGULAR;
                this.HUSKY_VERSION = constants.HUSKY_VERSION;
                this.LINT_STAGED_VERSION = constants.LINT_STAGED_VERSION;
                this.PRETTIER_VERSION = constants.PRETTIER_VERSION;
                this.PRETTIER_JAVA_VERSION = constants.PRETTIER_JAVA_VERSION;
                this.NODE_VERSION = constants.NODE_VERSION;
            },
        };
    }

    get initializing() {
        if (useBlueprints) return;
        return this._initializing();
    }

    // Public API method used by the getter and also by Blueprints
    _prompting() {
        return {
            askForModuleName: prompts.askForModuleName,
            askForClient: prompts.askForClient,
            askForClientTheme: prompts.askForClientTheme,
            askForClientThemeVariant: prompts.askForClientThemeVariant,
        };
    }

    get prompting() {
        if (useBlueprints) return;
        return this._prompting();
    }

    // Public API method used by the getter and also by Blueprints
    _configuring() {
        return {
            configureGlobal() {
                // Make constants available in templates
                this.MAIN_SRC_DIR = this.CLIENT_MAIN_SRC_DIR;
                this.TEST_SRC_DIR = this.CLIENT_TEST_SRC_DIR;
                this.packagejs = packagejs;
            },

            saveConfig() {
                this.setConfigDefaults(clientDefaultConfig);
            },
        };
    }

    get configuring() {
        if (useBlueprints) return;
        return this._configuring();
    }

    // Public API method used by the getter and also by Blueprints
    _composing() {
        return {
            composeCommon() {
                this.composeWithJHipster('common', true);
            },
            composeCypress() {
                const testFrameworks = this.jhipsterConfig.testFrameworks;
                if (!Array.isArray(testFrameworks) || !testFrameworks.includes('cypress')) return;
                this.composeWithJHipster('cypress', true);
            },
            composeLanguages() {
                // We don't expose client/server to cli, composing with languages is used for test purposes.
                if (this.jhipsterConfig.enableTranslation === false) return;

                this.composeWithJHipster('languages', true);
            },
        };
    }

    get composing() {
        if (useBlueprints) return;
        return this._composing();
    }

    // Public API method used by the getter and also by Blueprints
    _loading() {
        return {
            loadSharedConfig() {
                this.loadAppConfig();
                this.loadClientConfig();
                this.loadServerConfig();
                this.loadTranslationConfig();
            },

            validateSkipServer() {
                if (
                    this.jhipsterConfig.skipServer &&
                    !(
                        this.jhipsterConfig.databaseType &&
                        this.jhipsterConfig.devDatabaseType &&
                        this.jhipsterConfig.prodDatabaseType &&
                        this.jhipsterConfig.authenticationType
                    )
                ) {
                    this.error(
                        `When using skip-server flag, you must pass a database option and authentication type using ${chalk.yellow(
                            '--db'
                        )} and ${chalk.yellow('--auth')} flags`
                    );
                }
                if (
                    this.jhipsterConfig.skipServer &&
                    this.jhipsterConfig.authenticationType === 'uaa' &&
                    !this.jhipsterConfig.uaaBaseName
                ) {
                    this.error(
                        `When using skip-server flag and UAA as authentication method, you must pass a UAA base name using ${chalk.yellow(
                            '--uaa-base-name'
                        )} flag`
                    );
                }
            },
        };
    }

    get loading() {
        if (useBlueprints) return;
        return this._loading();
    }

    // Public API method used by the getter and also by Blueprints
    _preparing() {
        return {
            prepareForTemplates() {
                this.enableI18nRTL = false;
                if (this.languages !== undefined) {
                    this.enableI18nRTL = this.isI18nRTLSupportNecessary(this.languages);
                }

                // Make dist dir available in templates
                this.BUILD_DIR = this.getBuildDirectoryForBuildTool(this.buildTool);

                this.styleSheetExt = 'scss';
                this.pkType = this.getPkType(this.databaseType);
                this.apiUaaPath = `${this.authenticationType === 'uaa' ? `services/${this.uaaBaseName.toLowerCase()}/` : ''}`;
                this.DIST_DIR = this.getResourceBuildDirectoryForBuildTool(this.buildTool) + constants.CLIENT_DIST_DIR;

                // Application name modified, using each technology's conventions
                this.camelizedBaseName = _.camelCase(this.baseName);
                this.frontendAppName = this.getFrontendAppName();
                this.hipster = this.getHipster(this.baseName);
                this.capitalizedBaseName = _.upperFirst(this.baseName);
                this.dasherizedBaseName = _.kebabCase(this.baseName);
                this.lowercaseBaseName = this.baseName.toLowerCase();

                if (this.authenticationType === 'oauth2' || (this.databaseType === 'no' && this.authenticationType !== 'uaa')) {
                    this.skipUserManagement = true;
                }
            },
        };
    }

    get preparing() {
        if (useBlueprints) return;
        return this._preparing();
    }

    // Public API method used by the getter and also by Blueprints
    _default() {
        return {
            ...super._missingPreDefault(),

            insight() {
                statistics.sendSubGenEvent('generator', 'client', {
                    app: {
                        clientFramework: this.clientFramework,
                        enableTranslation: this.enableTranslation,
                        nativeLanguage: this.nativeLanguage,
                        languages: this.languages,
                    },
                });
            },
        };
    }

    get default() {
        if (useBlueprints) return;
        return this._default();
    }

    // Public API method used by the getter and also by Blueprints
    _writing() {
        return {
            write() {
                if (this.skipClient) return;
                switch (this.clientFramework) {
                    case ANGULAR:
                        return writeAngularFiles.call(this, useBlueprints);
                    case REACT:
                        return writeReactFiles.call(this, useBlueprints);
                    case VUE:
                        return writeVueFiles.call(this, useBlueprints);
                    default:
                    // do nothing by default
                }
            },
            writeCommonFiles() {
                if (this.skipClient) return;
                return writeCommonFiles.call(this, useBlueprints);
            },

            ...super._missingPostWriting(),
        };
    }

    get writing() {
        if (useBlueprints) return;
        return this._writing();
    }

    // Public API method used by the getter and also by Blueprints
    _postWriting() {
        return {
            packageJsonScripts() {
                if (this.skipClient) return;
                const packageJsonStorage = this.createStorage('package.json');
                const scriptsStorage = packageJsonStorage.createStorage('scripts');

                const packageJsonConfigStorage = packageJsonStorage.createStorage('config').createProxy();
                if (process.env.JHI_PROFILE) {
                    packageJsonConfigStorage.default_environment = process.env.JHI_PROFILE.includes('dev') ? 'dev' : 'prod';
                }

                const devDependencies = packageJsonStorage.createStorage('devDependencies');
                devDependencies.set('wait-on', 'VERSION_MANAGED_BY_CLIENT_COMMON');
                devDependencies.set('concurrently', 'VERSION_MANAGED_BY_CLIENT_COMMON');

                if (this.clientFramework === 'react') {
                    scriptsStorage.set(
                        'ci:frontend:test',
                        'npm run webpack:build:$npm_package_config_default_environment && npm run test-ci'
                    );
                } else {
                    scriptsStorage.set('ci:frontend:test', 'npm run webpack:build:$npm_package_config_default_environment && npm test');
                }

                if (scriptsStorage.get('e2e')) {
                    scriptsStorage.set({
                        'ci:server:await':
                            'echo "Waiting for server at port $npm_package_config_backend_port to start" && wait-on http-get://localhost:$npm_package_config_backend_port/management/health && echo "Server at port $npm_package_config_backend_port started"',
                        'pree2e:headless': 'npm run ci:server:await',
                        'ci:e2e:run': 'concurrently -k -s first "npm run ci:e2e:server:start" "npm run e2e:headless"',
                        'e2e:dev': 'concurrently -k -s first "./mvnw" "e2e:run"',
                    });
                }
            },

            packageJson() {
                if (this.skipClient) return;
                this.replacePackageJsonVersions(
                    'VERSION_MANAGED_BY_CLIENT_COMMON',
                    this.fetchFromInstalledJHipster('client/templates/common/package.json')
                );
                switch (this.clientFramework) {
                    case ANGULAR:
                        this.replacePackageJsonVersions(
                            'VERSION_MANAGED_BY_CLIENT_ANGULAR',
                            this.fetchFromInstalledJHipster('client/templates/angular/package.json')
                        );
                        break;
                    case REACT:
                        this.replacePackageJsonVersions(
                            'VERSION_MANAGED_BY_CLIENT_REACT',
                            this.fetchFromInstalledJHipster('client/templates/react/package.json')
                        );
                        break;
                    case VUE:
                        this.replacePackageJsonVersions(
                            'VERSION_MANAGED_BY_CLIENT_VUE',
                            this.fetchFromInstalledJHipster('client/templates/vue/package.json')
                        );
                        break;
                    default:
                    // do nothing by default
                }
            },
        };
    }

    get postWriting() {
        if (useBlueprints) return;
        return this._postWriting();
    }

    // Public API method used by the getter and also by Blueprints
    _install() {
        return {
            installing() {
                if (this.skipClient) return;
                const logMsg = `To install your dependencies manually, run: ${chalk.yellow.bold(`${this.clientPackageManager} install`)}`;

                const installConfig = {
                    bower: false,
                    npm: true,
                };

                if (this.options.skipInstall) {
                    this.log(logMsg);
                } else {
                    try {
                        this.installDependencies(installConfig);
                    } catch (e) {
                        this.warning('Install of dependencies failed!');
                        this.log(logMsg);
                    }
                }
            },
        };
    }

    get install() {
        if (useBlueprints) return;
        return this._install();
    }

    // Public API method used by the getter and also by Blueprints
    _end() {
        return {
            end() {
                if (this.skipClient) return;
                this.log(chalk.green.bold('\nClient application generated successfully.\n'));

                const logMsg = `Start your Webpack development server with:\n ${chalk.yellow.bold(`${this.clientPackageManager} start`)}\n`;

                this.log(chalk.green(logMsg));
                if (!this.options.skipInstall) {
                    this.spawnCommandSync(this.clientPackageManager, ['run', 'cleanup']);
                }
            },
        };
    }

    get end() {
        if (useBlueprints) return;
        return this._end();
    }
};
