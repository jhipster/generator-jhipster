'use strict';
var util = require('util'),
    chalk = require('chalk'),
    generators = require('yeoman-generator'),
    scriptBase = require('../generator-base');

var PipelineGenerator = generators.Base.extend({});

util.inherits(PipelineGenerator, scriptBase);

module.exports = PipelineGenerator.extend({
    constructor: function () {
        generators.Base.apply(this, arguments);
    },

    initializing: {
        sayHello: function() {
            this.log(chalk.white('[Beta] Welcome to the JHipster CI/CD Sub-Generator'));
        },
        getConfig: function () {
            this.skipClient = this.config.get('skipClient');
            this.clientPackageManager = this.config.get('clientPackageManager');
            this.buildTool = this.config.get('buildTool');
            this.herokuAppName = this.config.get('herokuAppName');
            this.clientFramework = this.config.get('clientFramework');
            this.testFrameworks = this.config.get('testFrameworks');
            this.abort = false;
            if(this.clientFramework === 'angular2') {
                this.log(chalk.red('Angular > 1 is currently not supported, exiting...'));
                this.abort = true;
            }
        }
    },

    prompting: {
        askPipelines: function () {
            if (this.abort) return;
            var done = this.async();
            var prompts = [
                {
                    type: 'checkbox',
                    name: 'pipelines',
                    message: 'What CI/CD pipeline do you want to generate ?',
                    default: [],
                    choices: [
                        {name: 'Jenkins pipeline', value: 'jenkins'},
                        {name: 'Gitlab CI', value: 'gitlab'},
                        {name: 'Circle CI', value: 'circle'}
                    ]
                }
            ];
            this.prompt(prompts).then(props => {
                if(props.pipelines.length === 0) {
                    this.abort = true;
                }
                this.pipelines = props.pipelines;
                done();
            });
        },
        askIntegrations: function () {
            if (this.abort) return;
            var done = this.async();
            var choices = [];
            if (this.pipelines.includes('jenkins') || this.pipelines.includes('gitlab')) {
                choices.push({name: '[Docker] Perform the build in a docker container', value: 'docker'});
            }
            if(this.pipelines.includes('jenkins')) {
                choices.push({name: '[Sonar] Analyze code with Sonar', value: 'sonar'});
                choices.push({name: '[Gitlab] Send build status to Gitlab', value: 'gitlab'});
            }
            if(this.herokuAppName) {
                choices.push({name: '[Heroku] Deploy to heroku', value: 'heroku'});
            }

            var prompts = [
                {
                    type: 'checkbox',
                    name: 'integrations',
                    message: 'What tasks/integrations do you want to include ?',
                    default: [],
                    choices: choices
                },
                {
                    when: response => this.pipelines.includes('jenkins') && response.integrations.includes('sonar'),
                    type: 'input',
                    name: 'jenkinsSonarName',
                    message: 'What is the name of the Sonar server ?',
                    default: 'Sonar'
                },
                {
                    when: response => response.integrations.includes('heroku'),
                    type: 'input',
                    name: 'herokuApiKey',
                    message: 'What is the Heroku API Key ?',
                    default: ''
                },
            ];
            this.prompt(prompts).then(props => {
                this.integrations = props.integrations;
                this.jenkinsSonarName = props.jenkinsSonarName;
                this.herokuApiKey = props.herokuApiKey;
                done();
            });
        }
    },
    configuring: {
        insight: function () {
            if (this.abort) return;
            var insight = this.insight();
            insight.trackWithEvent('generator', 'ci-cd');
        },
        setTemplateVariables: function() {
            this.gitLabIndent = this.integrations.includes('gitlab') ? '    ' : '';
            this.indent = this.integrations.includes('docker') ? '    ' : '';
            this.indent += this.gitLabIndent;
        }
    },

    writing: function () {
        if (this.pipelines.includes('jenkins')) {
            this.template('_Jenkinsfile', 'Jenkinsfile');
        }
        if (this.pipelines.includes('gitlab')) {
            this.template('_.gitlab-ci.yml', '.gitlab-ci.yml');
        }
        if (this.pipelines.includes('circle')) {
            this.template('_circle.yml', '.circle.yml');
        }
    }

});
