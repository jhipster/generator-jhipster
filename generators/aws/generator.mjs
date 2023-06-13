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
import chalk from 'chalk';
import runAsync from 'run-async';

import BaseGenerator from '../base/index.mjs';
import prompts from './prompts.mjs';
import AwsFactory from './lib/aws.mjs';
import statistics from '../statistics.mjs';
import { GENERATOR_AWS } from '../generator-list.mjs';
import { databaseTypes } from '../../jdl/jhipster/index.mjs';

const { MYSQL, POSTGRESQL, MARIADB } = databaseTypes;

/* eslint-disable consistent-return */
export default class AwsGenerator extends BaseGenerator {
  async beforeQueue() {
    if (!this.fromBlueprint) {
      await this.composeWithBlueprints(GENERATOR_AWS);
    }
  }

  get initializing() {
    return {
      initAws: runAsync(function () {
        const done = this.async();
        this.awsFactory = new AwsFactory(this, done);
      }),
      getGlobalConfig() {
        this.existingProject = false;
        this.baseName = this.jhipsterConfig.baseName;
        this.buildTool = this.jhipsterConfig.buildTool;
      },
      getAwsConfig() {
        if (this.jhipsterConfig.aws) {
          this.existingProject = true;
          this.applicationName = this.jhipsterConfig.aws.applicationName;
          this.environmentName = this.jhipsterConfig.aws.environmentName;
          this.bucketName = this.jhipsterConfig.aws.bucketName;
          this.instanceType = this.jhipsterConfig.aws.instanceType;
          this.customInstanceType = '';
          this.awsRegion = this.jhipsterConfig.aws.awsRegion;
          this.dbName = this.jhipsterConfig.aws.dbName;
          this.dbInstanceClass = this.jhipsterConfig.aws.dbInstanceClass;
          this.customDBInstanceClass = '';

          this.log.log(
            chalk.green(
              'This is an existing deployment, using the configuration from your .yo-rc.json file \nto deploy your application...\n'
            )
          );
        }
      },
      checkDatabase() {
        const prodDatabaseType = this.jhipsterConfig.prodDatabaseType;

        switch (prodDatabaseType.toLowerCase()) {
          case MARIADB:
            this.dbEngine = MARIADB;
            break;
          case MYSQL:
            this.dbEngine = MYSQL;
            break;
          case POSTGRESQL:
            this.dbEngine = 'postgres';
            break;
          default:
            throw new Error('Sorry deployment for this database is not possible');
        }
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
        statistics.sendSubGenEvent('generator', GENERATOR_AWS);
      },
      createAwsFactory: runAsync(function () {
        const cb = this.async();
        this.awsFactory.init({ region: this.awsRegion });
        cb();
      }),
      saveConfig() {
        this.jhipsterConfig.aws = {
          applicationName: this.applicationName,
          environmentName: this.environmentName,
          bucketName: this.bucketName,
          instanceType: this.instanceType,
          awsRegion: this.awsRegion,
          dbName: this.dbName,
          dbInstanceClass: this.dbInstanceClass,
        };
      },
    };
  }

  get [BaseGenerator.CONFIGURING]() {
    return this.delegateTasksToBlueprint(() => this.configuring);
  }

  get default() {
    return {
      productionBuild: runAsync(function () {
        const cb = this.async();
        this.log.log(chalk.bold('Building application'));

        const child = this.buildApplication(this.buildTool, 'prod', true, err => {
          if (err) {
            throw new Error(err);
          } else {
            cb();
          }
        });

        child.stdout.on('data', data => {
          process.stdout.write(data.toString());
        });
      }),
      createBucket: runAsync(function () {
        const cb = this.async();
        this.log.log();
        this.log.log(chalk.bold('Create S3 bucket'));

        const s3 = this.awsFactory.getS3();

        s3.createBucket({ bucket: this.bucketName }, (err, data) => {
          if (err) {
            if (err.message == null) {
              throw new Error('The S3 bucket could not be created. Are you sure its name is not already used?');
            } else {
              throw new Error(err.message);
            }
          } else {
            this.log.verboseInfo(data.message);
            cb();
          }
        });
      }),
      uploadWar: runAsync(function () {
        const cb = this.async();
        this.log.log();
        this.log.log(chalk.bold('Upload WAR to S3'));

        const s3 = this.awsFactory.getS3();

        const params = {
          bucket: this.bucketName,
          buildTool: this.buildTool,
        };

        s3.uploadWar(params, (err, data) => {
          if (err) {
            throw new Error(err.message);
          } else {
            this.warKey = data.warKey;
            this.log.verboseInfo(data.message);
            cb();
          }
        });
      }),
      createDatabase: runAsync(function () {
        const cb = this.async();
        this.log.log();
        this.log.log(chalk.bold('Create database'));

        const rds = this.awsFactory.getRds();

        const params = {
          dbInstanceClass: this.dbInstanceClass,
          dbName: this.dbName,
          dbEngine: this.dbEngine,
          dbPassword: this.dbPassword,
          dbUsername: this.dbUsername,
        };

        rds.createDatabase(params, (err, data) => {
          if (err) {
            throw new Error(err.message);
          } else {
            this.log.verboseInfo(data.message);
            cb();
          }
        });
      }),
      createDatabaseUrl: runAsync(function () {
        const cb = this.async();
        this.log.log();
        this.log.log(chalk.bold('Waiting for database (This may take several minutes)'));

        if (this.dbEngine === 'postgres') {
          this.dbEngine = POSTGRESQL;
        }

        const rds = this.awsFactory.getRds();

        const params = {
          dbName: this.dbName,
          dbEngine: this.dbEngine,
        };

        rds.createDatabaseUrl(params, (err, data) => {
          if (err) {
            throw new Error(err.message);
          } else {
            this.dbUrl = data.dbUrl;
            this.log.verboseInfo(data.message);
            cb();
          }
        });
      }),
      verifyRoles: runAsync(function () {
        const cb = this.async();
        this.log.log();
        this.log.log(chalk.bold('Verifying ElasticBeanstalk Roles'));
        const iam = this.awsFactory.getIam();
        iam.verifyRoles({}, err => {
          if (err) {
            throw new Error(err.message);
          } else {
            cb();
          }
        });
      }),
      createApplication: runAsync(function () {
        const cb = this.async();
        this.log.log();
        this.log.log(chalk.bold('Create/Update application'));

        const eb = this.awsFactory.getEb();

        const params = {
          applicationName: this.applicationName,
          bucketName: this.bucketName,
          warKey: this.warKey,
          environmentName: this.environmentName,
          dbUrl: this.dbUrl,
          dbUsername: this.dbUsername,
          dbPassword: this.dbPassword,
          instanceType: this.instanceType,
        };

        eb.createApplication(params, (err, data) => {
          if (err) {
            throw new Error(err.message);
          } else {
            this.log.verboseInfo(data.message);
            cb();
          }
        });
      }),
    };
  }

  get [BaseGenerator.DEFAULT]() {
    return this.delegateTasksToBlueprint(() => this.default);
  }
}
