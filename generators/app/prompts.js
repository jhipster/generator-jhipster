const chalk = require('chalk');

module.exports = {
    askForInsightOptIn,
    askForApplicationType,
    askForModuleName,
    askFori18n,
    askForTestOpts,
    askForMoreModules
};

function askForInsightOptIn() {
    if (this.existingProject) return;

    const done = this.async();
    const insight = this.insight();

    this.prompt({
        when: () => insight.optOut === undefined,
        type: 'confirm',
        name: 'insight',
        message: `May ${chalk.cyan('JHipster')} anonymously report usage statistics to improve the tool over time?`,
        default: true
    }).then((prompt) => {
        if (prompt.insight !== undefined) {
            insight.optOut = !prompt.insight;
        }
        done();
    });
}

function askForApplicationType() {
    if (this.existingProject) return;

    const DEFAULT_APPTYPE = 'monolith';
    if (this.skipServer) {
        this.applicationType = this.configOptions.applicationType = DEFAULT_APPTYPE;
        return;
    }

    const done = this.async();

    this.prompt({
        type: 'list',
        name: 'applicationType',
        message: response => this.getNumberedQuestion('Which *type* of application would you like to create?', true),
        choices: [
            {
                value: DEFAULT_APPTYPE,
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
        default: DEFAULT_APPTYPE
    }).then((prompt) => {
        this.applicationType = this.configOptions.applicationType = prompt.applicationType;
        done();
    });
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

    const choices = [];
    const defaultChoice = [];
    if (!this.skipServer) {
        // all server side test frameworks should be added here
        choices.push(
            { name: 'Gatling', value: 'gatling' },
            { name: 'Cucumber', value: 'cucumber' }
        );
    }
    if (!this.skipClient) {
        // all client side test frameworks should be added here
        choices.push(
            { name: 'Protractor', value: 'protractor' }
        );
    }
    const done = this.async();

    this.prompt({
        type: 'checkbox',
        name: 'testFrameworks',
        message: response => this.getNumberedQuestion('Besides JUnit and Karma, which testing frameworks would you like to use?', true),
        choices,
        default: defaultChoice
    }).then((prompt) => {
        this.testFrameworks = prompt.testFrameworks;
        done();
    });
}

function askForMoreModules() {
    if (this.existingProject) {
        return;
    }

    const done = this.async();
    this.prompt({
        type: 'confirm',
        name: 'installModules',
        message: response => this.getNumberedQuestion('Would you like to install other generators from the JHipster Marketplace?', true),
        default: false
    }).then((prompt) => {
        if (prompt.installModules) {
            askModulesToBeInstalled(done, this);
        } else {
            done();
        }
    });
}

function askModulesToBeInstalled(done, generator) {
    generator.httpsGet('https://api.npms.io/v2/search?q=keywords:jhipster-module&from=0&size=50', (body) => {
        const moduleResponse = JSON.parse(body);
        const choices = [];
        moduleResponse.results.forEach((modDef) => {
            choices.push({
                value: { name: modDef.package.name, version: modDef.package.version },
                name: `(${modDef.package.name}-${modDef.package.version}) ${modDef.package.description} [${modDef.package.author.name}]`
            });
        });
        if (choices.length > 0) {
            generator.prompt({
                type: 'checkbox',
                name: 'otherModules',
                message: 'Which other modules would you like to use?',
                choices,
                default: []
            }).then((prompt) => {
                // [ {name: [moduleName], version:[version]}, ...]
                generator.otherModules = [];
                prompt.otherModules.forEach((module) => {
                    generator.otherModules.push({ name: module.name, version: module.version });
                });
                generator.configOptions.otherModules = generator.otherModules;
                done();
            });
        } else {
            done();
        }
    }, (error) => {
        generator.warning(`Unable to contact server to fetch additional modules: ${error.message}`);
        done();
    });
}
