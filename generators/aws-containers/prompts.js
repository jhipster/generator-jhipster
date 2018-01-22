const _ = require('lodash');
const chalk = require('chalk');

const AURORA_DB_PASSORD_REGEX = /^[^@"\/]{8,42}$/; // eslint-disable-line
const PERF_TO_CONFIG = {
    low: {
        fargate: {
            taskCount: 1,
            CPU: '1024',
            memory: '2GB'
        },
        database: {
            instances: 1,
            size: 'db.t2.small'
        }
    },
    medium: {
        fargate: {
            taskCount: 2,
            CPU: '2048',
            memory: '4GB'
        },
        database: {
            instances: 1,
            size: 'db.t2.medium'
        }
    },
    high: {
        fargate: {
            taskCount: 4,
            CPU: '4096',
            memory: '16GB'
        },
        database: {
            instances: 2,
            size: 'db.r4.large'
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
    askVPC,
    askForDBPasswords,
    askForSubnets,
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

    const prompts = [{
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
    }];

    return this.prompt(prompts).then((props) => {
        const applicationType = props.applicationType;
        this.composeApplicationType = props.applicationType;
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
            default: (this.aws.region) ? _.indexOf(regionList, this.aws.region) : this.awsFacts.defaultRegion
        }
    ];

    return this.prompt(prompts).then((props) => {
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
            message: 'Please enter your stack\'s name. (must be unique within a region)',
            default: this.aws.cloudFormationName || this.baseName,
            validate: (input) => {
                if (input) {
                    return true;
                }

                return 'Stack\'s name cannot be empty!';
            }
        }
    ];

    return this.prompt(prompts).then((props) => {
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
    if (this.abort) return null;
    const done = this.async();
    const chainPromises = (index) => {
        if (index === this.appConfigs.length) {
            done();
            return null;
        }
        const config = this.appConfigs[index];
        const awsConfig = this.aws.apps.find(a => a.baseName === config.baseName) || { baseName: config.baseName };
        return promptPerformance.call(this, config, awsConfig).then((performance) => {
            awsConfig.performance = performance;
            awsConfig.fargate = PERF_TO_CONFIG[performance].fargate;
            awsConfig.database = PERF_TO_CONFIG[performance].database;

            _.remove(this.aws.apps, a => _.isEqual(a, awsConfig));
            this.aws.apps.push(awsConfig);
            return chainPromises(index + 1);
        });
    };

    return chainPromises(0);
}

function promptPerformance(config, awsConfig = { performance: 'low' }) {
    if (this.abort) return null;

    const performanceLevels = _.keys(PERF_TO_CONFIG)
        .map((key) => {
            const perf = PERF_TO_CONFIG[key];
            return {
                name: `${_.startCase(key)} Performance \t ${chalk.green(`Task: ${perf.fargate.CPU} CPU Units, ${perf.fargate.memory} Ram, Count: ${perf.fargate.taskCount}`)}\t ${chalk.yellow(`DB: ${perf.database.instances} Instance, Size: ${perf.database.size}`)}`,
                value: key,
                short: key
            };
        });

    const prompts = [
        {
            type: 'list',
            name: 'performance',
            message: `${chalk.red(config.baseName)} Please select your performance.`,
            choices: performanceLevels,
            default: awsConfig.performance,
            validate: (input) => {
                if (!input) {
                    return 'You Must choose at least one performance!';
                }
                if (input !== 'high' && config.prodDatabaseType === 'postgresql') {
                    return 'Aurora DB for postgresql is limited to the high performance configuration';
                }
                return true;
            }
        }
    ];

    return this.prompt(prompts).then((props) => {
        const performance = props.performance;
        return performance;
    });
}

/**
 * Ask user to select target Virtual Private Network
 */
function askVPC() {
    if (this.abort) return null;
    const done = this.async();

    const vpcList = this.awsFacts.availableVpcs.map((vpc) => {
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

    return this.prompt(prompts).then((props) => {
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

    const subnetList = _.map(this.awsFacts.availableSubnets, (sn) => {
        const friendlyName = _getFriendlyNameFromTag(sn);
        const formattedFriendlyName = friendlyName ? `name: '${friendlyName}', ` : '';
        return {
            name: `${sn.SubnetId} (${formattedFriendlyName}Availability Zone: ${sn.AvailabilityZone}, Public IP On Launch: ${sn.MapPublicIpOnLaunch ? 'yes' : 'no'})`,
            value: sn.SubnetId,
            short: sn.SubnetId
        };
    });

    const defaultSubnetValue = storedSubnetValue => storedSubnetValue || [_.get(this.awsFacts.availableSubnets, '[0].SubnetId'), _.get(this.awsFacts.availableSubnets, '[1].SubnetId')];
    const validateSubnet = input => (_.isEmpty(input) || (_.isArray(input) && input.length < 2) ? 'You must select two or more subnets' : true);

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
        },
    ];

    return this.prompt(prompts).then((props) => {
        const publicIpOnLaunchArray = appSubnets =>
            _.chain(this.awsFacts.availableSubnets)
                .filter(availableSubnet => _.includes(appSubnets, availableSubnet.SubnetId))
                .map('MapPublicIpOnLaunch')
                .uniq()
                .value();

        const uniqueIPLaunch = publicIpOnLaunchArray(props.appSubnets);
        const shouldAppHavePublicIP = _.head(uniqueIPLaunch);
        if (uniqueIPLaunch.length !== 1) {
            this.log.ok(`⚠️ Mix of Application Subnets containing contradictory 'MapPublic Ip On Launch' values. Defaulting to '${shouldAppHavePublicIP ? 'yes' : 'no'}'`);
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
    const chainPromises = (index) => {
        if (index === this.appConfigs.length) {
            done();
            return null;
        }
        const config = this.appConfigs[index];
        const appConfig = this.awsFacts.apps.find(a => a.baseName === config.baseName) || { baseName: config.baseName };
        return promptDBPassword.call(this, appConfig).then((password) => {
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
            message: `${chalk.red(config.baseName)} Please enter the password for the database. ${chalk.yellow('This value will be stored within Amazon SSM, and not within .yo-rc.json')}`,
            validate: input => ((_.isEmpty(input) || !input.match(AURORA_DB_PASSORD_REGEX)) ? 'Password must be between 8 - 42 characters, and not contain an """, "/" or "@"' : true)
        }
    ];

    return this.prompt(prompts).then(props => props.database_Password);
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

    return this.prompt(prompts).then((props) => {
        this.deployNow = props.deployNow;
        done();
    });
}
