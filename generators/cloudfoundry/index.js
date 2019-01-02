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
const childProcess = require('child_process');
const chalk = require('chalk');
const glob = require('glob');
const prompts = require('./prompts');
const BaseGenerator = require('../generator-base');
const statistics = require('../statistics');

const constants = require('../generator-constants');

const exec = childProcess.exec;

module.exports = class extends BaseGenerator {
    initializing() {
        this.log(chalk.bold('CloudFoundry configuration is starting'));
        this.env.options.appPath = this.config.get('appPath') || constants.CLIENT_MAIN_SRC_DIR;
        this.baseName = this.config.get('baseName');
        this.buildTool = this.config.get('buildTool');
        this.packageName = this.config.get('packageName');
        this.packageFolder = this.config.get('packageFolder');
        this.cacheProvider = this.config.get('cacheProvider') || this.config.get('hibernateCache') || 'no';
        this.enableHibernateCache =
            this.config.get('enableHibernateCache') ||
            (this.config.get('hibernateCache') !== undefined && this.config.get('hibernateCache') !== 'no');
        this.databaseType = this.config.get('databaseType');
        this.devDatabaseType = this.config.get('devDatabaseType');
        this.prodDatabaseType = this.config.get('prodDatabaseType');
        this.angularAppName = this.getAngularAppName();
    }

    get prompting() {
        return prompts.prompting;
    }

    get configuring() {
        return {
            insight() {
                statistics.sendSubGenEvent('generator', 'cloudfoundry');
            },

            copyCloudFoundryFiles() {
                if (this.abort) return;
                this.log(chalk.bold('\nCreating Cloud Foundry deployment files'));
                this.template('manifest.yml.ejs', 'deploy/cloudfoundry/manifest.yml');
                this.template('application-cloudfoundry.yml.ejs', `${constants.SERVER_MAIN_RES_DIR}config/application-cloudfoundry.yml`);
            },

            checkInstallation() {
                if (this.abort) return;
                const done = this.async();

                exec('cf -v', err => {
                    if (err) {
                        this.log.error(
                            "cloudfoundry's cf command line interface is not available. " +
                                'You can install it via https://github.com/cloudfoundry/cli/releases'
                        );
                        this.abort = true;
                    }
                    done();
                });
            }
        };
    }

    get default() {
        return {
            cloudfoundryAppShow() {
                if (this.abort || typeof this.dist_repo_url !== 'undefined') return;
                const done = this.async();

                this.log(chalk.bold('\nChecking for an existing Cloud Foundry hosting environment...'));
                exec(`cf app ${this.cloudfoundryDeployedName} `, {}, (err, stdout, stderr) => {
                    // Unauthenticated
                    if (stdout.search('cf login') >= 0) {
                        this.log.error("Error: Not authenticated. Run 'cf login' to login to your cloudfoundry account and try again.");
                        this.abort = true;
                    }
                    done();
                });
            },

            cloudfoundryAppCreate() {
                if (this.abort || typeof this.dist_repo_url !== 'undefined') return;
                const done = this.async();

                this.log(chalk.bold('\nCreating your Cloud Foundry hosting environment, this may take a couple minutes...'));

                if (this.databaseType !== 'no') {
                    this.log(chalk.bold('Creating the database'));
                    const child = exec(
                        `cf create-service ${this.cloudfoundryDatabaseServiceName} ${this.cloudfoundryDatabaseServicePlan} ${
                            this.cloudfoundryDeployedName
                        }`,
                        {},
                        (err, stdout, stderr) => {
                            done();
                        }
                    );
                    child.stdout.on('data', data => {
                        this.log(data.toString());
                    });
                } else {
                    done();
                }
            },

            productionBuild() {
                if (this.abort) return;
                const done = this.async();

                this.log(chalk.bold(`\nBuilding the application with the ${this.cloudfoundryProfile} profile`));

                const child = this.buildApplication(this.buildTool, this.cloudfoundryProfile, err => {
                    if (err) {
                        this.log.error(err);
                    }
                    done();
                });

                this.buildCmd = child.buildCmd;

                child.stdout.on('data', data => {
                    this.log(data.toString());
                });
            }
        };
    }

    get end() {
        return {
            cloudfoundryPush() {
                if (this.abort) return;
                const done = this.async();
                let cloudfoundryDeployCommand = 'cf push -f ./deploy/cloudfoundry/manifest.yml -t 120 -p';
                let warFolder = '';
                if (this.buildTool === 'maven') {
                    warFolder = ' target/';
                } else if (this.buildTool === 'gradle') {
                    warFolder = ' build/libs/';
                }
                if (os.platform() === 'win32') {
                    cloudfoundryDeployCommand += ` ${glob.sync(`${warFolder.trim()}*.war`)[0]}`;
                } else {
                    cloudfoundryDeployCommand += `${warFolder}*.war`;
                }

                this.log(chalk.bold('\nPushing the application to Cloud Foundry'));
                const child = exec(cloudfoundryDeployCommand, err => {
                    if (err) {
                        this.log.error(err);
                    }
                    this.log(chalk.green('\nYour app should now be live'));
                    this.log(chalk.yellow(`After application modification, repackage it with\n\t${chalk.bold(this.buildCmd)}`));
                    this.log(chalk.yellow(`And then re-deploy it with\n\t${chalk.bold(cloudfoundryDeployCommand)}`));
                    done();
                });

                child.stdout.on('data', data => {
                    this.log(data.toString());
                });
            },

            restartApp() {
                if (this.abort || !this.cloudfoundry_remote_exists) return;
                this.log(chalk.bold('\nRestarting your cloudfoundry app.\n'));

                exec(`cf restart ${this.cloudfoundryDeployedName}`, (err, stdout, stderr) => {
                    this.log(chalk.green('\nYour app should now be live'));
                });
            }
        };
    }
};
