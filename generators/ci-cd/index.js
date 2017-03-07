'use strict';
const util = require('util');
const chalk = require('chalk');
const generator = require('yeoman-generator');
const prompts = require('./prompts');
const scriptBase = require('../generator-base');

const PipelineGenerator = generator.extend({});

util.inherits(PipelineGenerator, scriptBase);

const constants = require('../generator-constants');

module.exports = PipelineGenerator.extend({
    constructor: function () {
        generator.apply(this, arguments);
    },

    initializing: {
        sayHello: function() {
            this.log(chalk.white('[Beta] Welcome to the JHipster CI/CD Sub-Generator'));
        },
        getConfig: function () {
            this.baseName = this.config.get('baseName');
            this.applicationType = this.config.get('applicationType');
            this.skipClient = this.config.get('skipClient');
            this.clientPackageManager = this.config.get('clientPackageManager');
            this.buildTool = this.config.get('buildTool');
            this.herokuAppName = this.config.get('herokuAppName');
            this.clientFramework = this.config.get('clientFramework');
            this.testFrameworks = this.config.get('testFrameworks');
            this.abort = false;
        },
        initConstants: function () {
            this.NODE_VERSION = constants.NODE_VERSION;
            this.YARN_VERSION = constants.YARN_VERSION;
            this.NPM_VERSION = constants.NPM_VERSION;
        }
    },

    prompting: {
        askPipelines: prompts.askPipelines,
        askIntegrations: prompts.askIntegrations
    },
    configuring: {
        insight: function () {
            if (this.abort) return;
            const insight = this.insight();
            insight.trackWithEvent('generator', 'ci-cd');
        },
        setTemplateconstiables: function() {
            if (this.abort || this.jenkinsIntegrations === undefined) return;
            this.gitLabIndent = this.jenkinsIntegrations.includes('gitlab') ? '    ' : '';
            this.indent = this.jenkinsIntegrations.includes('docker') ? '    ' : '';
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
            this.template('_circle.yml', 'circle.yml');
        }
        if (this.pipelines.includes('travis')) {
            this.template('_travis.yml', '.travis.yml');
        }
    }

});
