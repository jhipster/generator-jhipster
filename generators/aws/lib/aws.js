/**
 * Copyright 2013-2019 the original author or authors from the JHipster project.
 *
 * This file is part of the JHipster project, see https://www.jhipster.tech/
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
const shelljs = require('shelljs');
const S3 = require('./s3.js');
const Rds = require('./rds.js');
const Eb = require('./eb.js');
const Iam = require('./iam.js');

let Aws;
let generator;

const AwsFactory = (module.exports = function AwsFactory(generatorRef, cb) {
    generator = generatorRef;
    try {
        Aws = require('aws-sdk'); // eslint-disable-line
        cb();
    } catch (e) {
        generator.log('Installing AWS dependencies');
        let installCommand = 'yarn add aws-sdk progress uuid';
        if (generator.config.get('clientPackageManager') === 'npm') {
            installCommand = 'npm install aws-sdk progress uuid --save';
        }
        shelljs.exec(installCommand, { silent: false }, code => {
            if (code !== 0) generator.error('Something went wrong while installing the aws-sdk\n');
            Aws = require('aws-sdk'); // eslint-disable-line
            cb();
        });
    }
});

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

AwsFactory.prototype.getIam = function getIa() {
    return new Iam(Aws, generator);
};
