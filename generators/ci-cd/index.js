'use strict';
var util = require('util'),
    chalk = require('chalk'),
    generators = require('yeoman-generator'),
    prompts = require('./prompts'),
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
        askPipelines: prompts.askPipelines,
        askIntegrations: prompts.askIntegrations
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
