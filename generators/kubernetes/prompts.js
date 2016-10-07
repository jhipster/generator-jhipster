'use strict';

var _ = require('lodash'),
    dockerComposePrompts = require('../docker-compose/prompts');

module.exports = _.extend({
    askForKubernetesNamespace,
    askForDockerRepositoryName,
    askForDockerPushCommand
}, dockerComposePrompts);

function askForKubernetesNamespace() {
    var done = this.async();

    var prompts = [{
        type: 'input',
        name: 'kubernetesNamespace',
        message: 'What should we use for the Kubernetes namespace?',
        default: this.kubernetesNamespace ? this.kubernetesNamespace : 'default'
    }];

    this.prompt(prompts).then(function(props) {
        this.kubernetesNamespace = props.kubernetesNamespace;
        done();
    }.bind(this));
}

function askForDockerRepositoryName() {
    var done = this.async();

    var prompts = [{
        type: 'input',
        name: 'dockerRepositoryName',
        message: 'What should we use for the base Docker repository name?',
        default: this.dockerRepositoryName
    }];

    this.prompt(prompts).then(function(props) {
        this.dockerRepositoryName = props.dockerRepositoryName;
        done();
    }.bind(this));
}

function askForDockerPushCommand() {
    var done = this.async();

    var prompts = [{
        type: 'input',
        name: 'dockerPushCommand',
        message: 'What command should we use for push Docker image to repository?',
        default: this.dockerPushCommand ? this.dockerPushCommand : 'docker push'
    }];

    this.prompt(prompts).then(function(props) {
        this.dockerPushCommand = props.dockerPushCommand;
        done();
    }.bind(this));
}
