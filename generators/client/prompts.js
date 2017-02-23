'use strict';

module.exports = {
    askForModuleName,
    askForClient,
    askForClientSideOpts,
    askFori18n
};

function askForModuleName() {

    if (this.baseName) return;

    this.askModuleName(this);
}

function askForClient() {
    if (this.existingProject) return;

    var done = this.async();
    var getNumberedQuestion = this.getNumberedQuestion.bind(this);
    var applicationType = this.applicationType;

    this.prompt({
        type: 'list',
        name: 'clientFramework',
        when: function (response) {
            return (applicationType !== 'microservice' && applicationType !== 'uaa');
        },
        message: function (response) {
            return getNumberedQuestion('Which *Framework* would you like to use for the client?', applicationType !== 'microservice' && applicationType !== 'uaa');
        },
        choices: [
            {
                value: 'angular1',
                name: 'AngularJS 1.x'
            },
            {
                value: 'angular2',
                name: '[BETA] Angular 2.x'
            }
        ],
        default: 'angular1'
    }).then(function (prompt) {
        this.clientFramework = prompt.clientFramework;
        done();
    }.bind(this));
}

function askForClientSideOpts() {
    if (this.existingProject) return;

    var done = this.async();
    var getNumberedQuestion = this.getNumberedQuestion.bind(this);
    var prompts = [
        {
            type: 'confirm',
            name: 'useSass',
            message: function (response) {
                return getNumberedQuestion('Would you like to use the LibSass stylesheet preprocessor for your CSS?', true);
            },
            default: false
        }
    ];
    this.prompt(prompts).then(function (props) {
        this.useSass = props.useSass;
        done();
    }.bind(this));
}

function askFori18n() {
    if (this.existingProject || this.configOptions.skipI18nQuestion) return;

    this.aski18n(this);
}
