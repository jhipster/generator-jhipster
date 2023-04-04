/**
 * Copyright 2013-2023 the original author or authors from the JHipster project.
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
import os from 'os';
import shelljs from 'shelljs';
import fs from 'fs';
import chalk from 'chalk';
import _ from 'lodash';

import BaseGenerator from '../base/index.mjs';
import { GENERATOR_GAE } from '../generator-list.mjs';
import statistics from '../statistics.mjs';
import dockerPrompts from '../base-docker/docker-prompts.mjs';
import { CLIENT_MAIN_SRC_DIR, MAIN_DIR, SERVER_MAIN_RES_DIR } from '../generator-constants.mjs';
import { applicationTypes, buildToolTypes, cacheTypes, databaseTypes } from '../../jdl/jhipster/index.mjs';
import { mavenProdProfileContent, mavenPluginConfiguration, mavenProfileContent } from './templates.mjs';
import { createPomStorage } from '../maven/support/pom-store.mjs';
import { addGradleDependencyCallback, addGradlePluginCallback, applyFromGradleCallback } from '../gradle/internal/needles.mjs';

const cacheProviders = cacheTypes;
const { MEMCACHED } = cacheTypes;
const { GATEWAY, MICROSERVICE, MONOLITH } = applicationTypes;
const { MARIADB, MYSQL, POSTGRESQL } = databaseTypes;
const { MAVEN, GRADLE } = buildToolTypes;

const NO_CACHE_PROVIDER = cacheProviders.NO;

export default class GaeGenerator extends BaseGenerator {
  async beforeQueue() {
    if (!this.fromBlueprint) {
      await this.composeWithBlueprints(GENERATOR_GAE);
    }
  }

  get initializing() {
    return {
      sayHello() {
        this.logger.log(chalk.bold('Welcome to Google App Engine Generator'));
      },
      checkInstallation() {
        if (this.abort) return;
        const done = this.async();

        shelljs.exec('gcloud version', { silent: true }, (code, stdout, err) => {
          if (err && code !== 0) {
            this.logger.error("You don't have the Cloud SDK (gcloud) installed. \nDownload it from https://cloud.google.com/sdk/install");
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
              this.logger.log(chalk.bold('\nInstalling App Engine Java SDK'));
              this.logger.info(`... Running: gcloud components install ${component} --quiet`);
              shelljs.exec(`gcloud components install ${component} --quiet`, { silent: true }, (code, stdout, err) => {
                if (err && code !== 0) {
                  this.logger.error(err);
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

      loadCommonConfig() {
        this.loadAppConfig();
        this.loadServerConfig();

        this.loadDerivedAppConfig();
        this.loadDerivedServerConfig();
      },

      loadConfig() {
        const configuration = this.config;
        this.env.options.appPath = configuration.get('appPath') || CLIENT_MAIN_SRC_DIR;
        this.mainClass = this.getMainClassName();
        this.cacheProvider = this.cacheProvider || NO_CACHE_PROVIDER;
        this.enableHibernateCache = this.enableHibernateCache && ![NO_CACHE_PROVIDER, MEMCACHED].includes(this.cacheProvider);
        this.frontendAppName = this.getFrontendAppName();
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
        this.dasherizedBaseName = _.kebabCase(this.baseName);
      },
    };
  }

  get [BaseGenerator.INITIALIZING]() {
    return this.delegateTasksToBlueprint(() => this.initializing);
  }

  get prompting() {
    return {
      askForPath() {
        if (this.abort) return undefined;
        if (this.applicationType !== GATEWAY) return undefined;
        const messageAskForPath = 'Enter the root directory where the microservices are located';
        const prompts = [
          {
            type: 'input',
            name: 'directoryPath',
            message: messageAskForPath,
            default: this.directoryPath || '../',
            validate: input => {
              const path = this.destinationPath(input);
              if (shelljs.test('-d', path)) {
                const appsFolders = this._getMicroserviceFolders(input);

                if (appsFolders.length === 0) {
                  return `No microservices are found in ${path}`;
                }
                return true;
              }
              return `${path} is not a directory or doesn't exist`;
            },
          },
        ];

        return this.prompt(prompts).then(props => {
          this.directoryPath = props.directoryPath;
          // Patch the path if there is no trailing "/"
          if (!this.directoryPath.endsWith('/')) {
            this.logger.log(chalk.yellow(`The path "${this.directoryPath}" does not end with a trailing "/", adding it anyway.`));
            this.directoryPath += '/';
          }
          this.appsFolders = this._getMicroserviceFolders(this.directoryPath);
          this.logger.log(chalk.green(`${this.appsFolders.length} applications found at ${this.destinationPath(this.directoryPath)}\n`));
        });
      },
      askForApps() {
        if (this.regenerate) return undefined;
        if (this.applicationType !== GATEWAY) return undefined;
        const messageAskForApps = 'Which microservice applications do you want to include in your configuration?';
        const prompts = [
          {
            type: 'checkbox',
            name: 'chosenApps',
            message: messageAskForApps,
            choices: this.appsFolders,
            default: this.defaultAppsFolders,
            validate: input => (input.length === 0 ? 'Please choose at least one application' : true),
          },
        ];

        return this.prompt(prompts).then(props => {
          this.appsFolders = props.chosenApps;
          dockerPrompts.loadConfigs.call(this);
        });
      },
      askForProjectId() {
        if (this.abort) return;
        const done = this.async();
        const prompts = [
          {
            type: 'input',
            name: 'gcpProjectId',
            message: 'Google Cloud Project ID',
            default: this._defaultProjectId(),
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
            },
          },
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
                    { value: 'us-central', name: 'us-central1 - Iowa' },
                    { value: 'us-east1', name: 'us-east1 - South Carolina' },
                    { value: 'us-east4', name: 'us-east4 - Northern Virginia' },
                    { value: 'us-west2', name: 'us-west2 - Los Angeles' },
                    { value: 'us-west3', name: 'us-west3 - Salt Lake City' },
                    { value: 'us-west4', name: 'us-west4 - Las Vegas' },
                    { value: 'southamerica-east1', name: 'southamerica-east1 - São Paulo' },
                    { value: 'europe-west', name: 'europe-west1 - Belgium' },
                    { value: 'europe-west2', name: 'europe-west2 - London' },
                    { value: 'europe-west3', name: 'europe-west3 - Frankfurt' },
                    { value: 'europe-west6', name: 'europe-west6 - Zürich' },
                    { value: 'asia-northeast1', name: 'asia-northeast1 - Tokyo' },
                    { value: 'asia-northeast2', name: 'asia-northeast2 - Osaka' },
                    { value: 'asia-northeast3', name: 'asia-northeast3 - Seoul' },
                    { value: 'asia-south1', name: 'asia-south1 - Mumbai' },
                    { value: 'asia-east2', name: 'asia-east2 - Hong Kong' },
                    { value: 'asia-southeast2', name: 'asia-southeast2 - Jakarta' },
                    { value: 'australia-southeast1', name: 'australia-southeast1 - Sydney' },
                  ],
                  default: this.gaeLocation ? this.gaeLocation : 0,
                },
              ];

              this.prompt(prompts).then(props => {
                this.gaeLocation = props.gaeLocation;
                this.gaeLocationExists = false;
                done();
              });
            } else {
              this.gaeLocationExists = true;
              this.gaeLocation = stdout.trim();
              this.logger.info(`This project already has an App Engine location set, using location "${chalk.cyan(this.gaeLocation)}"`);
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
            choices: this._defaultServiceNameChoices(this.defaultServiceExists),
            default: this.gaeServiceName ? this.gaeServiceName : 0,
          },
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
              { value: 'B8', name: 'B8 - 4.8GHz, 2GB, Basic or Manual Scaling' },
            ],
            default: this.gaeInstanceClass ? this.gaeInstanceClass : 0,
          },
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
          this.logger.info(
            `Instance Class "${chalk.cyan(this.gaeInstanceClass)}" can only be automatically scaled. Setting scaling type to automatic.`
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
              default: this.gaeScalingType ? this.gaeScalingType : 0,
            },
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
            },
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
            },
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
            },
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
          },
        });

        this.prompt(prompts).then(props => {
          this.gaeCloudSQLInstanceNeeded = props.gaeCloudSQLInstanceNeeded;
          done();
        });
      },

      askForCloudSqlInstance() {
        if (this.gaeCloudSQLInstanceNeeded === 'N') return;
        if (this.abort) return;
        if (this.prodDatabaseType !== MYSQL && this.prodDatabaseType !== MARIADB && this.prodDatabaseType !== POSTGRESQL) return;

        const done = this.async();

        const cloudSqlInstances = [{ value: '', name: 'New Cloud SQL Instance' }];
        shelljs.exec(
          `gcloud sql instances list  --format="value[separator=':'](project,region,name)" --project="${this.gcpProjectId}"`,
          (code, stdout, err) => {
            if (err && code !== 0) {
              this.logger.error(err);
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
                default: this.gcpCloudSqlInstanceName ? this.gcpCloudSqlInstanceName : 0,
              },
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
            default: this.gcpCloudSqlInstanceName ? this.gcpCloudSqlInstanceName : this.baseName,
          },
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
            },
          },
          {
            type: 'password',
            name: 'gcpCloudSqlPassword',
            message: 'Google Cloud SQL Password',
            default: this.gcpCloudSqlPassword ? this.gcpCloudSqlPassword : '',
          },
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
          `gcloud sql databases list -i ${name} --format="value(name)" --project="${this.gcpProjectId}"`,
          { silent: true },
          (code, stdout, err) => {
            if (err && code !== 0) {
              this.logger.error(err);
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
                default: this.gcpCloudSqlDatabaseName ? this.gcpCloudSqlDatabaseName : 0,
              },
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
            default: this.gcpCloudSqlDatabaseName ? this.gcpCloudSqlDatabaseName : this.baseName,
          },
        ];

        this.prompt(prompts).then(props => {
          this.gcpCloudSqlDatabaseName = props.gcpCloudSqlDatabaseName;
          this.gcpCloudSqlDatabaseNameExists = false;
          done();
        });
      },
    };
  }

  get [BaseGenerator.PROMPTING]() {
    return this.delegateTasksToBlueprint(() => this.prompting);
  }

  get configuring() {
    return {
      insight() {
        statistics.sendSubGenEvent('generator', GENERATOR_GAE);
      },

      configureProject() {
        if (this.abort) return;
        const done = this.async();

        if (!this.gaeLocationExists) {
          this.logger.log(chalk.bold(`Configuring Google App Engine Location "${chalk.cyan(this.gaeLocation)}"`));
          shelljs.exec(
            `gcloud app create --region="${this.gaeLocation}" --project="${this.gcpProjectId}"`,
            { silent: true },
            (code, stdout, err) => {
              if (err && code !== 0) {
                this.logger.error(err);
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

        this.logger.log(chalk.bold('\nCreating New Cloud SQL Instance'));

        const name = this.gcpCloudSqlInstanceName;
        // for mysql keep default options, set specific option for pg
        const dbVersionFlag = this.prodDatabaseType === 'postgresql' ? ' --database-version="POSTGRES_9_6" --tier="db-g1-small"' : '';
        let gaeCloudSqlLocation = this.gaeLocation;
        if (gaeCloudSqlLocation === 'us-central') {
          gaeCloudSqlLocation = 'us-central1';
        } else if (gaeCloudSqlLocation === 'europe-west') {
          gaeCloudSqlLocation = 'europe-west1';
        }
        const cmd = `gcloud sql instances create "${name}" --region='${gaeCloudSqlLocation}' --project=${this.gcpProjectId}${dbVersionFlag}`;
        this.logger.log(chalk.bold(`\n... Running: ${cmd}`));

        shelljs.exec(cmd, { silent: true }, (code, stdout, err) => {
          if (err && code !== 0) {
            this.abort = true;
            this.logger.error(err);
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

        this.logger.log(chalk.bold('\nConfiguring Cloud SQL Login'));

        const name = this.gcpCloudSqlInstanceName.split(':')[2];
        shelljs.exec(
          `gcloud sql users list -i jhipster --format="value(name)" --project="${this.gcpProjectId}"`,
          { silent: true },
          (code, stdout, err) => {
            if (_.includes(stdout, this.gcpCloudSqlUserName)) {
              this.logger.log(chalk.bold(`... User "${chalk.cyan(this.gcpCloudSqlUserName)}" already exists`));
              const cmd = `gcloud sql users set-password "${this.gcpCloudSqlUserName}" -i "${name}" --host="%" --project="${this.gcpProjectId}" --password="..."`;
              this.logger.log(chalk.bold(`... To set its password, run: ${cmd}`));
              done();
            } else {
              const cmd = `gcloud sql users create "${this.gcpCloudSqlUserName}" -i "${name}" --host="%" --password="${this.gcpCloudSqlPassword}" --project="${this.gcpProjectId}"`;
              this.logger.log(chalk.bold(`... Running: ${cmd}`));
              shelljs.exec(cmd, { silent: true }, (code, stdout, err) => {
                if (err && code !== 0) {
                  this.logger.error(err);
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
        this.logger.log(chalk.bold(`\nCreating Database ${chalk.cyan(this.gcpCloudSqlDatabaseName)}`));
        const cmd = `gcloud sql databases create "${this.gcpCloudSqlDatabaseName}" --charset=utf8 -i "${name}" --project="${this.gcpProjectId}"`;
        this.logger.log(chalk.bold(`... Running: ${cmd}`));
        shelljs.exec(cmd, { silent: true }, (code, stdout, err) => {
          if (err && code !== 0) {
            this.logger.error(err);
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
          gaeCloudSQLInstanceNeeded: this.gaeCloudSQLInstanceNeeded,
        });
      },
    };
  }

  get [BaseGenerator.CONFIGURING]() {
    return this.delegateTasksToBlueprint(() => this.configuring);
  }

  get loading() {
    return {
      loadSharedConfig() {
        this.loadDerivedAppConfig();
      },
    };
  }

  get [BaseGenerator.LOADING]() {
    return this.delegateTasksToBlueprint(() => this.loading);
  }

  get writing() {
    return {
      copyFiles() {
        if (this.abort) return;

        this.logger.log(chalk.bold('\nCreating Google App Engine deployment files'));

        this.writeFile('app.yaml.ejs', `${MAIN_DIR}/appengine/app.yaml`);
        if (this.applicationType === GATEWAY) {
          this.writeFile('dispatch.yaml.ejs', `${MAIN_DIR}/appengine/dispatch.yaml`);
        }
        this.writeFile('application-prod-gae.yml.ejs', `${SERVER_MAIN_RES_DIR}/config/application-prod-gae.yml`);
        if (this.buildTool === 'gradle') {
          this.writeFile('gae.gradle.ejs', 'gradle/gae.gradle');
        }
      },

      addDependencies() {
        if (this.abort) return;
        if (this.buildTool === MAVEN) {
          this.addMavenDependency('org.springframework.boot.experimental', 'spring-boot-thin-layout', '1.0.28.RELEASE');
        }
        if (this.gaeCloudSQLInstanceNeeded === 'N') return;
        if (this.prodDatabaseType === MYSQL || this.prodDatabaseType === MARIADB) {
          if (this.buildTool === MAVEN) {
            this.addMavenDependency('com.google.cloud.sql', 'mysql-socket-factory', '1.0.8');
          } else if (this.buildTool === GRADLE) {
            // TODO addGradleDependencyCallback is an internal api, switch to source api when converted to BaseApplicationGenerator
            this.editFile(
              'build.gradle',
              addGradleDependencyCallback({
                groupId: 'com.google.cloud.sql',
                artifactId: 'mysql-socket-factory',
                version: '1.0.8',
                scope: 'compile',
              })
            );
          }
        }
        if (this.prodDatabaseType === POSTGRESQL) {
          if (this.buildTool === MAVEN) {
            this.addMavenDependency('com.google.cloud.sql', 'postgres-socket-factory', '1.0.12');
          } else if (this.buildTool === GRADLE) {
            // TODO addGradleDependencyCallback is an internal api, switch to source api when converted to BaseApplicationGenerator
            this.editFile(
              'build.gradle',
              addGradleDependencyCallback({
                groupId: 'com.google.cloud.sql',
                artifactId: 'postgres-socket-factory',
                version: '1.0.12',
                scope: 'compile',
              })
            );
          }
        }
      },

      addGradlePlugin() {
        if (this.abort) return;
        if (this.buildTool === GRADLE) {
          // TODO addGradlePluginCallback is an internal api, switch to source api when converted to BaseApplicationGenerator
          this.editFile(
            'build.gradle',
            addGradlePluginCallback({ groupId: 'com.google.cloud.tools', artifactId: 'appengine-gradle-plugin', version: '2.2.0' })
          );
          // TODO addGradlePluginCallback is an internal api, switch to source api when converted to BaseApplicationGenerator
          this.editFile(
            'build.gradle',
            addGradlePluginCallback({
              groupId: 'org.springframework.boot.experimental',
              artifactId: 'spring-boot-thin-gradle-plugin',
              version: '1.0.13.RELEASE',
            })
          );
          // TODO applyFromGradleCallback is an internal api, switch to source api when converted to BaseApplicationGenerator
          this.editFile('build.gradle', applyFromGradleCallback({ script: 'gradle/gae.gradle' }));
        }
      },

      addMavenPlugin() {
        if (this.abort) return;
        if (this.buildTool === MAVEN) {
          this.addMavenPlugin('com.google.cloud.tools', 'appengine-maven-plugin', '2.2.0', mavenPluginConfiguration(this));
          this.addMavenProfile('prod-gae', mavenProdProfileContent(this));
          this.addMavenProfile('gae', mavenProfileContent(this));
        }
      },
    };
  }

  get [BaseGenerator.WRITING]() {
    return this.delegateTasksToBlueprint(() => this.writing);
  }

  get end() {
    return {
      productionBuild() {
        if (this.abort) return;
        // Until issue; https://github.com/GoogleCloudPlatform/app-gradle-plugin/issues/376 is fixed we shall disable .gcloudignore
        this.logger.log(
          chalk.bold(
            'Due to a Bug in GCloud SDK you will need to disable the generation of .gcloudignore file before deploying using: "gcloud config set gcloudignore/enabled false". For more info refer: https://github.com/GoogleCloudPlatform/app-gradle-plugin/issues/376'
          )
        );
        if (this.buildTool === MAVEN) {
          this.logger.log(chalk.bold('Deploy to App Engine: ./mvnw package appengine:deploy -DskipTests -Pgae,prod,prod-gae'));
        } else if (this.buildTool === 'gradle') {
          this.logger.log(chalk.bold('Deploy to App Engine: ./gradlew appengineDeploy -Pgae -Pprod-gae'));
        }
        /*
                if (this.gcpSkipBuild || this.gcpDeployType === 'git') {
                    this.logger.log(chalk.bold('\nSkipping build'));
                    return;
                }

                const done = this.async();
                this.logger.log(chalk.bold('\nBuilding application'));

                const child = this.buildApplication(this.buildTool, 'prod', (err) => {
                    if (err) {
                        this.abort = true;
                        this.logger.error(err);
                    }
                    done();
                });

                this.buildCmd = child.buildCmd;

                child.stdout.on('data', (data) => {
                    process.stdout.write(data.toString());
                }); */
      },
    };
  }

  get [BaseGenerator.END]() {
    return this.delegateTasksToBlueprint(() => this.end);
  }

  _defaultProjectId() {
    if (this.abort) return null;
    if (this.gcpProjectId) {
      return this.gcpProjectId;
    }
    try {
      const projectId = shelljs.exec('gcloud config get-value core/project --quiet', { silent: true }).stdout;
      return projectId.trim();
    } catch (ex) {
      this.logger.error('Unable to determine the default Google Cloud Project ID');
      return undefined;
    }
  }

  _defaultServiceNameChoices(defaultServiceExists) {
    if (this.applicationType === MONOLITH) {
      return defaultServiceExists ? ['default', _.kebabCase(this.baseName)] : ['default'];
    }
    if (this.applicationType === GATEWAY) {
      return ['default'];
    }

    return [_.kebabCase(this.baseName)];
  }

  _getMicroserviceFolders(input) {
    const destinationPath = this.destinationPath(input);
    const files = shelljs.ls('-l', destinationPath);
    const appsFolders = [];

    files.forEach(file => {
      if (file.isDirectory()) {
        if (fs.existsSync(`${destinationPath}/${file.name}/.yo-rc.json`)) {
          try {
            const fileData = this.fs.readJSON(`${destinationPath}/${file.name}/.yo-rc.json`);
            if (fileData['generator-jhipster'].applicationType === MICROSERVICE) {
              appsFolders.push(file.name.match(/([^/]*)\/*$/)[1]);
            }
          } catch (err) {
            this.logger.error(chalk.red(`${file}: this .yo-rc.json can't be read`));
            this.logger.debug('Error:', err);
          }
        }
      }
    });

    return appsFolders;
  }

  /**
   * @private
   * Add a new Maven dependency.
   *
   * @param {string} groupId - dependency groupId
   * @param {string} artifactId - dependency artifactId
   * @param {string} version - (optional) explicit dependency version number
   * @param {string} other - (optional) explicit other thing: scope, exclusions...
   */
  addMavenDependency(groupId, artifactId, version, other) {
    createPomStorage(this).addDependency({
      groupId,
      artifactId,
      version,
      additionalContent: other,
    });
  }

  /**
   * @private
   * Add a new Maven plugin.
   *
   * @param {string} groupId - plugin groupId
   * @param {string} artifactId - plugin artifactId
   * @param {string} version - explicit plugin version number
   * @param {string} other - explicit other thing: executions, configuration...
   */
  addMavenPlugin(groupId, artifactId, version, other) {
    createPomStorage(this).addPlugin({
      groupId,
      artifactId,
      version,
      additionalContent: other,
    });
  }

  /**
   * @private
   * Add a new Maven profile.
   *
   * @param {string} profileId - profile ID
   * @param {string} other - explicit other thing: build, dependencies...
   */
  addMavenProfile(profileId, other) {
    createPomStorage(this).addProfile({ id: profileId, content: other });
  }
}
