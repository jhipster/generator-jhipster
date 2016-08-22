'use strict';
var S3 = require('./s3.js'),
    Rds = require('./rds.js'),
    chalk = require('chalk'),
    Eb = require('./eb.js');

var Aws, generator;

var AwsFactory = module.exports = function AwsFactory(generatorRef) {
    generator = generatorRef;
    try {
        Aws = require('aws-sdk');
    } catch (e) {
        var windowsPath;
        var linuxPath;
        var applicationType = generator.config.get('applicationType');
        if (applicationType === 'monolith' || applicationType === 'gateway') {
            windowsPath = 'cd node_modules\\generator-jhipster\n';
            linuxPath = 'cd node_modules/generator-jhipster\n';
        } else {
            windowsPath = 'cd %USERPROFILE%\\AppData\\Roaming\\npm\\node_modules\\generator-jhipster\n';
            linuxPath = 'cd /usr/local/lib/node_modules/generator-jhipster\n';
        }
        generator.env.error(chalk.red(
            'You don\'t have the AWS SDK installed. Please install it in the JHipster generator directory.\n\n') +
            chalk.yellow('WINDOWS\n') +
            chalk.green(windowsPath + 'npm install aws-sdk progress node-uuid\n\n') +
            chalk.yellow('LINUX / MAC\n') +
            chalk.green(linuxPath + 'npm install aws-sdk progress node-uuid')
        );
    }
};

AwsFactory.prototype.init = function initAws(options) {
    Aws.config.region = options.region;
};

AwsFactory.prototype.getS3 = function getS3() {
    return new S3(Aws, generator);
};

AwsFactory.prototype.getRds = function getRds() {
    return new Rds(Aws, generator);
};

AwsFactory.prototype.getEb = function getEb() {
    return new Eb(Aws, generator);
};
