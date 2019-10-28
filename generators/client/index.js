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
/* eslint-disable consistent-return */
const chalk = require('chalk');
const _ = require('lodash');
const debug = require('debug')('jhipster:client');

const BaseBlueprintGenerator = require('../generator-base-blueprint');
const writeAngularFiles = require('./files-angular').writeFiles;
const writeReactFiles = require('./files-react').writeFiles;
const packagejs = require('../../package.json');
const constants = require('../generator-constants');
const statistics = require('../statistics');

const defaultConfig = {
    jhipsterVersion: packagejs.version,
    jhiPrefix: 'jhi',
    clientFramework: 'angularX',
    clientTheme: 'none',
    applicationType: 'monolith',
    useSass: true
};

module.exports = class extends BaseBlueprintGenerator {
    constructor(args, opts) {
        super(args, opts);

        // eslint-disable-next-line global-require
        require('../interceptor').registerDiff(this);

        debug(`Initializing ${this.rootGeneratorName()}:client generator`);

        this._.defaults(this.storedConfig, defaultConfig, { clientPackageManager: this.options.yarn ? 'yarn' : 'npm' });
        this._.defaults(this.configOptions, {
            useNpm: !this.options.yarn,
            useYarn: this.options.yarn
        });

        // This adds support for a `--from-cli` flag
        this.option('from-cli', {
            desc: 'Indicates the command is run from JHipster CLI',
            type: Boolean,
            defaults: false
        });
        // This adds support for a `--auth` flag
        this.option('authentication-type', {
            alias: 'auth',
            desc: 'Provide authentication type for the application',
            type: String
        });

        // This adds support for a `--skip-commit-hook` flag
        this.option('skip-commit-hook', {
            desc: 'Skip adding husky commit hooks',
            type: Boolean,
            defaults: false
        });

        // This adds support for a `--experimental` flag which can be used to enable experimental features
        this.option('experimental', {
            desc:
                'Enable experimental features. Please note that these features may be unstable and may undergo breaking changes at any time',
            type: Boolean,
            defaults: false,
            scope: 'shared'
        });

        this.loadScopedOptions();
        this.loadScopedOptions('storage', [
            'base-name',
            'uaa-base-name',
            'jhi-prefix',
            'skip-user-management',
            'skip-commit-hook',
            'authentication-type'
        ]);

        // Make constants available in templates
        this._.defaults(this, constants.filter(/^CLIENT_*/));

        this.useBlueprints = !this.fromBlueprint && this.instantiateBlueprints('client');

        // For blueprint, let the original generator call the config.
        // For derivated generator, the main generator already called config.
        // Add option to skip config, use only saved resource.
        if (!this.fromBlueprint && this.isRootGenerator && !this.options.skipConfig) {
            this.composeWithShared(require.resolve('../config'), {
                ...this.options,
                generatorSource: this,
                debug: this.isDebugEnabled
            });
        }
    }

    // Public API method used by the getter and also by Blueprints
    _initializing() {
        return {
            loadSharedData() {
                this.loadShared();
            },

            validateFromCli() {
                this.checkInvocationFromCLI();
            },

            displayLogo() {
                this.printJHipsterLogo();
            },

            setupClientconsts() {
                // Make constants available in templates
                this.MAIN_SRC_DIR = constants.CLIENT_MAIN_SRC_DIR;
                this.TEST_SRC_DIR = constants.CLIENT_TEST_SRC_DIR;

                this.packagejs = packagejs;
            }
        };
    }

    get initializing() {
        if (this.useBlueprints) return;
        return this._initializing();
    }

    // Public API method used by the getter and also by Blueprints
    _prompting() {
        return {
            loadSharedData() {
                this.loadShared();
            }
        };
    }

    get prompting() {
        if (this.useBlueprints) return;
        return this._prompting();
    }

    // Public API method used by the getter and also by Blueprints
    _configuring() {
        return {
            loadSharedData() {
                this.loadShared();
            }
        };
    }

    get configuring() {
        if (this.useBlueprints) return;
        return this._configuring();
    }

    // Public API method used by the getter and also by Blueprints
    _default() {
        return {
            loadSharedData() {
                this.loadShared();
            },

            insight() {
                statistics.sendSubGenEvent('generator', 'client', {
                    app: {
                        clientFramework: this.clientFramework,
                        enableTranslation: this.enableTranslation,
                        nativeLanguage: this.nativeLanguage,
                        languages: this.languages
                    }
                });
            },

            configureGlobal() {
                // Application name modified, using each technology's conventions
                this.camelizedBaseName = _.camelCase(this.baseName);
                this.angularAppName = this.getAngularAppName();
                this.angularXAppName = this.getAngularXAppName();
                this.hipster = this.getHipster(this.baseName);
                this.capitalizedBaseName = _.upperFirst(this.baseName);
                this.dasherizedBaseName = _.kebabCase(this.baseName);
                this.lowercaseBaseName = this.baseName.toLowerCase();
            },

            setupShared() {
                this.protractorTests = this.testFrameworks.includes('protractor');

                this.cacheProvider = this.cacheProvider || this.hibernateCache || 'no';
                this.enableHibernateCache = this.enableHibernateCache && !['no', 'memcached'].includes(this.cacheProvider);
                this.jhiPrefixCapitalized = _.upperFirst(this.jhiPrefix);
                this.jhiPrefixDashed = _.kebabCase(this.jhiPrefix);

                // Make dist dir available in templates
                this.BUILD_DIR = this.getBuildDirectoryForBuildTool(this.buildTool);

                this.styleSheetExt = 'scss';
                this.pkType = this.getPkType(this.databaseType);
                this.apiUaaPath = `${this.authenticationType === 'uaa' ? `services/${this.uaaBaseName.toLowerCase()}/` : ''}`;
                this.DIST_DIR = this.getResourceBuildDirectoryForBuildTool(this.configOptions.buildTool) + constants.CLIENT_DIST_DIR;
                this.AOT_DIR = `${this.getResourceBuildDirectoryForBuildTool(this.configOptions.buildTool)}aot`;
            },

            validateServer() {
                if (this.serviceDiscoveryType === 'no') {
                    this.serviceDiscoveryType = false;
                }

                if (this.skipServer && !(this.databaseType && this.devDatabaseType && this.prodDatabaseType && this.authenticationType)) {
                    this.error(
                        `When using skip-server flag, you must pass a database option and authentication type using ${chalk.yellow(
                            '--db'
                        )} and ${chalk.yellow('--auth')} flags`
                    );
                }
                if (this.skipServer && this.authenticationType === 'uaa' && !this.uaaBaseName) {
                    this.error(
                        `When using skip-server flag and UAA as authentication method, you must pass a UAA base name using ${chalk.yellow(
                            '--uaa-base-name'
                        )} flag`
                    );
                }
            },

            saveConfig() {
                if (!this.isRootGenerator) return;

                this.config.set(this.storedConfig);
            }
        };
    }

    get default() {
        if (this.useBlueprints) return;
        return this._default();
    }

    // Public API method used by the getter and also by Blueprints
    _writing() {
        return {
            write() {
                if (this.skipClient) return;
                switch (this.clientFramework) {
                    case 'react':
                        return writeReactFiles.call(this, this.useBlueprints);
                    default:
                        return writeAngularFiles.call(this, this.useBlueprints);
                }
            }
        };
    }

    get writing() {
        if (this.useBlueprints) return;
        return this._writing();
    }

    // Public API method used by the getter and also by Blueprints
    _install() {
        return {
            installing() {
                if (this.skipClient) return;
                const logMsg = `To install your dependencies manually, run: ${chalk.yellow.bold(`${this.clientPackageManager} install`)}`;

                const installConfig = {
                    bower: false,
                    npm: this.clientPackageManager !== 'yarn',
                    yarn: this.clientPackageManager === 'yarn'
                };

                if (this.options['skip-install']) {
                    this.log(logMsg);
                } else {
                    try {
                        this.installDependencies(installConfig);
                    } catch (e) {
                        this.warning('Install of dependencies failed!');
                        this.log(logMsg);
                    }
                }
            }
        };
    }

    get install() {
        if (this.useBlueprints) return;
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
                if (!this.options['skip-install']) {
                    this.spawnCommandSync(this.clientPackageManager, ['run', 'cleanup']);
                }
            }
        };
    }

    get end() {
        if (this.useBlueprints) return;
        return this._end();
    }
};
