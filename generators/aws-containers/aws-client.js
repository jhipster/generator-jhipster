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
/* global process */
const _ = require('lodash');
const fs = require('fs');
const chalk = require('chalk');
const shelljs = require('shelljs');

const utils = require('../utils');

const AwsSSM = require('./lib/ssm');
const AwsECR = require('./lib/ecr');
const AwsCF = require('./lib/cloudFormation');

const DEFAULT_REGION = 'us-east-1';
const S3_MIN_PART_SIZE = 5242880;

// Instance from aws-sdk
let AWS;
let credentials;
let ec2;
// let ecr;
let s3;
let sts;
let ora;

// Instances from ./lib. Composed with aws-sdk
let SSM;
let ECR;
let CF;

let ProgressBar;

module.exports = {
    DEFAULT_REGION,
    SSM: () => SSM,
    ECR: () => ECR,
    CF: () => CF,
    createS3Bucket,
    getDockerLogin,
    listRegions,
    listSubnets,
    listVpcs,
    loadAWS,
    saveCredentialsInAWS,
    initAwsStuff,
    sanitizeBucketName,
    uploadTemplate
};

/**
 * Will load the aws-sdk npm dependency if it's not already loaded.
 *
 * @param generator the yeoman generator it'll be loaded in.
 * @returns {Promise} The promise will succeed if the aws-sdk has been loaded and fails if it couldn't be installed.
 */
function loadAWS(generator) {
    return new Promise((resolve, reject) => {
        try {
            AWS = require('aws-sdk'); // eslint-disable-line
            ProgressBar = require('progress'); // eslint-disable-line
            ora = require('ora'); // eslint-disable-line
        } catch (e) {
            generator.log('Installing AWS dependencies');
            let installCommand = 'yarn add aws-sdk@2.167.0 progress@2.0.0 ora@1.3.0';
            if (generator.config.get('clientPackageManager') === 'npm') {
                installCommand = 'npm install aws-sdk@2.167.0 progress@2.0.0 ora@1.3.0--save';
            }
            shelljs.exec(installCommand, { silent: false }, code => {
                if (code !== 0) {
                    generator.error('Something went wrong while installing the dependencies\n');
                    reject();
                }
                AWS = require('aws-sdk'); // eslint-disable-line
                ProgressBar = require('progress'); // eslint-disable-line
                ora = require('ora'); // eslint-disable-line
            });
        }
        resolve();
    });
}

/**
 * Init AWS stuff like ECR and whatnot.
 *
 * @param ecrConfig The config used to instanciate ECR
 */
function initAwsStuff(region = DEFAULT_REGION) {
    ec2 = new AWS.EC2({ region });
    // ecr = new AWS.ECR({ region });
    s3 = new AWS.S3();
    sts = new AWS.STS();

    SSM = new AwsSSM(region);
    ECR = new AwsECR(region);
    CF = new AwsCF(region);
}

/**
 * Wraps the promise in a CLI spinner
 * @param promise
 */
function spinner(promise, text = 'loading', spinnerIcon = 'monkey') {
    const spinner = ora({ spinner: spinnerIcon, text }).start();
    return new Promise((resolve, reject) => {
        promise
            .then(resolved => {
                spinner.stop();
                resolve(resolved);
            })
            .catch(err => {
                spinner.stop();
                reject(err);
            });
    });
}

/**
 * listRegions() returns a Promise, which resolves to an array of AWS region objects,
 * with "Endpoint" and "RegionName" properties
 *
 * @param region to use. Defaults to us-east-1
 * @returns {Promise<EC2.Region[]>}
 */
function listRegions() {
    return spinner(
        ec2
            .describeRegions({})
            .promise()
            .then(data => data.Regions)
    );
}

/**
 * listVpcs() returns a Promise, which resolves to an array of AWS VPC objects
 * @returns {Promise<EC2.Vpc[]>}
 */
function listVpcs() {
    return spinner(
        ec2
            .describeVpcs({})
            .promise()
            .then(data => data.Vpcs)
    );
}

/**
 * listSubnets() returns a Promise, which resolves to an array of
 * Subnets available within the supplied VPC ID
 * @param vpcId of the VPC with the subnets
 * @returns {Promise<EC2.Subnet[]>}
 */
function listSubnets(vpcId) {
    const params = {
        Filters: [
            {
                Name: 'vpc-id',
                Values: [vpcId]
            },
            {
                Name: 'state',
                Values: ['available']
            }
        ]
    };
    return spinner(
        ec2
            .describeSubnets(params)
            .promise()
            .then(data => data.Subnets)
    );
}

/**
 * Get the credentials from the ~/.aws/credentials file using the AWS_PROFILE env var to get the profile.
 *
 * @param profile The AWS profile to get the credentials from. Default to 'default'
 * @returns {Promise} Will resolve with no parameters if it succeeds, rejects with the error if it fails (no credentials found for given profile.
 */
function saveCredentialsInAWS(profile = 'default') {
    credentials = new AWS.SharedIniFileCredentials({ profile });
    return new Promise((resolve, reject) =>
        credentials.refresh(err => {
            if (err) {
                reject(err);
            }
            AWS.config.credentials = credentials;
            resolve();
        })
    );
}

/**
 * Retrieve decoded information to authenticate to Docker with AWS credentials.
 * @returns {Promise} Returns a promise that resolves when the informations are retrieved.
 */
function getDockerLogin() {
    return spinner(
        new Promise((resolve, reject) =>
            _getAuthorizationToken().then(authToken =>
                sts
                    .getCallerIdentity({})
                    .promise()
                    .then(data => {
                        const decoded = utils.decodeBase64(authToken.authorizationToken);
                        const splitResult = decoded.split(':');
                        resolve({
                            username: splitResult[0],
                            password: splitResult[1],
                            accountId: data.Account
                        });
                    })
                    .catch(() => reject(new Error("Couldn't retrieve the user informations")))
            )
        )
    );
}

/**
 * Fetch Authentication token from AWS to authenticate with Docker
 * @returns {Promise} Returns a promise that resolves when the informations are retrieved.
 * @private
 */
function _getAuthorizationToken() {
    return spinner(
        new Promise((resolve, reject) =>
            ECR.sdk
                .getAuthorizationToken({})
                .promise()
                .then(data => {
                    if (!_.has(data, 'authorizationData.0')) {
                        reject(new Error('No authorization data found.'));
                        return;
                    }
                    resolve(data.authorizationData[0]);
                })
        )
    );
}

/**
 * Create a S3 Bucket in said region with said bucketBaseName.
 * the bucketBaseName will be used to create a
 * @param bucketName the name of the bucket to create.
 * @param region the region to create the bucket in.
 * @returns {Promise}
 */
function createS3Bucket(bucketName, region = DEFAULT_REGION) {
    const createBuckerParams = {
        Bucket: bucketName
    };
    return spinner(
        new Promise((resolve, reject) =>
            s3
                .headBucket({
                    Bucket: bucketName
                })
                .promise()
                .catch(error => {
                    if (error.code !== 'NotFound') {
                        reject(
                            new Error(
                                `The S3 Bucket ${chalk.bold(bucketName)} in region ${chalk.bold(
                                    region
                                )} already exists and you don't have access to it. Error code: ${chalk.bold(error.code)}`
                            )
                        );
                    }
                })
                .then(() =>
                    s3
                        .createBucket(createBuckerParams)
                        .promise()
                        .then(resolve)
                        .catch(error =>
                            reject(
                                new Error(
                                    `There was an error during the creation of the S3 Bucket ${chalk.bold(
                                        bucketName
                                    )} in region ${chalk.bold(region)}`
                                )
                            )
                        )
                )
        )
    );
}

/**
 * Upload the template in the S3Bucket
 * @param bucketName S3 Bucket name to upload the template into
 * @param filename Name to give to the file in the Bucket
 * @param path Path to the file
 * @returns {Promise}
 */
function uploadTemplate(bucketName, filename, path) {
    return spinner(
        new Promise((resolve, reject) =>
            fs.stat(path, (error, stats) => {
                if (!stats) {
                    reject(new Error(`File ${chalk.bold(path)} not found`));
                }
                const upload = s3.upload(
                    {
                        Bucket: bucketName,
                        Key: filename,
                        Body: fs.createReadStream(path)
                    },
                    {
                        partSize: Math.max(stats.size, S3_MIN_PART_SIZE),
                        queueSize: 1
                    }
                );
                let bar;
                upload.on('httpUploadProgress', evt => {
                    if (!bar && evt.total) {
                        const total = evt.total / 1000000;
                        bar = new ProgressBar('uploading [:bar] :percent :etas', {
                            complete: '=',
                            incomplete: ' ',
                            width: 20,
                            total,
                            clear: true
                        });
                    }

                    const curr = evt.loaded / 1000000;
                    bar.tick(curr - bar.curr);
                });
                return upload
                    .promise()
                    .then(resolve)
                    .catch(reject);
            })
        )
    );
}

/**
 * Sanitize the bucketName following the rule found here:
 * http://docs.aws.amazon.com/awscloudtrail/latest/userguide/cloudtrail-s3-bucket-naming-requirements.html
 * @param bucketName
 * @returns {string}
 */
function sanitizeBucketName(bucketName) {
    return _(bucketName)
        .split('.')
        .filter(e => e)
        .map(_.toLower)
        .map(e => _.replace(e, '_', '-'))
        .join('.');
}
