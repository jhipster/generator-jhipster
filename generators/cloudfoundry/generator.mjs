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
import os from 'os';
import childProcess from 'child_process';
import chalk from 'chalk';
import glob from 'glob';

import BaseGenerator from '../base/index.mjs';

import prompts from './prompts.mjs';
import statistics from '../statistics.cjs';
import { CLIENT_MAIN_SRC_DIR, SERVER_MAIN_RES_DIR } from '../generator-constants.mjs';
import { GENERATOR_CLOUDFOUNDRY } from '../generator-list.mjs';
import { cacheTypes, buildToolTypes, databaseTypes } from '../../jdl/jhipster/index.mjs';

const { MEMCACHED } = cacheTypes;
const { GRADLE, MAVEN } = buildToolTypes;
const cacheProviders = cacheTypes;

const NO_CACHE_PROVIDER = cacheProviders.NO;
const NO_DATABASE_TYPE = databaseTypes.NO;

const exec = childProcess.exec;

/* eslint-disable consistent-return */
export default class CloudfoundryGenerator extends BaseGenerator {
  async beforeQueue() {
    if (!this.fromBlueprint) {
      await this.composeWithBlueprints(GENERATOR_CLOUDFOUNDRY);
    }
  }

  get initializing() {
    return {
      sayHello() {
        this.log(chalk.bold('CloudFoundry configuration is starting'));
      },

      getSharedConfig() {
        this.loadAppConfig();
        this.loadServerConfig();
        this.loadPlatformConfig();

        this.loadDerivedAppConfig();
        this.loadDerivedServerConfig();
      },
      getConfig() {
        const configuration = this.config;
        this.env.options.appPath = configuration.get('appPath') || CLIENT_MAIN_SRC_DIR;
        this.cacheProvider = this.cacheProvider || NO_CACHE_PROVIDER;
        this.enableHibernateCache = this.enableHibernateCache && ![NO_CACHE_PROVIDER, MEMCACHED].includes(this.cacheProvider);
        this.frontendAppName = this.getFrontendAppName();
      },
    };
  }

  get [BaseGenerator.INITIALIZING]() {
    return this.delegateTasksToBlueprint(() => this.initializing);
  }

  get prompting() {
    return prompts.prompting;
  }

  get [BaseGenerator.PROMPTING]() {
    return this.delegateTasksToBlueprint(() => this.prompting);
  }

  get configuring() {
    return {
      insight() {
        statistics.sendSubGenEvent('generator', GENERATOR_CLOUDFOUNDRY);
      },

      derivedProperties() {
        this.databaseTypeNo = this.databaseType === NO_DATABASE_TYPE;
      },

      copyCloudFoundryFiles() {
        if (this.abort) return;
        this.log(chalk.bold('\nCreating Cloud Foundry deployment files'));
        this.writeFile('manifest.yml.ejs', 'deploy/cloudfoundry/manifest.yml');
        this.writeFile('application-cloudfoundry.yml.ejs', `${SERVER_MAIN_RES_DIR}config/application-cloudfoundry.yml`);
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
      },
    };
  }

  get [BaseGenerator.CONFIGURING]() {
    return this.delegateTasksToBlueprint(() => this.configuring);
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
            `cf create-service ${this.cloudfoundryDatabaseServiceName} ${this.cloudfoundryDatabaseServicePlan} ${this.cloudfoundryDeployedName}`,
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

        const child = this.buildApplication(this.buildTool, this.cloudfoundryProfile, false, err => {
          if (err) {
            this.log.error(err);
          }
          done();
        });

        this.buildCmd = child.buildCmd;

        child.stdout.on('data', data => {
          this.log(data.toString());
        });
      },
    };
  }

  get [BaseGenerator.DEFAULT]() {
    return this.delegateTasksToBlueprint(() => this.default);
  }

  get end() {
    return {
      cloudfoundryPush() {
        if (this.abort) return;
        const done = this.async();
        let cloudfoundryDeployCommand = 'cf push -f ./deploy/cloudfoundry/manifest.yml -t 120 -p';
        let jarFolder = '';
        if (this.buildTool === MAVEN) {
          jarFolder = ' target/';
        } else if (this.buildTool === GRADLE) {
          jarFolder = ' build/libs/';
        }
        if (os.platform() === 'win32') {
          cloudfoundryDeployCommand += ` ${glob.sync(`${jarFolder.trim()}*.jar`)[0]}`;
        } else {
          cloudfoundryDeployCommand += `${jarFolder}*.jar`;
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
      },
    };
  }

  get [BaseGenerator.END]() {
    return this.delegateTasksToBlueprint(() => this.end);
  }
}
