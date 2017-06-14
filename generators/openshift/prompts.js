const _ = require('lodash');
const dockerComposePrompts = require('../docker-compose/prompts');

module.exports = _.extend({
    askForOpenShiftNamespace,
    askForStorageType,
    askForDockerRepositoryName,
    askForDockerPushCommand
}, dockerComposePrompts);

function askForOpenShiftNamespace() {
    const done = this.async();

    const prompts = [{
        type: 'input',
        name: 'openshiftNamespace',
        message: 'What should we use for the OpenShift namespace?',
        default: this.openshiftNamespace ? this.openshiftNamespace : 'default'
    }];

    this.prompt(prompts).then((props) => {
        this.openshiftNamespace = props.openshiftNamespace;
        done();
    });
}

function askForStorageType() {
    const done = this.async();

    let storageEnabled = false;
    this.appConfigs.some((appConfig, index) => {
        if (appConfig.prodDatabaseType !== 'no' || appConfig.searchEngine === 'elasticsearch' || appConfig.monitoring === 'elk' || appConfig.monitoring === 'prometheus') {
            storageEnabled = true;
            return storageEnabled;
        }
        return false;
    });

    if (storageEnabled === false) {
        done();
        return;
    }

    // prompt this only when prodDatabaseType != 'no' for any of the chosen apps
    const prompts = [{
        type: 'list',
        name: 'storageType',
        message: 'Which *type* of database storage would you like to use?',
        choices: [
            {
                value: 'persistent',
                name: 'Persistent Storage'
            },
            {
                value: 'ephemeral',
                name: 'Ephemeral Storage'
            }
        ],
        default: 'ephemeral'
    }];

    this.prompt(prompts).then((props) => {
        this.storageType = props.storageType;
        done();
    });
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
