'use strict';

var chalk = require('chalk');

module.exports = {
    askForInsightOptIn,
    askForApplicationType,
    askForModuleName,
    askFori18n,
    askForTestOpts
};

function askForInsightOptIn() {
    if (this.existingProject) return;

    var done = this.async();
    var insight = this.insight();

    this.prompt({
        when: function () {
            return insight.optOut === undefined;
        },
        type: 'confirm',
        name: 'insight',
        message: 'May ' + chalk.cyan('JHipster') + ' anonymously report usage statistics to improve the tool over time?',
        default: true
    }, function (prompt) {
        if (prompt.insight !== undefined) {
            insight.optOut = !prompt.insight;
        }
        done();
    }.bind(this));
}

function askForApplicationType() {
    if (this.existingProject) return;

    var done = this.async();
    var getNumberedQuestion = this.getNumberedQuestion.bind(this);

    this.prompt({
        type: 'list',
        name: 'applicationType',
        message: function (response) {
            return getNumberedQuestion('Which *type* of application would you like to create?', true);
        },
        choices: [
            {
                value: 'monolith',
                name: 'Monolithic application (recommended for simple projects)'
            },
            {
                value: 'microservice',
                name: 'Microservice application'
            },
            {
                value: 'gateway',
                name: 'Microservice gateway'
            },
            {
                value: 'uaa',
                name: '[BETA] JHipster UAA server (for microservice OAuth2 authentication)'
            }
        ],
        default: 'monolith'
    }, function (prompt) {
        this.applicationType = this.configOptions.applicationType = prompt.applicationType;
        done();
    }.bind(this));
}

function askForModuleName() {
    if (this.existingProject) return;

    this.askModuleName(this);
    this.configOptions.lastQuestion = this.currentQuestion;
    this.configOptions.totalQuestions = this.totalQuestions;
}

function askFori18n() {
    this.currentQuestion = this.configOptions.lastQuestion;
    this.totalQuestions = this.configOptions.totalQuestions;
    if (this.skipI18n || this.existingProject) return;
    this.aski18n(this);
}

function askForTestOpts() {
    if (this.existingProject) return;

    var getNumberedQuestion = this.getNumberedQuestion.bind(this);
    var choices = [];
    if (!this.skipServer) {
        // all server side test frameworks should be addded here
        choices.push(
            {name: 'Gatling', value: 'gatling'},
            {name: 'Cucumber', value: 'cucumber'}
        );
    }
    if (!this.skipClient) {
        // all client side test frameworks should be addded here
        choices.push(
            {name: 'Protractor', value: 'protractor'}
        );
    }
    var done = this.async();

    this.prompt({
        type: 'checkbox',
        name: 'testFrameworks',
        message: function (response) {
            return getNumberedQuestion('Which testing frameworks would you like to use?', true);
        },
        choices: choices,
        default: ['gatling']
    }, function (prompt) {
        this.testFrameworks = prompt.testFrameworks;
        done();
    }.bind(this));
}
