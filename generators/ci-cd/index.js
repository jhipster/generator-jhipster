/**
 * Copyright 2013-2018 the original author or authors from the JHipster project.
 *
 * This file is part of the JHipster project, see http://www.jhipster.tech/
 * for more information.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *      http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */
const chalk = require('chalk');
const prompts = require('./prompts');
const BaseGenerator = require('../generator-base');

const constants = require('../generator-constants');

module.exports = class extends BaseGenerator {
    constructor(args, opts) {
        super(args, opts);

        // Automatically configure Travis
        this.argument('autoconfigure-travis', {
            type: Boolean,
            defaults: false,
            description: 'Automatically configure Travis'
        });

        // Automatically configure Jenkins
        this.argument('autoconfigure-jenkins', {
            type: Boolean,
            defaults: false,
            description: 'Automatically configure Jenkins'
        });
    }

    get initializing() {
        return {
            sayHello() {
                this.log(chalk.white('Welcome to the JHipster CI/CD Sub-Generator'));
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
                this.autoconfigureTravis = this.options['autoconfigure-travis'];
                this.autoconfigureJenkins = this.options['autoconfigure-jenkins'];
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
        };
    }

    get prompting() {
        return {
            askPipelines: prompts.askPipelines,
            askIntegrations: prompts.askIntegrations
        };
    }

    get configuring() {
        return {
            insight() {
                if (this.abort) return;
                const insight = this.insight();
                insight.trackWithEvent('generator', 'ci-cd');
            },
            setTemplateConstants() {
                if (this.abort || this.jenkinsIntegrations === undefined) return;
                this.gitLabIndent = this.jenkinsIntegrations.includes('gitlab') ? '    ' : '';
                this.indent = this.jenkinsIntegrations.includes('docker') ? '    ' : '';
                this.indent += this.gitLabIndent;
            }
        };
    }

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
};
