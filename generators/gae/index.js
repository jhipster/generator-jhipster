/**
 * Copyright 2013-2018 the original author or authors from the JHipster project.
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
const fs = require('fs');
const path = require('path');
const exec = require('child_process').exec;
const spawn = require('child_process').spawn;
const execSync = require('child_process').execSync;
const chalk = require('chalk');
const _ = require('lodash');
const glob = require('glob');
const BaseGenerator = require('../generator-base');

const constants = require('../generator-constants');

module.exports = class extends BaseGenerator {
    constructor(args, opts) {
        super(args, opts);
    }

    get initializing() {
        return {
            sayHello() {
                this.log(chalk.bold('Welcome to Google App Engine Generator'));
            },
            checkInstallation() {
                if (this.abort) return;
                const done = this.async();

                exec('gcloud version', (err) => {
                    if (err) {
                        this.log.error('You don\'t have the Cloud SDK (gcloud) installed. ' +
                            'Download it from https://cloud.google.com/sdk/install');
                        this.abort = true;
                    }
                    done();
                });
            },

            checkAppEngineJavaComponent() {
                if (this.abort) return;
                const done = this.async();
                const component = 'app-engine-java';

                exec('gcloud components list --quiet --filter="Status=Installed" --format="value(id)"', (err, stdout, srderr) => {
                    if (_.includes(stdout, component)) {
                        done();
                    } else {
                        this.log(chalk.bold('\nInstalling App Engine Java SDK'));
                        this.log(`... Running: gcloud components install ${component} --quiet`);
                        const child = spawn('gcloud', ['components', 'install', component, '--quiet'], {stdio: [process.stdin, process.stdout, process.stderr]});
                        child.on('exit', (code) => {
                            if (code !== 0) { this.abort = true; }
                            done();
                        });
                    }
                });
            },

            loadConfig() {
                this.env.options.appPath = this.config.get('appPath') || constants.CLIENT_MAIN_SRC_DIR;
                this.baseName = this.config.get('baseName');
                this.packageName = this.config.get('packageName');
                this.packageFolder = this.config.get('packageFolder');
                this.cacheProvider = this.config.get('cacheProvider') || this.config.get('hibernateCache') || 'no';
                this.enableHibernateCache = this.config.get('enableHibernateCache') || (this.config.get('hibernateCache') !== undefined && this.config.get('hibernateCache') !== 'no');
                this.databaseType = this.config.get('databaseType');
                this.prodDatabaseType = this.config.get('prodDatabaseType');
                this.searchEngine = this.config.get('searchEngine');
                this.angularAppName = this.getAngularAppName();
                this.buildTool = this.config.get('buildTool');
                this.applicationType = this.config.get('applicationType');
                this.serviceDiscoveryType = this.config.get('serviceDiscoveryType');

                this.gcpProjectId= this.config.get('gcpProjectId');
                this.gaeServiceName = this.config.get('gaeServiceName');
                this.gaeLocation = this.config.get('gaeLocation');
                this.gaeInstanceClass = this.config.get('gaeInstanceClass');
                this.gaeScalingType = this.config.get('gaeScalingType');
                this.gaeInstances = this.config.get('gaeInstances');
                this.gaeMaxInstances = this.config.get('gaeMaxInstances');
                this.gaeMinInstances = this.config.get('gaeMinInstances');
            }
        };
    }

    defaultProjectId() {
        if (this.gcpProjectId) {
            return this.gcpProjectId;
        }
        try {
            var projectId = execSync('gcloud config get-value core/project --quiet', { encoding: 'utf8' });
            return projectId.trim();
        } catch (ex) {
            this.log.error('Unable to determine the default Google Cloud Project ID');
        }
    }

    defaultServiceNameChoices(defaultServiceExists) {
        if (this.applicationType === 'monolith') {
            return defaultServiceExists ? ['default', _.kebabCase(this.baseName)] : ['default'];
        } else if (this.applicationType === 'gateway') {
            return ['default']
        } else if (this.applicationType === 'microservice') {
            return [_.kebabCase(this.baseName)];
        }
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
                        validate: (input) => {
                            if (input.length === 0) {
                                return 'Project ID cannot empty';
                            }
                            try {
                                execSync('gcloud projects describe ' + input);
                                this.gcpProjectIdExists = true;
                            } catch (ex) {
                                return `Project ID "${chalk.cyan(this.gcpProjectId)}" does not exist, please create one first!`;
                                this.gcpProjectIdExists = false;
                            }
                            return true;
                        }
                    }];

                this.prompt(prompts).then((props) => {
                    this.gcpProjectId = props.gcpProjectId;
                    done();
                });
            },
 
            askForLocation() {
                if (this.abort) return;
                const done = this.async();

                exec('gcloud app describe --format="value(locationId)" --project="' + this.gcpProjectId + '"', (err, stdout) => {
                    if (err) {
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
                            }];

                        this.prompt(prompts).then((props) => {
                            this.gaeLocation = props.gaeLocation;
                            this.gaeLocationExists = false;
                            done();
                        });
                    } else {
                        this.gaeLocationExists = true;
                        this.gaeLocation = stdout.trim();
                        this.log(`This project already has an App Engine location set, using location "${chalk.cyan(this.gaeLocation)}"`);
                        done();
                    }
                });
            },

            askForServiceName() {
                if (this.abort) return;
                const done = this.async();

                try {
                    execSync('gcloud app services describe default --project="' + this.gcpProjectId + '"' , { encoding: 'utf8'});
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
                    }];

                this.prompt(prompts).then((props) => {
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
                            { value: 'F1', name: 'F1 - 600MHz, 128MB, Automatic Scaling' },
                            { value: 'F2', name: 'F2 - 1.2GHz, 256MB, Automatic Scaling' },
                            { value: 'F4', name: 'F4 - 2.4GHz, 512MB, Automatic Scaling' },
                            { value: 'F4_1G', name: 'F4_1G - 2.4GHz, 1GB, Automatic/Manual Scaling' },
                            { value: 'B1', name: 'B1 - 600MHz, 128MB, Basic or Manual Scaling'},
                            { value: 'B2', name: 'B2 - 1.2GHz, 256MB, Basic or Manual Scaling'},
                            { value: 'B4', name: 'B4 - 2.4GHz, 512MB, Basic or Manual Scaling'},
                            { value: 'B4_1G', name: 'B4_1G - 2.4GHz, 1GB, Manual Scaling'},
                            { value: 'B8', name: 'B8 - 4.8GHz, 1GB, Manual Scaling'},
                        ],
                        default: this.gaeInstanceClass ? this.gaeInstanceClass : 0
                    }];

                this.prompt(prompts).then((props) => {
                    this.gaeInstanceClass = props.gaeInstanceClass;
                    done();
                });
            },

            askForScalingType() {
                if (this.abort) return;
                const done = this.async();

                if (this.gaeInstanceClass.startsWith('F')) {
                    this.log(`Instance Class "${chalk.cyan(this.gaeInstanceClass)}" can only be automatically scaled. Setting scaling type to automatic.`);
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
                        }];

                    this.prompt(prompts).then((props) => {
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
                        default: this.gaeInstances ? this.gaeInstances : "1",
                        validate: (input) => {
                            if (input.length === 0) {
                                return 'Instances cannot be empty';
                            }
                            var n = Math.floor(Number(input));
                            if (n === Infinity || String(n) !== input || n <= 0) {
                                return 'Please enter an integer greater than 0'
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
                        default: this.gaeMinInstances ? this.gaeMinInstances : "0",
                        validate: (input) => {
                            if (input.length === 0) {
                                return 'Minimum Instances cannot be empty';
                            }
                            var n = Math.floor(Number(input));
                            if (n === Infinity || String(n) !== input || n < 0) {
                                return 'Please enter an integer >= 0'
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
                        default: this.gaeMaxInstances ? this.gaeMaxInstances : "0",
                        validate: (input) => {
                            if (input.length === 0) {
                                return 'Max Instances cannot be empty';
                            }
                            var n = Math.floor(Number(input));
                            if (n === Infinity || String(n) !== input || n < 0) {
                                return 'Please enter an integer >= 0'
                            }
                            return true;
                        }
                    });
                }

                this.prompt(prompts).then((props) => {
                    this.gaeInstances = props.gaeInstances;
                    this.gaeMaxInstances = props.gaeMaxInstances;
                    this.gaeMinInstances = props.gaeMinInstances;
                    done();
                });
            }
        };
    }

    get default() {
        return {
        };
    }

    get configuring() {
        return {
            insight() {
                const insight = this.insight();
                insight.trackWithEvent('generator', 'gae');
            },

            configureProject() {
                if (this.abort) return;
                const done = this.async();

                if (!this.gaeLocationExists) {
                    this.log(chalk.bold(`Configuring Google App Engine Location "${chalk.cyanthis.gaeLocation}"`));
                    exec(`gcloud app create --region="${this.gaeLocation}" --project="${this.gaeProjectId}"`, (err, stdout) => {
                        if (err) {
                            this.log.error(err);
                            this.abort = true;
                        }

                        done();
                    });
                } else {
                    done();
                }
            },

            configureCloudSql() {
                if (this.abort) return;
                const done = this.async();
                done();
            },

            gcpAddonsCreate() {
                if (this.abort) return;
                const done = this.async();

                this.log(chalk.bold('\nProvisioning Services'));

/*
                if (this.prodDatabaseType === 'mysql' || this.prodDatabaseType === 'mariadb') {
                    exec('gcloud services enable sqladmin.googleapis.com', (err, stdout) {
                        if (!err) {
                            exec('
                        }
                    }
                } else {
                    done();
                    return;
                }
*/
                done();
            },

            saveConfig() {
                this.config.set('gcpProjectId', this.gcpProjectId);
                this.config.set('gaeServiceName', this.gaeServiceName);
                this.config.set('gaeLocation', this.gaeLocation);
                this.config.set('gaeInstanceClass', this.gaeInstanceClass);
                this.config.set('gaeScalingType', this.gaeScalingType);
                this.config.set('gaeInstances', this.gaeInstances);
                this.config.set('gaeMinInstances', this.gaeMinInstances);
                this.config.set('gaeMaxInstances', this.gaeMaxInstances);
            }
        };
    }

    get writing() {
        return {
            copyFiles() {
                if (this.abort) return;

                const done = this.async();
                this.log(chalk.bold('\nCreating Google App Engine deployment files'));

                this.template('appengine-web.xml.ejs', `${constants.CLIENT_MAIN_SRC_DIR}/WEB-INF/appengine-web.xml`);
                this.template('application-gae.yml.ejs', `${constants.SERVER_MAIN_RES_DIR}/config/application-gae.yml`);
                this.template('logging.properties.ejs', `${constants.CLIENT_MAIN_SRC_DIR}/WEB-INF/logging.properties`);
/*
               if (this.buildTool === 'gradle') {
                    this.template('gae.gradle.ejs', 'gradle/gae.gradle');
                }
*/

                this.conflicter.resolve((err) => {
                    done();
                });
            },

            addDependencies() {
                if (this.prodDatabaseType === 'mysql' || this.prodDatabaseType === 'mariadb') {
                    if (this.buildTool === 'maven') {
                        this.addMavenDependency('com.google.cloud.sql', 'mysql-socket-factory', '1.0.8');
                    } else if (this.buildTool === 'gradle') {
                        this.addGradleDependency('compile', 'com.google.cloud.sql', 'mysql-socket-factory', '1.0.8');
                    }
                }
            },

/*
            addGradlePlugin() {
                if (this.buildTool !== 'gradle') return;
                this.addGradlePlugin('gradle.plugin.com.gcp.sdk', 'gcp-gradle', '0.2.0');
                this.applyFromGradleScript('gradle/gcp');
            },
*/

            addMavenPlugin() {
                if (this.buildTool === 'maven') {
                    this.render('pom-plugin.xml.ejs', (rendered) => {
                        this.addMavenPlugin('com.google.cloud.tools', 'appengine-maven-plugin', '1.3.1', rendered);
                    });
                }
            }
        };
    }

    get end() {
        return {
            productionBuild() {
                if (this.abort) return;

                this.log(chalk.bold(`\nRun App Engine DevServer Locally: ./mvnw appengine:run -DskipTests`));
                this.log(chalk.bold(`\nDeploy to App Engine: ./mvnw appengine:deploy -DskipTests -Pprod`));
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
