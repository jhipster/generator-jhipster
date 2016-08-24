'use strict';
var util = require('util'),
    generators = require('yeoman-generator'),
    chalk = require('chalk'),
    scriptBase = require('../generator-base'),
    prompts = require('./prompts'),
    AwsFactory = require('./lib/aws.js');

var AwsGenerator = generators.Base.extend({});

util.inherits(AwsGenerator, scriptBase);

module.exports = AwsGenerator.extend({
    initializing: {
        initAws: function () {
            var done = this.async();
            this.awsFactory = new AwsFactory(this, done);
        },
        getGlobalConfig: function () {
            this.existingProject = false;
            this.baseName = this.config.get('baseName');
            this.buildTool = this.config.get('buildTool');
        },
        getAwsConfig: function () {
            var awsConfig = this.config.get('aws');

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
        checkDatabase: function () {
            var prodDatabaseType = this.config.get('prodDatabaseType');

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
        insight: function () {
            var insight = this.insight();
            insight.trackWithEvent('generator', 'aws');
        },
        createAwsFactory: function () {
            var cb = this.async();
            this.awsFactory.init({region: this.awsRegion});
            cb();
        },
        saveConfig: function () {
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
        productionBuild: function () {
            var cb = this.async();
            this.log(chalk.bold('Building application'));

            var child = this.buildApplication(this.buildTool, 'prod', function (err) {
                if (err) {
                    this.error(chalk.red(err));
                } else {
                    cb();
                }
            }.bind(this));

            child.stdout.on('data', function (data) {
                this.log(data.toString());
            }.bind(this));
        },
        createBucket: function () {
            var cb = this.async();
            this.log();
            this.log(chalk.bold('Create S3 bucket'));

            var s3 = this.awsFactory.getS3();

            s3.createBucket({bucket: this.bucketName}, function (err, data) {
                if (err) {
                    this.error(chalk.red(err.message));
                } else {
                    this.log(data.message);
                    cb();
                }
            }.bind(this));
        },
        uploadWar: function () {
            var cb = this.async();
            this.log();
            this.log(chalk.bold('Upload WAR to S3'));

            var s3 = this.awsFactory.getS3();

            var params = {
                bucket: this.bucketName,
                buildTool: this.buildTool
            };

            s3.uploadWar(params, function (err, data) {
                if (err) {
                    this.error(chalk.red(err.message));
                } else {
                    this.warKey = data.warKey;
                    this.log(data.message);
                    cb();
                }
            }.bind(this));
        },
        createDatabase: function () {
            var cb = this.async();
            this.log();
            this.log(chalk.bold('Create database'));

            var rds = this.awsFactory.getRds();

            var params = {
                dbInstanceClass: this.dbInstanceClass,
                dbName: this.dbName,
                dbEngine: this.dbEngine,
                dbPassword: this.dbPassword,
                dbUsername: this.dbUsername
            };

            rds.createDatabase(params, function (err, data) {
                if (err) {
                    this.error(chalk.red(err.message));
                } else {
                    this.log(data.message);
                    cb();
                }
            }.bind(this));
        },
        createDatabaseUrl: function () {
            var cb = this.async();
            this.log();
            this.log(chalk.bold('Waiting for database (This may take several minutes)'));

            if (this.dbEngine === 'postgres') {
                this.dbEngine = 'postgresql';
            }

            var rds = this.awsFactory.getRds();

            var params = {
                dbName: this.dbName,
                dbEngine: this.dbEngine
            };

            rds.createDatabaseUrl(params, function (err, data) {
                if (err) {
                    this.error(chalk.red(err.message));
                } else {
                    this.dbUrl = data.dbUrl;
                    this.log(data.message);
                    cb();
                }
            }.bind(this));
        },
        createApplication: function () {
            var cb = this.async();
            this.log();
            this.log(chalk.bold('Create/Update application'));

            var eb = this.awsFactory.getEb();

            var params = {
                applicationName: this.applicationName,
                bucketName: this.bucketName,
                warKey: this.warKey,
                environmentName: this.environmentName,
                dbUrl: this.dbUrl,
                dbUsername: this.dbUsername,
                dbPassword: this.dbPassword,
                instanceType: this.instanceType
            };

            eb.createApplication(params, function (err, data) {
                if (err) {
                    this.error(chalk.red(err.message));
                } else {
                    this.log(data.message);
                    cb();
                }
            }.bind(this));
        }
    }
});
