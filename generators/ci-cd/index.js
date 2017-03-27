const util = require('util');
const chalk = require('chalk');
const generator = require('yeoman-generator');
const prompts = require('./prompts');
const BaseGenerator = require('../generator-base');

const PipelineGenerator = generator.extend({});

util.inherits(PipelineGenerator, BaseGenerator);

const constants = require('../generator-constants');

module.exports = PipelineGenerator.extend({
    constructor: function (...args) { // eslint-disable-line object-shorthand
        generator.apply(this, args);
    },

    initializing: {
        sayHello() {
            this.log(chalk.white('[Beta] Welcome to the JHipster CI/CD Sub-Generator'));
        },
        getConfig() {
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
        initConstants() {
            this.NODE_VERSION = constants.NODE_VERSION;
            this.YARN_VERSION = constants.YARN_VERSION;
            this.NPM_VERSION = constants.NPM_VERSION;
        },
        getConstants() {
            this.DOCKER_DIR = constants.DOCKER_DIR;
            this.SERVER_MAIN_RES_DIR = constants.SERVER_MAIN_RES_DIR;
            this.DOCKER_JENKINS = constants.DOCKER_JENKINS;
        }
    },

    prompting: {
        askPipelines: prompts.askPipelines,
        askIntegrations: prompts.askIntegrations
    },
    configuring: {
        insight() {
            if (this.abort) return;
            const insight = this.insight();
            insight.trackWithEvent('generator', 'ci-cd');
        },
        setTemplateconstiables() {
            if (this.abort || this.jenkinsIntegrations === undefined) return;
            this.gitLabIndent = this.jenkinsIntegrations.includes('gitlab') ? '    ' : '';
            this.indent = this.jenkinsIntegrations.includes('docker') ? '    ' : '';
            this.indent += this.gitLabIndent;
        }
    },

    writing() {
        if (this.pipelines.includes('jenkins')) {
            this.template('jenkins/_Jenkinsfile', 'Jenkinsfile');
            this.template('jenkins/_jenkins.yml', `${this.DOCKER_DIR}jenkins.yml`);
            this.template('jenkins/idea.gdsl', `${this.SERVER_MAIN_RES_DIR}idea.gdsl`);
            if (this.jenkinsIntegrations.includes('publishDocker')) {
                this.template('_docker-registry.yml', `${this.DOCKER_DIR}docker-registry.yml`);
            }
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
