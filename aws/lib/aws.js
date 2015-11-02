'use strict';
var S3 = require('./s3.js'),
    Rds = require('./rds.js'),
    Eb = require('./eb.js');

try {
    var Aws = require('aws-sdk');
} catch (e) {
    console.log(
        'You don\'t have the AWS SDK installed. Please install it in the JHipster generator directory.\n\n' +
        'WINDOWS\n' +
        'cd %USERPROFILE%\\AppData\\Roaming\\npm\\node_modules\\generator-jhipster\n' +
        'npm install aws-sdk progress node-uuid\n\n' +
        'LINUX / MAC\n' +
        'cd /usr/local/lib/node_modules/generator-jhipster\n' +
        'npm install aws-sdk progress node-uuid'
    );
    process.exit(e.code);
}

var AwsFactory = module.exports = function AwsFactory(options) {
    Aws.config.region = options.region;
};

AwsFactory.prototype.getS3 = function getS3() {
    return new S3(Aws);
};

AwsFactory.prototype.getRds = function getRds() {
    return new Rds(Aws);
};

AwsFactory.prototype.getEb = function getEb() {
    return new Eb(Aws);
};
