
const _ = require('lodash');
const dockerComposePrompts = require('../docker-compose/prompts');

module.exports = _.extend({
    askForDockerRepositoryName,
    askForDockerPushCommand,
    askForRancherLoadBalancing
}, dockerComposePrompts);

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

function askForRancherLoadBalancing() {
    const done = this.async();

    const prompts = [{
        type: 'confirm',
        name: 'enableRancherLoadBalancing',
        message: 'Would you like to enable rancher load balancing support?',
        default: false
    }];

    this.prompt(prompts).then((props) => {
        this.enableRancherLoadBalancing = props.enableRancherLoadBalancing;
        done();
    });
}
