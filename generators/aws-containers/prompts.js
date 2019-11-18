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
const _ = require('lodash');
const chalk = require('chalk');
const databaseTypes = require('jhipster-core').JHipsterDatabaseTypes;

const AURORA_DB_PASSWORD_REGEX = /^[^@"/]{8,42}$/;
const CLOUDFORMATION_STACK_NAME = /[a-zA-Z][-a-zA-Z0-9]*/;

const SCALING_TO_CONFIG = {
    low: {
        fargate: {
            taskCount: 1
        },
        database: {
            instances: 1
        }
    },
    medium: {
        fargate: {
            taskCount: 2
        },
        database: {
            instances: 1
        }
    },
    high: {
        fargate: {
            taskCount: 4
        },
        database: {
            instances: 2
        }
    }
};
const PERF_TO_CONFIG = {
    low: {
        fargate: {
            CPU: '1024',
            memory: '2GB'
        },
        database: {
            size: 'db.t2.small',
            supportedEngines: [databaseTypes.MARIADB, databaseTypes.MYSQL]
        }
    },
    medium: {
        fargate: {
            CPU: '2048',
            memory: '4GB'
        },
        database: {
            size: 'db.t2.medium',
            supportedEngines: [databaseTypes.MARIADB, databaseTypes.MYSQL]
        }
    },
    high: {
        fargate: {
            CPU: '4096',
            memory: '16GB'
        },
        database: {
            size: 'db.r4.large',
            supportedEngines: [databaseTypes.MARIADB, databaseTypes.MYSQL, databaseTypes.POSTGRESQL]
        }
    }
};

let regionList;

/*
 * All the prompting is made through Inquirer.js. Documentation here:
 * https://github.com/SBoudrias/Inquirer.js/
 * Use the dummy question as an example.
 */
module.exports = {
    setRegionList,
    askTypeOfApplication,
    askRegion,
    askCloudFormation,
    askPerformances,
    askScaling,
    askVPC,
    askForDBPasswords,
    askForSubnets,
    promptEKSClusterCreation,
    askDeployNow
};

function setRegionList(regions) {
    regionList = regions;
}

function _getFriendlyNameFromTag(awsObject) {
    return _.get(_(awsObject.Tags).find({ Key: 'Name' }), 'Value');
}

/**
 * Ask user what type of application is to be created?
 */
function askTypeOfApplication() {
    if (this.abort) return null;
    const done = this.async();

    const prompts = [
        {
            type: 'list',
            name: 'applicationType',
            message: 'Which *type* of application would you like to deploy?',
            choices: [
                {
                    value: 'monolith',
                    name: 'Monolithic application'
                },
                {
                    value: 'microservice',
                    name: 'Microservice application'
                }
            ],
            default: 'monolith'
        }
    ];

    return this.prompt(prompts).then(props => {
        const applicationType = props.applicationType;
        this.deploymentApplicationType = props.applicationType;
        if (applicationType) {
            this.log(applicationType);
            done();
        } else {
            this.abort = true;
            done();
        }
    });
}

/**
 * Ask user what type of Region is to be created?
 */
function askRegion() {
    if (this.abort) return null;
    const done = this.async();
    const prompts = [
        {
            type: 'list',
            name: 'region',
            message: 'Which region?',
            choices: regionList,
            default: this.aws.region ? _.indexOf(regionList, this.aws.region) : this.awsFacts.defaultRegion
        }
    ];

    return this.prompt(prompts).then(props => {
        const region = props.region;
        if (region) {
            this.aws.region = region;
            done();
        } else {
            this.abort = true;
            done();
        }
    });
}

/**
 * Ask user for CloudFormation name.
 */
function askCloudFormation() {
    if (this.abort) return null;
    const done = this.async();
    const prompts = [
        {
            type: 'input',
            name: 'cloudFormationName',
            message: "Please enter your stack's name. (must be unique within a region)",
            default: this.aws.cloudFormationName || this.baseName,
            validate: input => {
                if (_.isEmpty(input) || !input.match(CLOUDFORMATION_STACK_NAME)) {
                    return 'Stack name must contain letters, digits, or hyphens ';
                }
                return true;
            }
        }
    ];

    return this.prompt(prompts).then(props => {
        const cloudFormationName = props.cloudFormationName;
        if (cloudFormationName) {
            this.aws.cloudFormationName = cloudFormationName;
            while (this.aws.cloudFormationName.includes('_')) {
                this.aws.cloudFormationName = _.replace(this.aws.cloudFormationName, '_', '');
            }
            this.log(`CloudFormation Stack name will be ${this.aws.cloudFormationName}`);
            done();
        } else {
            this.abort = true;
            done();
        }
    });
}

/**
 * As user to select AWS performance.
 */
function askPerformances() {
    if (this.abort || this.deploymentApplicationType === 'microservice') return null;
    const done = this.async();
    const chainPromises = index => {
        if (index === this.appConfigs.length) {
            done();
            return null;
        }
        const config = this.appConfigs[index];
        const awsConfig = this.aws.apps.find(a => a.baseName === config.baseName) || { baseName: config.baseName };
        return promptPerformance.call(this, config, awsConfig).then(performance => {
            awsConfig.performance = performance;

            awsConfig.fargate = { ...awsConfig.fargate, ...PERF_TO_CONFIG[performance].fargate };
            awsConfig.database = { ...awsConfig.database, ...PERF_TO_CONFIG[performance].database };

            _.remove(this.aws.apps, a => _.isEqual(a, awsConfig));
            this.aws.apps.push(awsConfig);
            return chainPromises(index + 1);
        });
    };

    return chainPromises(0);
}

function promptPerformance(config, awsConfig = { performance: 'low' }) {
    if (this.abort) return null;

    const prodDatabaseType = config.prodDatabaseType;

    if (prodDatabaseType === databaseTypes.postgresql) {
        this.log(' ⚠️ Postgresql databases are currently only supported by Aurora on high-performance database instances');
    }

    const performanceLevels = _(PERF_TO_CONFIG)
        .keys()
        .map(key => {
            const perf = PERF_TO_CONFIG[key];
            const isEngineSupported = perf.database.supportedEngines.includes(prodDatabaseType);
            if (isEngineSupported) {
                return {
                    name: `${_.startCase(key)} Performance \t ${chalk.green(
                        `Task: ${perf.fargate.CPU} CPU Units, ${perf.fargate.memory} Ram`
                    )}\t ${chalk.yellow(`DB: Size: ${perf.database.size}`)}`,
                    value: key,
                    short: key
                };
            }
            return null;
        })
        .compact()
        .value();
    const prompts = [
        {
            type: 'list',
            name: 'performance',
            message: `${chalk.red(config.baseName)} Please select your performance level`,
            choices: performanceLevels,
            default: awsConfig.performance
        }
    ];

    return this.prompt(prompts).then(props => {
        const performance = props.performance;
        return performance;
    });
}

/**
 * Ask about scaling
 */
function askScaling() {
    if (this.abort || this.deploymentApplicationType === 'microservice') return null;
    const done = this.async();
    const chainPromises = index => {
        if (index === this.appConfigs.length) {
            done();
            return null;
        }
        const config = this.appConfigs[index];
        const awsConfig = this.aws.apps.find(a => a.baseName === config.baseName) || { baseName: config.baseName };
        return promptScaling.call(this, config, awsConfig).then(scaling => {
            awsConfig.scaling = scaling;
            awsConfig.fargate = { ...awsConfig.fargate, ...SCALING_TO_CONFIG[scaling].fargate };
            awsConfig.database = { ...awsConfig.database, ...SCALING_TO_CONFIG[scaling].database };

            _.remove(this.aws.apps, a => _.isEqual(a, awsConfig));
            this.aws.apps.push(awsConfig);
            return chainPromises(index + 1);
        });
    };

    return chainPromises(0);
}

function promptScaling(config, awsConfig = { scaling: 'low' }) {
    if (this.abort) return null;

    const scalingLevels = _(SCALING_TO_CONFIG)
        .keys()
        .map(key => {
            const scale = SCALING_TO_CONFIG[key];
            return {
                name: `${chalk.green(`${_.startCase(key)} Scaling \t\t Number of Tasks: ${scale.fargate.taskCount}`)}\t ${chalk.yellow(
                    `DB Instances: ${scale.database.instances}`
                )}`,
                value: key,
                short: key
            };
        })
        .value();
    const prompts = [
        {
            type: 'list',
            name: 'scaling',
            message: `${chalk.red(config.baseName)} Please select your scaling level`,
            choices: scalingLevels,
            default: awsConfig.scaling
        }
    ];

    return this.prompt(prompts).then(props => props.scaling);
}

/**
 * Ask user to select target Virtual Private Network
 */
function askVPC() {
    if (this.abort) return null;
    const done = this.async();

    const vpcList = this.awsFacts.availableVpcs.map(vpc => {
        const friendlyName = _getFriendlyNameFromTag(vpc);
        return {
            name: `ID: ${vpc.VpcId} (${friendlyName ? `name: '${friendlyName}', ` : ''}default: ${vpc.IsDefault}, state: ${vpc.State})`,
            value: vpc.VpcId,
            short: vpc.VpcId
        };
    });

    const prompts = [
        {
            type: 'list',
            name: 'targetVPC',
            message: 'Please select your target Virtual Private Network.',
            choices: vpcList,
            default: this.aws.vpc.id
        }
    ];

    return this.prompt(prompts).then(props => {
        const targetVPC = props.targetVPC;
        if (targetVPC) {
            this.aws.vpc.id = targetVPC;
            this.aws.vpc.cidr = _.find(this.awsFacts.availableVpcs, ['VpcId', targetVPC]).CidrBlock;
            done();
        } else {
            this.abort = true;
            done();
        }
    });
}

/**
 * Ask user to select availability information (availability, zones)/
 */
function askForSubnets() {
    if (this.abort) return null;
    const done = this.async();

    const subnetList = _.map(this.awsFacts.availableSubnets, sn => {
        const friendlyName = _getFriendlyNameFromTag(sn);
        const formattedFriendlyName = friendlyName ? `name: '${friendlyName}', ` : '';
        return {
            name: `${sn.SubnetId} (${formattedFriendlyName}Availability Zone: ${sn.AvailabilityZone}, Public IP On Launch: ${
                sn.MapPublicIpOnLaunch ? 'yes' : 'no'
            })`,
            value: sn.SubnetId,
            short: sn.SubnetId
        };
    });

    const defaultSubnetValue = storedSubnetValue =>
        storedSubnetValue || [_.get(this.awsFacts.availableSubnets, '[0].SubnetId'), _.get(this.awsFacts.availableSubnets, '[1].SubnetId')];
    const validateSubnet = input =>
        _.isEmpty(input) || (_.isArray(input) && input.length < 2) ? 'You must select two or more subnets' : true;

    const prompts = [
        {
            type: 'checkbox',
            name: 'elbSubnets',
            message: `Which subnets should we deploy the ${chalk.yellow('Network Load Balancer (ELB)')} to?`,
            choices: subnetList,
            default: defaultSubnetValue(this.aws.vpc.elbSubnets),
            validate: validateSubnet
        },
        {
            type: 'checkbox',
            name: 'appSubnets',
            message: `Which subnets should we deploy the ${chalk.yellow('Application & Database')} to?`,
            choices: subnetList,
            default: defaultSubnetValue(this.aws.vpc.appSubnets),
            validate: validateSubnet
        }
    ];

    return this.prompt(prompts).then(props => {
        const publicIpOnLaunchArray = appSubnets =>
            _.chain(this.awsFacts.availableSubnets)
                .filter(availableSubnet => _.includes(appSubnets, availableSubnet.SubnetId))
                .map('MapPublicIpOnLaunch')
                .uniq()
                .value();

        const uniqueIPLaunch = publicIpOnLaunchArray(props.appSubnets);
        const shouldAppHavePublicIP = _.head(uniqueIPLaunch);
        if (uniqueIPLaunch.length !== 1) {
            this.log.ok(
                `⚠️ Mix of Application Subnets containing contradictory 'MapPublic Ip On Launch' values. Defaulting to '${
                    shouldAppHavePublicIP ? 'yes' : 'no'
                }'`
            );
        }

        this.aws.vpc.elbSubnets = props.elbSubnets;
        this.aws.vpc.appSubnets = props.appSubnets;
        this.aws.vpc.appSubnetsLaunchWithPublicIP = shouldAppHavePublicIP;
        done();
    });
}

function askForDBPasswords() {
    if (this.abort) return null;
    const done = this.async();
    const chainPromises = index => {
        if (index === this.appConfigs.length) {
            done();
            return null;
        }
        const config = this.appConfigs[index];
        const appConfig = this.awsFacts.apps.find(a => a.baseName === config.baseName) || { baseName: config.baseName };
        return promptDBPassword.call(this, appConfig).then(password => {
            appConfig.database_Password = password;
            _.remove(this.awsFacts.apps, a => _.isEqual(a, appConfig));
            this.awsFacts.apps.push(appConfig);
            return chainPromises(index + 1);
        });
    };

    return chainPromises(0);
}

function promptDBPassword(config) {
    if (config.database_Password_InSSM) return new Promise(resolve => resolve(config.database_Password));

    const prompts = [
        {
            type: 'password',
            name: 'database_Password',
            message: `${chalk.red(config.baseName)} Please enter the password for the database. ${chalk.yellow(
                'This value will be stored within Amazon SSM, and not within .yo-rc.json'
            )}`,
            validate: input =>
                _.isEmpty(input) || !input.match(AURORA_DB_PASSWORD_REGEX)
                    ? 'Password must be between 8 - 42 characters, and not contain a """, "/" or "@"'
                    : true
        }
    ];

    return this.prompt(prompts).then(props => props.database_Password);
}

/**
 * Create EKS stack for Micro-Services
 */
function promptEKSClusterCreation() {
    if (this.abort || this.deploymentApplicationType === 'monolith') return null;
    const done = this.async();
    const prompts = [
        {
            type: 'input',
            name: 'clusterName',
            message: 'Name of the EKS Cluster?',
            default: this.aws.clusterName || 'jhipster'
        },
        {
            type: 'list',
            name: 'kubernetesVersion',
            message: 'What Kubernetes version would you like to use?',
            choices: [
                {
                    value: '1.12',
                    name: '1.12'
                },
                {
                    value: '1.13',
                    name: '1.13'
                },
                {
                    value: '1.14',
                    name: '1.14'
                }
            ],
            default: this.aws.kubernetesVersion || 1
        },
        {
            type: 'input',
            name: 'nodegroupName',
            message: 'Name of the Node Group?',
            default: 'standard-workers'
        },
        {
            type: 'list',
            name: 'clusterRegion',
            message: 'On which region do you want to deploy?',
            choices: [
                'ap-northeast-1',
                'ap-northeast-2',
                'ap-south-1',
                'ap-southeast-1',
                'ap-southeast-2',
                'ca-central-1',
                'eu-central-1',
                'eu-north-1',
                'eu-west-1',
                'eu-west-2',
                'eu-west-3',
                'sa-east-1',
                'us-east-1',
                'us-east-2',
                'us-west-1',
                'us-west-2'
            ],
            default: this.aws.clusterRegion || 15
        },
        {
            type: 'input',
            name: 'totalNumberOfNodes',
            message: 'Total number of nodes (for a static ASG)?',
            default: this.aws.totalNumberOfNodes || '4',
            validate: input => {
                if (input.length === 0) {
                    return 'Instances cannot be empty';
                }
                const n = Math.floor(Number(input));
                if (n === Infinity || String(n) !== input || n <= 0) {
                    return 'Please enter an integer greater than 0';
                }
                return true;
            }
        }
    ];

    return this.prompt(prompts).then(props => {
        this.clusterName = props.clusterName;
        this.aws.clusterName = props.clusterName;
        this.kubernetesVersion = props.kubernetesVersion;
        this.aws.kubernetesVersion = props.kubernetesVersion;
        this.nodegroupName = props.nodegroupName;
        this.aws.nodegroupName = props.nodegroupName;
        this.clusterRegion = props.clusterRegion;
        this.aws.clusterRegion = props.clusterRegion;
        this.totalNumberOfNodes = props.totalNumberOfNodes;
        this.aws.totalNumberOfNodes = props.totalNumberOfNodes;
        done();
    });
}

/**
 * Ask user if they would like to deploy now?
 */
function askDeployNow() {
    if (this.abort) return null;
    const done = this.async();
    const prompts = [
        {
            type: 'confirm',
            name: 'deployNow',
            message: 'Would you like to deploy now?.',
            default: true
        }
    ];

    return this.prompt(prompts).then(props => {
        this.deployNow = props.deployNow;
        done();
    });
}
