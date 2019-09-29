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
let aws;
let uuidV4;

const Eb = (module.exports = function Eb(Aws, generator) {
    aws = Aws;
    try {
        uuidV4 = require('uuid/v4'); // eslint-disable-line
    } catch (e) {
        generator.error(`Something went wrong while running jhipster:aws:\n${e}`);
    }
});

Eb.prototype.createApplication = function createApplication(params, callback) {
    const applicationName = params.applicationName;
    const bucketName = params.bucketName;
    const warKey = params.warKey;
    const versionLabel = `${this.warKey}-${uuidV4()}`;
    const environmentName = params.environmentName;
    const dbUrl = params.dbUrl;
    const dbUsername = params.dbUsername;
    const dbPassword = params.dbPassword;
    const instanceType = params.instanceType;

    const applicationParams = {
        applicationName,
        versionLabel,
        bucketName,
        warKey
    };

    createApplicationVersion(applicationParams, err => {
        if (err) {
            callback({ message: err.message }, null);
        } else {
            const environmentParams = {
                applicationName,
                environmentName,
                versionLabel,
                dbUrl,
                dbUsername,
                dbPassword,
                instanceType
            };

            checkEnvironment(environmentParams, (err, data) => {
                if (err) {
                    callback({ message: err.message }, null);
                } else if (data.environmentExists) {
                    updateEnvironment(environmentParams, (err, data) => {
                        if (err) {
                            callback({ message: err.message }, null);
                        } else {
                            callback(null, { message: data.message });
                        }
                    });
                } else {
                    createEnvironment(environmentParams, (err, data) => {
                        if (err) {
                            callback({ message: err.message }, null);
                        } else {
                            callback(null, { message: data.message });
                        }
                    });
                }
            });
        }
    });
};

function createApplicationVersion(params, callback) {
    const applicationName = params.applicationName;
    const versionLabel = params.versionLabel;
    const bucketName = params.bucketName;
    const warKey = params.warKey;

    const elasticbeanstalk = new aws.ElasticBeanstalk();

    const applicationParams = {
        ApplicationName: applicationName,
        VersionLabel: versionLabel,
        AutoCreateApplication: true,
        SourceBundle: {
            S3Bucket: bucketName,
            S3Key: warKey
        }
    };

    elasticbeanstalk.createApplicationVersion(applicationParams, err => {
        if (err) {
            callback(err, null);
        } else {
            callback(null, { message: `Application version ${applicationName} created successfully` });
        }
    });
}

function checkEnvironment(params, callback) {
    const applicationName = params.applicationName;
    const environmentName = params.environmentName;

    const elasticbeanstalk = new aws.ElasticBeanstalk();

    const environmentParams = {
        ApplicationName: applicationName,
        EnvironmentNames: [environmentName]
    };

    elasticbeanstalk.describeEnvironments(environmentParams, (err, data) => {
        if (data.Environments.length === 0) {
            callback(null, { message: `Environment ${environmentName} not exists`, environmentExists: false });
        } else if (err) {
            callback(err, null);
        } else {
            callback(null, { message: `Environment ${environmentName} already exists`, environmentExists: true });
        }
    });
}

function createEnvironment(params, callback) {
    const applicationName = params.applicationName;
    const environmentName = params.environmentName;
    const dbUrl = params.dbUrl;
    const dbUsername = params.dbUsername;
    const dbPassword = params.dbPassword;
    const instanceType = params.instanceType;
    const versionLabel = params.versionLabel;

    const elasticbeanstalk = new aws.ElasticBeanstalk();

    getLatestSolutionStackName((err, data) => {
        if (err) callback(err, null);

        const solutionStackName = data.solutionStackName;
        const environmentParams = {
            ApplicationName: applicationName,
            EnvironmentName: environmentName,
            OptionSettings: [
                {
                    Namespace: 'aws:elasticbeanstalk:application:environment',
                    OptionName: 'spring.profiles.active',
                    Value: 'prod'
                },
                {
                    Namespace: 'aws:elasticbeanstalk:application:environment',
                    OptionName: 'spring.datasource.url',
                    Value: dbUrl
                },
                {
                    Namespace: 'aws:elasticbeanstalk:application:environment',
                    OptionName: 'spring.datasource.username',
                    Value: dbUsername
                },
                {
                    Namespace: 'aws:elasticbeanstalk:application:environment',
                    OptionName: 'spring.datasource.password',
                    Value: dbPassword
                },
                {
                    Namespace: 'aws:autoscaling:launchconfiguration',
                    OptionName: 'InstanceType',
                    Value: instanceType
                },
                {
                    Namespace: 'aws:autoscaling:launchconfiguration',
                    OptionName: 'IamInstanceProfile',
                    Value: 'aws-elasticbeanstalk-ec2-role'
                }
            ],
            SolutionStackName: solutionStackName,
            VersionLabel: versionLabel,
            Tier: {
                Name: 'WebServer',
                Type: 'Standard'
            }
        };

        elasticbeanstalk.createEnvironment(environmentParams, err => {
            if (err) callback(err, null);
            else callback(null, { message: `Environment ${environmentName} created successfully` });
        });
    });
}

function getLatestSolutionStackName(callback) {
    const elasticbeanstalk = new aws.ElasticBeanstalk();

    elasticbeanstalk.listAvailableSolutionStacks((err, data) => {
        if (err) callback(err, null);
        filterSolutionStackNames(data, callback);
    });

    function filterSolutionStackNames(data, callback) {
        const filteredArray = data.SolutionStacks.filter(filterCriteria);
        callback(null, { solutionStackName: filteredArray[0] });
    }

    function filterCriteria(element) {
        return element.includes('Tomcat 8');
    }
}

function updateEnvironment(params, callback) {
    const environmentName = params.environmentName;
    const instanceType = params.instanceType;
    const versionLabel = params.versionLabel;

    const elasticbeanstalk = new aws.ElasticBeanstalk();

    const environmentParams = {
        EnvironmentName: environmentName,
        OptionSettings: [
            {
                Namespace: 'aws:autoscaling:launchconfiguration',
                OptionName: 'InstanceType',
                Value: instanceType
            }
        ],
        VersionLabel: versionLabel
    };

    elasticbeanstalk.updateEnvironment(environmentParams, err => {
        if (err) {
            callback(err, null);
        } else {
            callback(null, { message: `Environment ${environmentName} updated successful` });
        }
    });
}
