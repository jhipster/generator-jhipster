'use strict';

var chalk = require('chalk');

var aws;
var uuid;


var Eb = module.exports = function Eb(Aws, generator) {
    aws = Aws;
    try {
        uuid = require('node-uuid');
    } catch (e) {
        generator.env.error(chalk.red(
            'You don\'t have the AWS SDK installed. Please install it in the JHipster generator directory.\n\n') +
            chalk.yellow('WINDOWS\n') +
            chalk.green('cd %USERPROFILE%\\AppData\\Roaming\\npm\\node_modules\\generator-jhipster\n' +
            'npm install aws-sdk progress node-uuid\n\n') +
            chalk.yellow('LINUX / MAC\n') +
            chalk.green('cd /usr/local/lib/node_modules/generator-jhipster\n' +
            'npm install aws-sdk progress node-uuid')
        );
    }
};

Eb.prototype.createApplication = function createApplication(params, callback) {
    var applicationName = params.applicationName,
        bucketName = params.bucketName,
        warKey = params.warKey,
        versionLabel = this.warKey + '-' + uuid.v4(),
        environmentName = params.environmentName,
        dbUrl = params.dbUrl,
        dbUsername = params.dbUsername,
        dbPassword = params.dbPassword,
        instanceType = params.instanceType;

    var applicationParams = {
        applicationName: applicationName,
        versionLabel: versionLabel,
        bucketName: bucketName,
        warKey: warKey
    };

    createApplicationVersion(applicationParams, function (err) {
        if (err) {
            callback({message: err.message}, null);
        } else {
            var environmentParams = {
                applicationName: applicationName,
                environmentName: environmentName,
                versionLabel: versionLabel,
                dbUrl: dbUrl,
                dbUsername: dbUsername,
                dbPassword: dbPassword,
                instanceType: instanceType
            };

            checkEnvironment(environmentParams, function (err, data) {
                if (err) {
                    callback({message: err.message}, null);
                } else {
                    if (data.environmentExists) {
                        updateEnvironment(environmentParams, function (err, data) {
                            if (err) {
                                callback({message: err.message}, null);
                            } else {
                                callback(null, {message: data.message});
                            }
                        });
                    } else {
                        createEnvironment(environmentParams, function (err, data) {
                            if (err) {
                                callback({message: err.message}, null);
                            } else {
                                callback(null, {message: data.message});
                            }
                        });
                    }
                }
            });
        }
    });
};

function createApplicationVersion(params, callback) {
    var applicationName = params.applicationName,
        versionLabel = params.versionLabel,
        bucketName = params.bucketName,
        warKey = params.warKey;

    var elasticbeanstalk = new aws.ElasticBeanstalk();

    var applicationParams = {
        ApplicationName: applicationName,
        VersionLabel: versionLabel,
        AutoCreateApplication: true,
        SourceBundle: {
            S3Bucket: bucketName,
            S3Key: warKey
        }
    };

    elasticbeanstalk.createApplicationVersion(applicationParams, function (err) {
        if (err) {
            callback(err, null);
        } else {
            callback(null, {message: 'Application version ' + applicationName + ' created successful'});
        }
    });
}

function checkEnvironment(params, callback) {
    var applicationName = params.applicationName,
        environmentName = params.environmentName;

    var elasticbeanstalk = new aws.ElasticBeanstalk();

    var environmentParams = {
        ApplicationName: applicationName,
        EnvironmentNames: [environmentName]
    };

    elasticbeanstalk.describeEnvironments(environmentParams, function (err, data) {
        if (data.Environments.length === 0) {
            callback(null, {message: 'Environment ' + environmentName + ' not exists', environmentExists: false});
        } else if (err) {
            callback(err, null);
        } else {
            callback(null, {message: 'Environment ' + environmentName + ' already exists', environmentExists: true});
        }
    });

}

function createEnvironment(params, callback) {
    var applicationName = params.applicationName,
        environmentName = params.environmentName,
        dbUrl = params.dbUrl,
        dbUsername = params.dbUsername,
        dbPassword = params.dbPassword,
        instanceType = params.instanceType,
        versionLabel = params.versionLabel;

    var elasticbeanstalk = new aws.ElasticBeanstalk();

    getLatestSolutionStackName(function (err, data) {
        if (err) callback(err, null);

        var solutionStackName = data.solutionStackName,
            environmentParams = {
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

        elasticbeanstalk.createEnvironment(environmentParams, function (err) {
            if (err) callback(err, null);
            else callback(null, {message: 'Environment ' + environmentName + ' created successful'});
        });
    });
}

function getLatestSolutionStackName(callback) {
    var elasticbeanstalk = new aws.ElasticBeanstalk();

    elasticbeanstalk.listAvailableSolutionStacks(function (err, data) {
        if (err) callback(err, null);
        filterSolutionStackNames(data, callback);
    });

    function filterSolutionStackNames(data, callback) {
        var filteredArray = data.SolutionStacks.filter(filterCriteria);
        callback(null, {solutionStackName: filteredArray[0]});
    }

    function filterCriteria(element) {
        return element.indexOf('Tomcat 8') > -1;
    }
}

function updateEnvironment(params, callback) {
    var environmentName = params.environmentName,
        instanceType = params.instanceType,
        versionLabel = params.versionLabel;

    var elasticbeanstalk = new aws.ElasticBeanstalk();

    var environmentParams = {
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

    elasticbeanstalk.updateEnvironment(environmentParams, function (err) {
        if (err) {
            callback(err, null);
        } else {
            callback(null, {message: 'Environment ' + environmentName + ' updated successful'});
        }
    });
}
