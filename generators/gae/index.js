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
const os = require('os');
const shelljs = require('shelljs');
const chalk = require('chalk');
const _ = require('lodash');
const BaseGenerator = require('../generator-base');
const statistics = require('../statistics');

const constants = require('../generator-constants');

module.exports = class extends BaseGenerator {
    constructor(args, opts) {
        super(args, opts);
        this.registerPrettierTransform();
    }

    get initializing() {
        return {
            sayHello() {
                this.log(chalk.bold('Welcome to Google App Engine Generator'));
            },
            checkInstallation() {
                if (this.abort) return;
                const done = this.async();

                shelljs.exec('gcloud version', { silent: true }, (code, stdout, err) => {
                    if (err && code !== 0) {
                        this.log.error(
                            "You don't have the Cloud SDK (gcloud) installed. \nDownload it from https://cloud.google.com/sdk/install"
                        );
                        this.abort = true;
                    }
                    done();
                });
            },

            checkAppEngineJavaComponent() {
                if (this.abort) return;
                const done = this.async();
                const component = 'app-engine-java';

                shelljs.exec(
                    'gcloud components list --quiet --filter="Status=Installed OR Status=\\"Update Available\\"" --format="value(id)"',
                    { silent: true },
                    (err, stdout, srderr) => {
                        if (_.includes(stdout, component)) {
                            done();
                        } else {
                            this.log(chalk.bold('\nInstalling App Engine Java SDK'));
                            this.log(`... Running: gcloud components install ${component} --quiet`);
                            shelljs.exec(`gcloud components install ${component} --quiet`, { silent: true }, (code, stdout, err) => {
                                if (err && code !== 0) {
                                    this.log.error(err);
                                    done(
                                        `Installation failed. \nPlease try to install the app-engine-java component manually via; gcloud components install ${component}`
                                    );
                                }
                                done();
                            });
                        }
                    }
                );
            },

            loadConfig() {
                const configuration = this.getAllJhipsterConfig(this, true);
                this.env.options.appPath = configuration.get('appPath') || constants.CLIENT_MAIN_SRC_DIR;
                this.baseName = configuration.get('baseName');
                this.mainClass = this.getMainClassName();
                this.packageName = configuration.get('packageName');
                this.packageFolder = configuration.get('packageFolder');
                this.cacheProvider = configuration.get('cacheProvider') || configuration.get('hibernateCache') || 'no';
                this.enableHibernateCache = configuration.get('enableHibernateCache') && !['no', 'memcached'].includes(this.cacheProvider);
                this.databaseType = configuration.get('databaseType');
                this.prodDatabaseType = configuration.get('prodDatabaseType');
                this.searchEngine = configuration.get('searchEngine');
                this.angularAppName = this.getAngularAppName();
                this.buildTool = configuration.get('buildTool');
                this.applicationType = configuration.get('applicationType');
                this.serviceDiscoveryType = configuration.get('serviceDiscoveryType');

                this.gcpProjectId = configuration.get('gcpProjectId');
                this.gcpCloudSqlInstanceName = configuration.get('gcpCloudSqlInstanceName');
                this.gcpCloudSqlUserName = configuration.get('gcpCloudSqlUserName');
                this.gcpCloudSqlDatabaseName = configuration.get('gcpCloudSqlDatabaseName');
                this.gaeServiceName = configuration.get('gaeServiceName');
                this.gaeLocation = configuration.get('gaeLocation');
                this.gaeInstanceClass = configuration.get('gaeInstanceClass');
                this.gaeScalingType = configuration.get('gaeScalingType');
                this.gaeInstances = configuration.get('gaeInstances');
                this.gaeMaxInstances = configuration.get('gaeMaxInstances');
                this.gaeMinInstances = configuration.get('gaeMinInstances');
                this.gaeCloudSQLInstanceNeeded = configuration.get('gaeCloudSQLInstanceNeeded');
                this.CLIENT_DIST_DIR = this.getResourceBuildDirectoryForBuildTool(this.config.buildTool) + constants.CLIENT_DIST_DIR;
                this.skipClient = this.config.get('skipClient');
                this.clientPackageManager = this.config.get('clientPackageManager');
                this.dasherizedBaseName = _.kebabCase(this.baseName);
            }
        };
    }

    defaultProjectId() {
        if (this.abort) return null;
        if (this.gcpProjectId) {
            return this.gcpProjectId;
        }
        try {
            const projectId = shelljs.exec('gcloud config get-value core/project --quiet', { silent: true }).stdout;
            return projectId.trim();
        } catch (ex) {
            this.log.error('Unable to determine the default Google Cloud Project ID');
            return undefined;
        }
    }

    defaultServiceNameChoices(defaultServiceExists) {
        if (this.applicationType === 'monolith') {
            return defaultServiceExists ? ['default', _.kebabCase(this.baseName)] : ['default'];
        }
        if (this.applicationType === 'gateway') {
            return ['default'];
        }

        return [_.kebabCase(this.baseName)];
    }

    get prompting() {
        return {
            askForProjectId() {
                if (this.abort) return;
                const done = this.async();
                const prompts = [
                    {
                        type: 'input',
                        name: 'gcpProjectId',
                        message: 'Google Cloud Project ID',
                        default: this.defaultProjectId(),
                        validate: input => {
                            if (input.trim().length === 0) {
                                return 'Project ID cannot empty';
                            }
                            try {
                                shelljs.exec(`gcloud projects describe ${input}`, { silent: true });
                            } catch (ex) {
                                return `Project ID "${chalk.cyan(input.trim())}" does not exist, please create one first!`;
                            }
                            return true;
                        }
                    }
                ];

                this.prompt(prompts).then(props => {
                    this.gcpProjectId = props.gcpProjectId.trim();
                    done();
                });
            },

            askForLocation() {
                if (this.abort) return;
                const done = this.async();

                shelljs.exec(
                    `gcloud app describe --format="value(locationId)" --project="${this.gcpProjectId}"`,
                    { silent: true },
                    (code, stdout, err) => {
                        if (err && code !== 0) {
                            const prompts = [
                                {
                                    type: 'list',
                                    name: 'gaeLocation',
                                    message: 'In which Google App Engine location do you want to deploy ?',
                                    choices: [
                                        { value: 'northamerica-northeast1', name: 'northamerica-northeast1 - Montréal' },
                                        { value: 'us-central', name: 'us-central - Iowa' },
                                        { value: 'us-east1', name: 'us-east1 - South Carolina' },
                                        { value: 'us-east4', name: 'us-east4 - Northern Virginia' },
                                        { value: 'southamerica-east1', name: 'southamerica-east1 - São Paulo' },
                                        { value: 'europe-west', name: 'europe-west - Belgium' },
                                        { value: 'europe-west2', name: 'europe-west2 - London' },
                                        { value: 'europe-west3', name: 'europe-west3 - Frankfurt' },
                                        { value: 'asia-northeast1', name: 'asia-northeast1 - Tokyo' },
                                        { value: 'asia-south1', name: 'asia-south1 - Mumbai' },
                                        { value: 'australia-southeast1', name: 'australia-southeast1 - Sydney' }
                                    ],
                                    default: this.gaeLocation ? this.gaeLocation : 0
                                }
                            ];

                            this.prompt(prompts).then(props => {
                                this.gaeLocation = props.gaeLocation;
                                this.gaeLocationExists = false;
                                done();
                            });
                        } else {
                            this.gaeLocationExists = true;
                            this.gaeLocation = stdout.trim();
                            this.log(
                                `This project already has an App Engine location set, using location "${chalk.cyan(this.gaeLocation)}"`
                            );
                            done();
                        }
                    }
                );
            },

            askForServiceName() {
                if (this.abort) return;
                const done = this.async();

                try {
                    shelljs.exec(`gcloud app services describe default --project="${this.gcpProjectId}"`, { silent: true });
                    this.defaultServiceExists = true;
                } catch (ex) {
                    this.defaultServiceExists = false;
                }

                const prompts = [
                    {
                        type: 'list',
                        name: 'gaeServiceName',
                        message: 'Google App Engine Service Name',
                        choices: this.defaultServiceNameChoices(this.defaultServiceExists),
                        default: this.gaeServiceName ? this.gaeServiceName : 0
                    }
                ];

                this.prompt(prompts).then(props => {
                    this.gaeServiceName = props.gaeServiceName;
                    done();
                });
            },

            askForInstanceClass() {
                if (this.abort) return;
                const done = this.async();

                const prompts = [
                    {
                        type: 'list',
                        name: 'gaeInstanceClass',
                        message: 'Google App Engine Instance Class',
                        choices: [
                            { value: 'F1', name: 'F1 - 600MHz, 256MB, Automatic Scaling' },
                            { value: 'F2', name: 'F2 - 1.2GHz, 512MB, Automatic Scaling' },
                            { value: 'F4', name: 'F4 - 2.4GHz, 1GB, Automatic Scaling' },
                            { value: 'F4_1G', name: 'F4_1G - 2.4GHz, 2GB, Automatic' },
                            { value: 'B1', name: 'B1 - 600MHz, 256MB, Basic or Manual Scaling' },
                            { value: 'B2', name: 'B2 - 1.2GHz, 512MB, Basic or Manual Scaling' },
                            { value: 'B4', name: 'B4 - 2.4GHz, 1GB, Basic or Manual Scaling' },
                            { value: 'B4_1G', name: 'B4_1G - 2.4GHz, 2GB, Basic or Manual Scaling' },
                            { value: 'B8', name: 'B8 - 4.8GHz, 2GB, Basic or Manual Scaling' }
                        ],
                        default: this.gaeInstanceClass ? this.gaeInstanceClass : 0
                    }
                ];

                this.prompt(prompts).then(props => {
                    this.gaeInstanceClass = props.gaeInstanceClass;
                    done();
                });
            },

            askForScalingType() {
                if (this.abort) return;
                const done = this.async();

                if (this.gaeInstanceClass.startsWith('F')) {
                    this.log(
                        `Instance Class "${chalk.cyan(
                            this.gaeInstanceClass
                        )}" can only be automatically scaled. Setting scaling type to automatic.`
                    );
                    this.gaeScalingType = 'automatic';
                    done();
                } else {
                    const prompts = [
                        {
                            type: 'list',
                            name: 'gaeScalingType',
                            message: 'Basic or Manual Scaling',
                            choices: ['basic', 'manual'],
                            default: this.gaeScalingType ? this.gaeScalingType : 0
                        }
                    ];

                    this.prompt(prompts).then(props => {
                        this.gaeScalingType = props.gaeScalingType;
                        done();
                    });
                }
            },

            askForInstances() {
                if (this.abort) return;
                const done = this.async();

                const prompts = [];

                if (this.gaeScalingType === 'manual') {
                    prompts.push({
                        type: 'input',
                        name: 'gaeInstances',
                        message: 'How many instances to run ?',
                        default: this.gaeInstances ? this.gaeInstances : '1',
                        validate: input => {
                            if (input.length === 0) {
                                return 'Instances cannot be empty';
                            }
                            const n = Math.floor(Number(input));
                            if (n === Infinity || String(n) !== input || n <= 0) {
                                return 'Please enter an integer greater than 0';
                            }
                            return true;
                        }
                    });
                }
                if (this.gaeScalingType === 'automatic') {
                    prompts.push({
                        type: 'input',
                        name: 'gaeMinInstances',
                        message: 'How many instances minimum ?',
                        default: this.gaeMinInstances ? this.gaeMinInstances : '0',
                        validate: input => {
                            if (input.length === 0) {
                                return 'Minimum Instances cannot be empty';
                            }
                            const n = Math.floor(Number(input));
                            if (n === Infinity || String(n) !== input || n < 0) {
                                return 'Please enter an integer >= 0';
                            }
                            return true;
                        }
                    });
                }
                if (this.gaeScalingType === 'automatic' || this.gaeScalingType === 'basic') {
                    prompts.push({
                        type: 'input',
                        name: 'gaeMaxInstances',
                        message: 'How many instances max (0 for unlimited) ?',
                        default: this.gaeMaxInstances ? this.gaeMaxInstances : '0',
                        validate: input => {
                            if (input.length === 0) {
                                return 'Max Instances cannot be empty';
                            }
                            const n = Math.floor(Number(input));
                            if (n === Infinity || String(n) !== input || n < 0) {
                                return 'Please enter an integer >= 0';
                            }
                            return true;
                        }
                    });
                }

                this.prompt(prompts).then(props => {
                    this.gaeInstances = props.gaeInstances;
                    this.gaeMaxInstances = props.gaeMaxInstances;
                    this.gaeMinInstances = props.gaeMinInstances;
                    done();
                });
            },

            askIfCloudSqlIsNeeded() {
                if (this.abort) return;
                const done = this.async();
                const prompts = [];

                prompts.push({
                    type: 'input',
                    name: 'gaeCloudSQLInstanceNeeded',
                    message: 'Use a Cloud SQL instance (Y/N) ?',
                    default: this.gaeCloudSQLInstanceNeeded ? this.gaeCloudSQLInstanceNeeded : 'Y',
                    validate: input => {
                        if (input !== 'Y' && input !== 'N') {
                            return 'Input should be Y or N';
                        }
                        return true;
                    }
                });

                this.prompt(prompts).then(props => {
                    this.gaeCloudSQLInstanceNeeded = props.gaeCloudSQLInstanceNeeded;
                    done();
                });
            },

            askForCloudSqlInstance() {
                if (this.gaeCloudSQLInstanceNeeded === 'N') return;
                if (this.abort) return;
                if (this.prodDatabaseType !== 'mysql' && this.prodDatabaseType !== 'mariadb' && this.prodDatabaseType !== 'postgresql')
                    return;

                const done = this.async();

                const cloudSqlInstances = [{ value: '', name: 'New Cloud SQL Instance' }];
                shelljs.exec(
                    `gcloud sql instances list  --format='value[separator=":"](project,region,name)' --project="${this.gcpProjectId}"`,
                    (code, stdout, err) => {
                        if (err && code !== 0) {
                            this.log.error(err);
                        } else {
                            _.forEach(stdout.toString().split(os.EOL), instance => {
                                if (!instance) return;
                                cloudSqlInstances.push({ value: instance.trim(), name: instance });
                            });
                        }

                        const prompts = [
                            {
                                type: 'list',
                                name: 'gcpCloudSqlInstanceName',
                                message: 'Google Cloud SQL Instance Name',
                                choices: cloudSqlInstances,
                                default: this.gcpCloudSqlInstanceName ? this.gcpCloudSqlInstanceName : 0
                            }
                        ];

                        this.prompt(prompts).then(props => {
                            this.gcpCloudSqlInstanceName = props.gcpCloudSqlInstanceName;
                            this.gcpCloudSqlInstanceNameExists = true;
                            done();
                        });
                    }
                );
            },

            promptForCloudSqlInstanceNameIfNeeded() {
                if (this.gaeCloudSQLInstanceNeeded === 'N') return;
                if (this.abort) return;
                if (this.gcpCloudSqlInstanceName) return;

                const done = this.async();

                const prompts = [
                    {
                        type: 'input',
                        name: 'gcpCloudSqlInstanceName',
                        message: 'Google Cloud SQL Instance Name',
                        default: this.gcpCloudSqlInstanceName ? this.gcpCloudSqlInstanceName : this.baseName
                    }
                ];

                this.prompt(prompts).then(props => {
                    this.gcpCloudSqlInstanceName = props.gcpCloudSqlInstanceName;
                    this.gcpCloudSqlInstanceNameExists = false;
                    done();
                });
            },

            askForCloudSqlLogin() {
                if (this.gaeCloudSQLInstanceNeeded === 'N') return;
                if (this.abort) return;
                if (!this.gcpCloudSqlInstanceName) return;

                const done = this.async();
                const prompts = [
                    {
                        type: 'input',
                        name: 'gcpCloudSqlUserName',
                        message: 'Google Cloud SQL User Name',
                        default: this.gcpCloudSqlUserName ? this.gcpCloudSqlUserName : 'root',
                        validate: input => {
                            if (input.length === 0) {
                                return 'User Name cannot empty';
                            }
                            return true;
                        }
                    },
                    {
                        type: 'password',
                        name: 'gcpCloudSqlPassword',
                        message: 'Google Cloud SQL Password',
                        default: this.gcpCloudSqlPassword ? this.gcpCloudSqlPassword : ''
                    }
                ];

                this.prompt(prompts).then(props => {
                    this.gcpCloudSqlUserName = props.gcpCloudSqlUserName;
                    this.gcpCloudSqlPassword = props.gcpCloudSqlPassword;
                    done();
                });
            },

            askForCloudSqlDatabaseName() {
                if (this.gaeCloudSQLInstanceNeeded === 'N') return;
                if (this.abort) return;
                if (!this.gcpCloudSqlInstanceNameExists) return;

                const done = this.async();

                const cloudSqlDatabases = [{ value: '', name: 'New Database' }];
                const name = this.gcpCloudSqlInstanceName.split(':')[2];
                shelljs.exec(
                    `gcloud sql databases list -i ${name} --format='value(name)' --project="${this.gcpProjectId}"`,
                    { silent: true },
                    (code, stdout, err) => {
                        if (err && code !== 0) {
                            this.log.error(err);
                        } else {
                            _.forEach(stdout.toString().split(os.EOL), database => {
                                if (!database) return;
                                cloudSqlDatabases.push({ value: database, name: database });
                            });
                        }

                        const prompts = [
                            {
                                type: 'list',
                                name: 'gcpCloudSqlDatabaseName',
                                message: 'Google Cloud SQL Database Name',
                                choices: cloudSqlDatabases,
                                default: this.gcpCloudSqlDatabaseName ? this.gcpCloudSqlDatabaseName : 0
                            }
                        ];

                        this.prompt(prompts).then(props => {
                            this.gcpCloudSqlDatabaseName = props.gcpCloudSqlDatabaseName;
                            this.gcpCloudSqlDatabaseNameExists = true;
                            done();
                        });
                    }
                );
            },

            promptForCloudSqlDatabaseNameIfNeeded() {
                if (this.gaeCloudSQLInstanceNeeded === 'N') return;
                if (this.abort) return;
                if (this.gcpCloudSqlInstanceName !== 'new' && this.gcpCloudSqlDatabaseName) return;

                const done = this.async();

                const prompts = [
                    {
                        type: 'input',
                        name: 'gcpCloudSqlDatabaseName',
                        message: 'Google Cloud SQL Database Name',
                        default: this.gcpCloudSqlDatabaseName ? this.gcpCloudSqlDatabaseName : this.baseName
                    }
                ];

                this.prompt(prompts).then(props => {
                    this.gcpCloudSqlDatabaseName = props.gcpCloudSqlDatabaseName;
                    this.gcpCloudSqlDatabaseNameExists = false;
                    done();
                });
            }
        };
    }

    get default() {
        return {};
    }

    get configuring() {
        return {
            insight() {
                statistics.sendSubGenEvent('generator', 'gae');
            },

            configureProject() {
                if (this.abort) return;
                const done = this.async();

                if (!this.gaeLocationExists) {
                    this.log(chalk.bold(`Configuring Google App Engine Location "${chalk.cyan(this.gaeLocation)}"`));
                    shelljs.exec(
                        `gcloud app create --region="${this.gaeLocation}" --project="${this.gcpProjectId}"`,
                        { silent: true },
                        (code, stdout, err) => {
                            if (err && code !== 0) {
                                this.log.error(err);
                                this.abort = true;
                            }

                            done();
                        }
                    );
                } else {
                    done();
                }
            },

            createCloudSqlInstance() {
                if (this.gaeCloudSQLInstanceNeeded === 'N') return;
                if (this.abort) return;
                if (!this.gcpCloudSqlInstanceName) return;
                if (this.gcpCloudSqlInstanceNameExists) return;
                const done = this.async();

                this.log(chalk.bold('\nCreating New Cloud SQL Instance'));

                const name = this.gcpCloudSqlInstanceName;
                // for mysql keep default options, set specific option for pg
                const dbVersionFlag =
                    this.prodDatabaseType === 'postgresql' ? ' --database-version="POSTGRES_9_6" --tier="db-g1-small"' : '';

                const cmd = `gcloud sql instances create "${name}" --region='${this.gaeLocation}' --project=${this.gcpProjectId}${dbVersionFlag}`;
                this.log(chalk.bold(`\n... Running: ${cmd}`));

                shelljs.exec(cmd, { silent: true }, (code, stdout, err) => {
                    if (err && code !== 0) {
                        this.abort = true;
                        this.log.error(err);
                    }

                    const cloudSQLInstanceName = shelljs.exec(
                        `gcloud sql instances describe ${name} --format="value(connectionName)" --project="${this.gcpProjectId}"`,
                        { silent: true }
                    );
                    this.gcpCloudSqlInstanceName = cloudSQLInstanceName.trim();

                    done();
                });
            },

            createCloudSqlLogin() {
                if (this.gaeCloudSQLInstanceNeeded === 'N') return;
                if (this.abort) return;
                if (!this.gcpCloudSqlInstanceName) return;
                const done = this.async();

                this.log(chalk.bold('\nConfiguring Cloud SQL Login'));

                const name = this.gcpCloudSqlInstanceName.split(':')[2];
                shelljs.exec(
                    `gcloud sql users list -i jhipster --format='value(name)' --project="${this.gcpProjectId}"`,
                    { silent: true },
                    (code, stdout, err) => {
                        if (_.includes(stdout, this.gcpCloudSqlUserName)) {
                            this.log(chalk.bold(`... User "${chalk.cyan(this.gcpCloudSqlUserName)}" already exists`));
                            const cmd = `gcloud sql users set-password "${this.gcpCloudSqlUserName}" -i "${name}" --host="%" --project="${this.gcpProjectId}" --password="..."`;
                            this.log(chalk.bold(`... To set its password, run: ${cmd}`));
                            done();
                        } else {
                            const cmd = `gcloud sql users create "${this.gcpCloudSqlUserName}" -i "${name}" --host="%" --password="${this.gcpCloudSqlPassword}" --project="${this.gcpProjectId}"`;
                            this.log(chalk.bold(`... Running: ${cmd}`));
                            shelljs.exec(cmd, { silent: true }, (code, stdout, err) => {
                                if (err && code !== 0) {
                                    this.log.error(err);
                                }
                                done();
                            });
                        }
                    }
                );
            },

            createCloudSqlDatabase() {
                if (this.gaeCloudSQLInstanceNeeded === 'N') return;
                if (this.abort) return;
                if (!this.gcpCloudSqlInstanceName) return;
                if (this.gcpCloudSqlDatabaseNameExists) return;
                const done = this.async();

                const name = this.gcpCloudSqlInstanceName.split(':')[2];
                this.log(chalk.bold(`\nCreating Database ${chalk.cyan(this.gcpCloudSqlDatabaseName)}`));
                const cmd = `gcloud sql databases create "${this.gcpCloudSqlDatabaseName}" --charset=utf8 -i "${name}" --project="${this.gcpProjectId}"`;
                this.log(chalk.bold(`... Running: ${cmd}`));
                shelljs.exec(cmd, { silent: true }, (code, stdout, err) => {
                    if (err && code !== 0) {
                        this.log.error(err);
                    }
                    done();
                });
            },

            saveConfig() {
                this.config.set({
                    gcpProjectId: this.gcpProjectId,
                    gcpCloudSqlInstanceName: this.gcpCloudSqlInstanceName,
                    gcpCloudSqlUserName: this.gcpCloudSqlUserName,
                    gcpCloudSqlDatabaseName: this.gcpCloudSqlDatabaseName,
                    gaeServiceName: this.gaeServiceName,
                    gaeLocation: this.gaeLocation,
                    gaeInstanceClass: this.gaeInstanceClass,
                    gaeScalingType: this.gaeScalingType,
                    gaeInstances: this.gaeInstances,
                    gaeMinInstances: this.gaeMinInstances,
                    gaeMaxInstances: this.gaeMaxInstances,
                    gaeCloudSQLInstanceNeeded: this.gaeCloudSQLInstanceNeeded
                });
            }
        };
    }

    get writing() {
        return {
            copyFiles() {
                if (this.abort) return;

                const done = this.async();
                this.log(chalk.bold('\nCreating Google App Engine deployment files'));

                this.template('app.yaml.ejs', `${constants.MAIN_DIR}/appengine/app.yaml`);
                this.template('application-prod-gae.yml.ejs', `${constants.SERVER_MAIN_RES_DIR}/config/application-prod-gae.yml`);
                if (this.buildTool === 'gradle') {
                    this.template('gae.gradle.ejs', 'gradle/gae.gradle');
                }

                this.conflicter.resolve(err => {
                    done();
                });
            },

            addDependencies() {
                if (this.abort) return;
                if (this.buildTool === 'maven') {
                    this.addMavenDependency('org.springframework.boot.experimental', 'spring-boot-thin-layout', '1.0.23.RELEASE');
                }
                if (this.gaeCloudSQLInstanceNeeded === 'N') return;
                if (this.prodDatabaseType === 'mysql' || this.prodDatabaseType === 'mariadb') {
                    if (this.buildTool === 'maven') {
                        this.addMavenDependency('com.google.cloud.sql', 'mysql-socket-factory', '1.0.8');
                    } else if (this.buildTool === 'gradle') {
                        this.addGradleDependency('compile', 'com.google.cloud.sql', 'mysql-socket-factory', '1.0.8');
                    }
                }
                if (this.prodDatabaseType === 'postgresql') {
                    if (this.buildTool === 'maven') {
                        this.addMavenDependency('com.google.cloud.sql', 'postgres-socket-factory', '1.0.12');
                    } else if (this.buildTool === 'gradle') {
                        this.addGradleDependency('compile', 'com.google.cloud.sql', 'postgres-socket-factory', '1.0.12');
                    }
                }
            },

            addGradlePlugin() {
                if (this.abort) return;
                if (this.buildTool === 'gradle') {
                    this.addGradlePlugin('com.google.cloud.tools', 'appengine-gradle-plugin', '2.2.0');
                    this.addGradlePlugin('org.springframework.boot.experimental', 'spring-boot-thin-gradle-plugin', '1.0.13.RELEASE');
                    this.applyFromGradleScript('gradle/gae');
                }
            },

            addMavenPlugin() {
                if (this.abort) return;
                if (this.buildTool === 'maven') {
                    this.render('pom-plugin.xml.ejs', rendered => {
                        this.addMavenPlugin('com.google.cloud.tools', 'appengine-maven-plugin', '2.2.0', rendered.trim());
                    });
                    this.render('pom-profile.xml.ejs', rendered => {
                        this.addMavenProfile('prod-gae', `            ${rendered.trim()}`);
                    });
                    this.render('pom-gae-build-profile.xml.ejs', rendered => {
                        this.addMavenProfile('gae', `            ${rendered.trim()}`);
                    });
                }
            }
        };
    }

    get end() {
        return {
            productionBuild() {
                if (this.abort) return;

                if (this.buildTool === 'maven') {
                    this.log(chalk.bold('\nRun App Engine DevServer Locally: ./mvnw package appengine:run -DskipTests'));
                    this.log(
                        chalk.bold('Deploy to App Engine: ./mvnw clean && ./mvnw package appengine:deploy -DskipTests -Pgae,prod-gae')
                    );
                } else if (this.buildTool === 'gradle') {
                    this.log(chalk.bold('\nRun App Engine DevServer Locally: ./gradlew appengineRun'));
                    this.log(
                        chalk.bold(
                            'Deploy to App Engine: ./gradlew thinResolve -Pgae -Pprod-gae && ./gradlew appengineDeploy -Pgae -Pprod-gae'
                        )
                    );
                }
                /*
                if (this.gcpSkipBuild || this.gcpDeployType === 'git') {
                    this.log(chalk.bold('\nSkipping build'));
                    return;
                }

                const done = this.async();
                this.log(chalk.bold('\nBuilding application'));

                const child = this.buildApplication(this.buildTool, 'prod', (err) => {
                    if (err) {
                        this.abort = true;
                        this.log.error(err);
                    }
                    done();
                });

                this.buildCmd = child.buildCmd;

                child.stdout.on('data', (data) => {
                    process.stdout.write(data.toString());
                });
*/
            }
        };
    }
};
