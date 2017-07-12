/**
 * Copyright 2013-2017 the original author or authors from the JHipster project.
 *
 * This file is part of the JHipster project, see https://jhipster.github.io/
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
const chalk = require('chalk');
const shelljs = require('shelljs');

module.exports = {
    askForApplicationType,
    askForPath,
    askForApps,
    askForClustersMode,
    askForMonitoring,
    askForServiceDiscovery,
    askForAdminPassword,
    askForDockerRepositoryName,
    askForDockerPushCommand
};

function askForApplicationType() {
    const done = this.async();

    const prompts = [{
        type: 'list',
        name: 'composeApplicationType',
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

    this.prompt(prompts).then((props) => {
        this.composeApplicationType = props.composeApplicationType;
        done();
    });
}

function askForPath() {
    if (this.regenerate) return;

    const done = this.async();
    const composeApplicationType = this.composeApplicationType;
    let messageAskForPath;
    if (composeApplicationType === 'monolith') {
        messageAskForPath = 'Enter the root directory where your applications are located';
    } else {
        messageAskForPath = 'Enter the root directory where your gateway(s) and microservices are located';
    }
    const prompts = [{
        type: 'input',
        name: 'directoryPath',
        message: messageAskForPath,
        default: this.directoryPath || '../',
        validate: (input) => {
            const path = this.destinationPath(input);
            if (shelljs.test('-d', path)) {
                const appsFolders = getAppFolders.call(this, input, composeApplicationType);

                if (appsFolders.length === 0) {
                    return `No microservice or gateway found in ${path}`;
                }
                return true;
            }
            return `${path} is not a directory or doesn't exist`;
        }
    }];

    this.prompt(prompts).then((props) => {
        this.directoryPath = props.directoryPath;

        this.appsFolders = getAppFolders.call(this, this.directoryPath, composeApplicationType);

        // Removing registry from appsFolders, using reverse for loop
        for (let i = this.appsFolders.length - 1; i >= 0; i--) {
            if (this.appsFolders[i] === 'jhipster-registry' || this.appsFolders[i] === 'registry') {
                this.appsFolders.splice(i, 1);
            }
        }

        this.log(chalk.green(`${this.appsFolders.length} applications found at ${this.destinationPath(this.directoryPath)}\n`));

        done();
    });
}

function askForApps() {
    if (this.regenerate) return;

    const done = this.async();
    const messageAskForApps = 'Which applications do you want to include in your configuration?';

    const prompts = [{
        type: 'checkbox',
        name: 'chosenApps',
        message: messageAskForApps,
        choices: this.appsFolders,
        default: this.defaultAppsFolders,
        validate: input => (input.length === 0 ? 'Please choose at least one application' : true)
    }];

    this.prompt(prompts).then((props) => {
        this.appsFolders = props.chosenApps;

        this.appConfigs = [];
        this.gatewayNb = 0;
        this.monolithicNb = 0;
        this.microserviceNb = 0;

        // Loading configs
        this.appsFolders.forEach((appFolder) => {
            const path = this.destinationPath(`${this.directoryPath + appFolder}/.yo-rc.json`);
            const fileData = this.fs.readJSON(path);
            const config = fileData['generator-jhipster'];

            if (config.applicationType === 'monolith') {
                this.monolithicNb++;
            } else if (config.applicationType === 'gateway') {
                this.gatewayNb++;
            } else if (config.applicationType === 'microservice') {
                this.microserviceNb++;
            }

            this.portsToBind = this.monolithicNb + this.gatewayNb;
            this.appConfigs.push(config);
        });

        done();
    });
}

function askForClustersMode() {
    if (this.regenerate) return;

    const mongoApps = [];
    this.appConfigs.forEach((appConfig, index) => {
        if (appConfig.prodDatabaseType === 'mongodb') {
            mongoApps.push(this.appsFolders[index]);
        }
    });
    if (mongoApps.length === 0) return;

    const done = this.async();

    const prompts = [{
        type: 'checkbox',
        name: 'clusteredDbApps',
        message: 'Which applications do you want to use with clustered databases (only available with MongoDB)?',
        choices: mongoApps,
        default: this.clusteredDbApps
    }];

    this.prompt(prompts).then((props) => {
        this.clusteredDbApps = props.clusteredDbApps;
        for (let i = 0; i < this.appsFolders.length; i++) {
            for (let j = 0; j < props.clusteredDbApps.length; j++) {
                this.appConfigs[i].clusteredDb = this.appsFolders[i] === props.clusteredDbApps[j];
            }
        }

        done();
    });
}

function askForMonitoring() {
    if (this.regenerate) return;

    const done = this.async();

    const prompts = [{
        type: 'list',
        name: 'monitoring',
        message: 'Do you want to setup monitoring for your applications ?',
        choices: [
            {
                value: 'no',
                name: 'No'
            },
            {
                value: 'elk',
                name: (this.composeApplicationType === 'monolith') ? 'Yes, for logs and metrics with the JHipster Console (based on ELK)' : 'Yes, for logs and metrics with the JHipster Console (based on ELK and Zipkin)'
            },
            {
                value: 'prometheus',
                name: 'Yes, for metrics only with Prometheus (only compatible with JHipster >= v3.12)'
            }
        ],
        default: 'no'
    }];

    this.prompt(prompts).then((props) => {
        this.monitoring = props.monitoring;
        done();
    });
}

function askForServiceDiscovery() {
    if (this.regenerate) return;

    const done = this.async();

    const serviceDiscoveryEnabledApps = [];
    this.appConfigs.forEach((appConfig, index) => {
        if (appConfig.serviceDiscoveryType) {
            serviceDiscoveryEnabledApps.push({ baseName: appConfig.baseName, serviceDiscoveryType: appConfig.serviceDiscoveryType });
        }
    });

    if (serviceDiscoveryEnabledApps.length === 0) {
        this.serviceDiscoveryType = false;
        done();
        return;
    }

    if (serviceDiscoveryEnabledApps.every(app => app.serviceDiscoveryType === 'consul')) {
        this.serviceDiscoveryType = 'consul';
        this.log(chalk.green('Consul detected as the service discovery and configuration provider used by your apps'));
        done();
    } else if (serviceDiscoveryEnabledApps.every(app => app.serviceDiscoveryType === 'eureka')) {
        this.serviceDiscoveryType = 'eureka';
        this.log(chalk.green('JHipster registry detected as the service discovery and configuration provider used by your apps'));
        done();
    } else {
        this.log(chalk.yellow('Unable to determine the service discovery and configuration provider to use from your apps configuration.'));
        this.log('Your service discovery enabled apps:');
        serviceDiscoveryEnabledApps.forEach((app) => {
            this.log(` -${app.baseName} (${app.serviceDiscoveryType})`);
        });

        const prompts = [{
            type: 'list',
            name: 'serviceDiscoveryType',
            message: 'Which Service Discovery registry and Configuration server would you like to use ?',
            choices: [
                {
                    value: 'eureka',
                    name: 'JHipster Registry'
                },
                {
                    value: 'consul',
                    name: 'Consul'
                },
                {
                    value: false,
                    name: 'No Service Discovery and Configuration'
                }
            ],
            default: 'eureka'
        }];

        this.prompt(prompts).then((props) => {
            this.serviceDiscoveryType = props.serviceDiscoveryType;
            done();
        });
    }
}

function askForAdminPassword() {
    if (this.regenerate || this.serviceDiscoveryType !== 'eureka') return;

    const done = this.async();

    const prompts = [{
        type: 'input',
        name: 'adminPassword',
        message: 'Enter the admin password used to secure the JHipster Registry',
        default: 'admin',
        validate: input => (input.length < 5 ? 'The password must have at least 5 characters' : true)
    }];

    this.prompt(prompts).then((props) => {
        this.adminPassword = props.adminPassword;
        this.adminPasswordBase64 = new Buffer(this.adminPassword).toString('base64');
        done();
    });
}

function getAppFolders(input, composeApplicationType) {
    const files = shelljs.ls('-l', this.destinationPath(input));
    const appsFolders = [];

    files.forEach((file) => {
        if (file.isDirectory()) {
            if ((shelljs.test('-f', `${input + file.name}/.yo-rc.json`))
                && (shelljs.test('-f', `${input + file.name}/src/main/docker/app.yml`))) {
                try {
                    const fileData = this.fs.readJSON(`${input + file.name}/.yo-rc.json`);
                    if ((fileData['generator-jhipster'].baseName !== undefined)
                        && ((composeApplicationType === undefined)
                            || (composeApplicationType === fileData['generator-jhipster'].applicationType)
                            || ((composeApplicationType === 'microservice') && (fileData['generator-jhipster'].applicationType === 'gateway'))
                            || ((composeApplicationType === 'microservice') && (fileData['generator-jhipster'].applicationType === 'uaa')))) {
                        appsFolders.push(file.name.match(/([^/]*)\/*$/)[1]);
                    }
                } catch (err) {
                    this.log(chalk.red(`${file}: this .yo-rc.json can't be read`));
                }
            }
        }
    });

    return appsFolders;
}

function askForDockerRepositoryName() {
    const done = this.async();

    const prompts = [{
        type: 'input',
        name: 'dockerRepositoryName',
        message: 'What should we use for the base Docker repository name?',
        default: this.dockerRepositoryName
    }];

    this.prompt(prompts).then((props) => {
        this.dockerRepositoryName = props.dockerRepositoryName;
        done();
    });
}

function askForDockerPushCommand() {
    const done = this.async();

    const prompts = [{
        type: 'input',
        name: 'dockerPushCommand',
        message: 'What command should we use for push Docker image to repository?',
        default: this.dockerPushCommand ? this.dockerPushCommand : 'docker push'
    }];

    this.prompt(prompts).then((props) => {
        this.dockerPushCommand = props.dockerPushCommand;
        done();
    });
}
