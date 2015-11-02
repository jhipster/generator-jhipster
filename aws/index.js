'use strict';
var util = require('util'),
    path = require('path'),
    yeoman = require('yeoman-generator'),
    chalk = require('chalk'),
    _ = require('underscore.string'),
    scriptBase = require('../script-base'),
    build = require('./lib/build.js'),
    AwsFactory = require('./lib/aws.js');

var AwsGenerator = module.exports = function AwsGenerator(args, options, config) {
    yeoman.generators.Base.apply(this, arguments);

    console.log(chalk.bold('AWS configuration is starting'));

    this.env.options.appPath = this.config.get('appPath') || 'src/main/webapp';
    this.baseName = this.config.get('baseName');
    this.buildTool = this.config.get('buildTool');
};

util.inherits(AwsGenerator, yeoman.generators.Base);
util.inherits(AwsGenerator, scriptBase);

AwsGenerator.prototype.checkDatabase = function checkDatabase() {
    var prodDatabaseType = this.config.get('prodDatabaseType');

    switch (prodDatabaseType.toLowerCase()) {
        case 'mysql':
            this.dbEngine = 'mysql';
            break;
        case 'postgresql':
            this.dbEngine = 'postgres';
            break;
        default:
            this._errorHandling({message: 'Sorry deployment for this database is not possible'})
    }
};

AwsGenerator.prototype.askFor = function askFor() {
    if (this.abort) return;
    var done = this.async();

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
        this.applicationName = _.slugify(props.applicationName);
        this.environmentName = _.slugify(props.environmentName);
        this.bucketName = _.slugify(props.bucketName);
        this.instanceType = props.instanceType;
        this.awsRegion = props.awsRegion;
        this.dbName = props.dbName;
        this.dbUsername = props.dbUsername;
        this.dbPassword = props.dbPassword;
        this.dbInstanceClass = props.dbInstanceClass;

        done();
    }.bind(this));
};

AwsGenerator.prototype.productionBuild = function productionBuild() {
    if (this.abort) return;
    var insight = this.insight();
    insight.track('generator', 'aws');
    var done = this.async();
    this.log();
    this.log(chalk.bold('Building application'));

    build.buildProduction(this.buildTool,
        function (err) {
            if (err) {
                this._errorHandling(err);
            } else {
                done();
            }
        }.bind(this))
        .on('data', function (data) {
            this.log(data.toString());
        }.bind(this));
};

AwsGenerator.prototype.createAwsFactory = function createAwsFactory() {
    if (this.abort) return;
    var done = this.async();

    this.awsFactory = new AwsFactory({region: this.awsRegion});

    done();
};

AwsGenerator.prototype.createBucket = function createBucket() {
    if (this.abort) return;
    var done = this.async();
    this.log();
    this.log(chalk.bold('Create S3 bucket'));

    var s3 = this.awsFactory.getS3();

    s3.createBucket({bucket: this.bucketName}, function (err, data) {
        if (err) {
            this._errorHandling(err);
        } else {
            this.log(data.message);
            done();
        }
    }.bind(this));
};

AwsGenerator.prototype.uploadWar = function uploadWar() {
    if (this.abort) return;
    var done = this.async();
    this.log();
    this.log(chalk.bold('Upload WAR to S3'));

    var s3 = this.awsFactory.getS3();

    s3.uploadWar({bucket: this.bucketName}, function (err, data) {
        if (err) {
            this._errorHandling(err);
        } else {
            this.warKey = data.warKey;
            this.log(data.message);
            done();
        }
    }.bind(this));
};

AwsGenerator.prototype.createDatabase = function createDatabase() {
    if (this.abort) return;
    var done = this.async();
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
            this._errorHandling(err);
        } else {
            this.log(data.message);
            done();
        }
    }.bind(this));
};

AwsGenerator.prototype.createDatabaseUrl = function createDatabaseUrl() {
    if (this.abort) return;
    var done = this.async();
    this.log();
    this.log(chalk.bold('Waiting for database (This may take several minutes)'));

    if(this.dbEngine === 'postgres') {
        this.dbEngine = 'postgresql';
    }

    var rds = this.awsFactory.getRds();

    var params = {
        dbName: this.dbName,
        dbEngine: this.dbEngine
    };

    rds.createDatabaseUrl(params, function (err, data) {
        if (err) {
            this._errorHandling(err);
        } else {
            this.dbUrl = data.dbUrl;
            this.log(data.message);
            done();
        }
    }.bind(this));
};

AwsGenerator.prototype.createApplication = function createApplication() {
    if (this.abort) return;
    var done = this.async();
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
            this._errorHandling(err);
        } else {
            this.log(data.message);
            done();
        }
    }.bind(this));
};

AwsGenerator.prototype._errorHandling = function _errorHandling(err) {
    if (err) {
        this.abort = true;
        this.log.error(err.message);
    }
};
