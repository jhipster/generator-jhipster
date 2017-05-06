/**
 * Copyright 2013-2017 the original author or authors.
 *
 * This file is part of the JHipster project, see https://jhipster.github.io/
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
const util = require('util');
const generator = require('yeoman-generator');
const chalk = require('chalk');
const BaseGenerator = require('../generator-base');
const prompts = require('./prompts');
const AwsFactory = require('./lib/aws.js');

const AwsGenerator = generator.extend({});

util.inherits(AwsGenerator, BaseGenerator);

module.exports = AwsGenerator.extend({
    initializing: {
        initAws() {
            const done = this.async();
            this.awsFactory = new AwsFactory(this, done);
        },
        getGlobalConfig() {
            this.existingProject = false;
            this.baseName = this.config.get('baseName');
            this.buildTool = this.config.get('buildTool');
        },
        getAwsConfig() {
            const awsConfig = this.config.get('aws');

            if (awsConfig) {
                this.existingProject = true;
                this.applicationName = awsConfig.applicationName;
                this.environmentName = awsConfig.environmentName;
                this.bucketName = awsConfig.bucketName;
                this.instanceType = awsConfig.instanceType;
                this.awsRegion = awsConfig.awsRegion;
                this.dbName = awsConfig.dbName;
                this.dbInstanceClass = awsConfig.dbInstanceClass;

                this.log(chalk.green('This is an existing deployment, using the configuration from your .yo-rc.json file \n' +
                    'to deploy your application...\n'));
            }
        },
        checkDatabase() {
            const prodDatabaseType = this.config.get('prodDatabaseType');

            switch (prodDatabaseType.toLowerCase()) {
            case 'mysql':
                this.dbEngine = 'mysql';
                break;
            case 'postgresql':
                this.dbEngine = 'postgres';
                break;
            default:
                this.error(chalk.red('Sorry deployment for this database is not possible'));
            }
        }
    },

    prompting: prompts.prompting,

    configuring: {
        insight() {
            const insight = this.insight();
            insight.trackWithEvent('generator', 'aws');
        },
        createAwsFactory() {
            const cb = this.async();
            this.awsFactory.init({ region: this.awsRegion });
            cb();
        },
        saveConfig() {
            this.config.set('aws', {
                applicationName: this.applicationName,
                environmentName: this.environmentName,
                bucketName: this.bucketName,
                instanceType: this.instanceType,
                awsRegion: this.awsRegion,
                dbName: this.dbName,
                dbInstanceClass: this.dbInstanceClass
            });
        }
    },

    default: {
        productionBuild() {
            const cb = this.async();
            this.log(chalk.bold('Building application'));

            const child = this.buildApplication(this.buildTool, 'prod', (err) => {
                if (err) {
                    this.error(chalk.red(err));
                } else {
                    cb();
                }
            });

            child.stdout.on('data', (data) => {
                this.log(data.toString());
            });
        },
        createBucket() {
            const cb = this.async();
            this.log();
            this.log(chalk.bold('Create S3 bucket'));

            const s3 = this.awsFactory.getS3();

            s3.createBucket({ bucket: this.bucketName }, (err, data) => {
                if (err) {
                    this.error(chalk.red(err.message));
                } else {
                    this.log(data.message);
                    cb();
                }
            });
        },
        uploadWar() {
            const cb = this.async();
            this.log();
            this.log(chalk.bold('Upload WAR to S3'));

            const s3 = this.awsFactory.getS3();

            const params = {
                bucket: this.bucketName,
                buildTool: this.buildTool
            };

            s3.uploadWar(params, (err, data) => {
                if (err) {
                    this.error(chalk.red(err.message));
                } else {
                    this.warKey = data.warKey;
                    this.log(data.message);
                    cb();
                }
            });
        },
        createDatabase() {
            const cb = this.async();
            this.log();
            this.log(chalk.bold('Create database'));

            const rds = this.awsFactory.getRds();

            const params = {
                dbInstanceClass: this.dbInstanceClass,
                dbName: this.dbName,
                dbEngine: this.dbEngine,
                dbPassword: this.dbPassword,
                dbUsername: this.dbUsername
            };

            rds.createDatabase(params, (err, data) => {
                if (err) {
                    this.error(chalk.red(err.message));
                } else {
                    this.log(data.message);
                    cb();
                }
            });
        },
        createDatabaseUrl() {
            const cb = this.async();
            this.log();
            this.log(chalk.bold('Waiting for database (This may take several minutes)'));

            if (this.dbEngine === 'postgres') {
                this.dbEngine = 'postgresql';
            }

            const rds = this.awsFactory.getRds();

            const params = {
                dbName: this.dbName,
                dbEngine: this.dbEngine
            };

            rds.createDatabaseUrl(params, (err, data) => {
                if (err) {
                    this.error(chalk.red(err.message));
                } else {
                    this.dbUrl = data.dbUrl;
                    this.log(data.message);
                    cb();
                }
            });
        },
        createApplication() {
            const cb = this.async();
            this.log();
            this.log(chalk.bold('Create/Update application'));

            const eb = this.awsFactory.getEb();

            const params = {
                applicationName: this.applicationName,
                bucketName: this.bucketName,
                warKey: this.warKey,
                environmentName: this.environmentName,
                dbUrl: this.dbUrl,
                dbUsername: this.dbUsername,
                dbPassword: this.dbPassword,
                instanceType: this.instanceType
            };

            eb.createApplication(params, (err, data) => {
                if (err) {
                    this.error(chalk.red(err.message));
                } else {
                    this.log(data.message);
                    cb();
                }
            });
        }
    }
});
