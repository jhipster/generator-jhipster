const S3 = require('./s3.js');
const Rds = require('./rds.js');
const shelljs = require('shelljs');
const Eb = require('./eb.js');

let Aws;
let generator;

const AwsFactory = module.exports = function AwsFactory(generatorRef, cb) {
    generator = generatorRef;
    try {
        Aws = require('aws-sdk'); // eslint-disable-line
        cb();
    } catch (e) {
        generator.log('Installing AWS dependencies into your JHipster folder');
        let installCommand = 'yarn add aws-sdk progress uuid --modules-folder node_modules/generator-jhipster/node_modules';
        if (generator.config.get('clientPackageManager') === 'npm') {
            installCommand = 'npm install aws-sdk progress uuid --prefix node_modules/generator-jhipster';
        }
        shelljs.exec(installCommand, { silent: true }, (code, msg, err) => {
            if (code !== 0) generator.error(`Something went wrong while installing:\n${err}`);
            Aws = require('aws-sdk'); // eslint-disable-line
            cb();
        });
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
