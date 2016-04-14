'use strict';
var util = require('util'),
    generators = require('yeoman-generator'),
    chalk = require('chalk'),
    _ = require('lodash'),
    scriptBase = require('../generator-base'),
    AwsFactory = require('./lib/aws.js');

var AwsGenerator = generators.Base.extend({});

util.inherits(AwsGenerator, scriptBase);

module.exports = AwsGenerator.extend({
    initializing: {
        initAws: function () {
            this.awsFactory = new AwsFactory(this);
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
                this.env.error(chalk.red('Sorry deployment for this database is not possible'));
            }
        }
    },
    prompting: function () {
        if (this.existingProject) {
            return;
        }

        var cb = this.async();

        var prompts = [
            {
                type: 'input',
                name: 'applicationName',
                message: 'Application name:',
                default: this.baseName
            },
            {
                type: 'input',
                name: 'environmentName',
                message: 'Environment name:',
                default: this.baseName + '-env'
            },
            {
                type: 'input',
                name: 'bucketName',
                message: 'Name of S3 bucket:',
                default: this.baseName
            },
            {
                type: 'input',
                name: 'dbName',
                message: 'Database name:',
                default: this.baseName
            },
            {
                type: 'input',
                name: 'dbUsername',
                message: 'Database username:',
                validate: function (input) {
                    if (input === '') return 'Please provide a username';
                    else return true;
                }
            },
            {
                type: 'password',
                name: 'dbPassword',
                message: 'Database password:',
                validate: function (input) {
                    if (input === '') return 'Please provide a password';
                    else if (input.length < 8) return 'Password must contain minimum 8 chars';
                    else return true;
                }
            },
            {
                type: 'list',
                name: 'instanceType',
                message: 'On which EC2 instance type do you want to deploy?',
                choices: ['t2.micro', 't2.small', 't2.medium', 'm3.large', 'm3.xlarge', 'm3.2xlarge', 'c3.large', 'c3.xlarge',
                    'c3.2xlarge', 'c3.4xlarge', 'c3.8xlarge', 'hs1.8xlarge', 'i2.xlarge', 'i2.2xlarge', 'i2.4xlarge',
                    'i2.8xlarge', 'r3.large', 'r3.xlarge', 'r3.2xlarge'],
                default: 0
            },
            {
                type: 'list',
                name: 'dbInstanceClass',
                message: 'On which RDS instance class do you want to deploy?',
                choices: ['db.t1.micro', 'db.m1.small', 'db.m1.medium', 'db.m1.large', 'db.m1.xlarge', 'db.m2.xlarge ',
                    'db.m2.2xlarge', 'db.m2.4xlarge', 'db.m3.medium', 'db.m3.large', 'db.m3.xlarge', 'db.m3.2xlarge',
                    'db.r3.large', 'db.r3.xlarge', 'db.r3.2xlarge', 'db.r3.4xlarge', 'db.r3.8xlarge', 'db.t2.micro',
                    'db.t2.small', 'db.t2.medium'],
                default: 17
            },
            {
                type: 'list',
                name: 'awsRegion',
                message: 'On which region do you want to deploy?',
                choices: ['ap-northeast-1', 'ap-southeast-1', 'ap-southeast-2', 'eu-central-1', 'eu-west-1', 'sa-east-1',
                    'us-east-1', 'us-west-1', 'us-west-2'],
                default: 3
            }];

        this.prompt(prompts, function (props) {
            this.applicationName = _.kebabCase(props.applicationName);
            this.environmentName = _.kebabCase(props.environmentName);
            this.bucketName = _.kebabCase(props.bucketName);
            this.instanceType = props.instanceType;
            this.awsRegion = props.awsRegion;
            this.dbName = props.dbName;
            this.dbUsername = props.dbUsername;
            this.dbPassword = props.dbPassword;
            this.dbInstanceClass = props.dbInstanceClass;

            cb();
        }.bind(this));
    },
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
                    this.env.error(chalk.red(err));
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
                    this.env.error(chalk.red(err.message));
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
                    this.env.error(chalk.red(err.message));
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
                    this.env.error(chalk.red(err.message));
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
                    this.env.error(chalk.red(err.message));
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
                    this.env.error(chalk.red(err.message));
                } else {
                    this.log(data.message);
                    cb();
                }
            }.bind(this));
        }
    }
});
