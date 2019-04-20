/**
 * Copyright 2013-2019 the original author or authors from the JHipster project.
 *
 * This file is part of the JHipster project, see https://www.jhipster.tech/
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
const _ = require('lodash');
const prompts = require('./prompts');
const BaseGenerator = require('../generator-base');
const statistics = require('../statistics');
const packagejs = require('../../package.json');
const constants = require('../generator-constants');

module.exports = class extends BaseGenerator {
    constructor(args, opts) {
        super(args, opts);
        // This adds support for a `--from-cli` flag
        this.option('from-cli', {
            desc: 'Indicates the command is run from JHipster CLI',
            type: Boolean,
            defaults: false
        });
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

        // Automatically configure Gitlab
        this.argument('autoconfigure-gitlab', {
            type: Boolean,
            defaults: false,
            description: 'Automatically configure Gitlab'
        });

        // Automatically configure Azure
        this.argument('autoconfigure-azure', {
            type: Boolean,
            defaults: false,
            description: 'Automatically configure Azure'
        });
        this.registerPrettierTransform();
    }

    get initializing() {
        return {
            validateFromCli() {
                this.checkInvocationFromCLI();
            },
            sayHello() {
                this.log(chalk.white('🚀 Welcome to the JHipster CI/CD Sub-Generator 🚀'));
            },
            getConfig() {
                this.jhipsterVersion = packagejs.version;
                this.baseName = this.config.get('baseName');
                this.applicationType = this.config.get('applicationType');
                this.skipClient = this.config.get('skipClient');
                this.clientPackageManager = this.config.get('clientPackageManager');
                this.buildTool = this.config.get('buildTool');
                this.herokuAppName = this.config.get('herokuAppName');
                if (this.herokuAppName === undefined) {
                    this.herokuAppName = _.kebabCase(this.baseName);
                }
                this.clientFramework = this.config.get('clientFramework');
                this.testFrameworks = this.config.get('testFrameworks');
                this.autoconfigureTravis = this.options['autoconfigure-travis'];
                this.autoconfigureJenkins = this.options['autoconfigure-jenkins'];
                this.autoconfigureGitlab = this.options['autoconfigure-gitlab'];
                this.autoconfigureAzure = this.options['autoconfigure-azure'];
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
            askPipeline: prompts.askPipeline,
            askIntegrations: prompts.askIntegrations
        };
    }

    get configuring() {
        return {
            insight() {
                if (this.abort) return;
                statistics.sendSubGenEvent('generator', 'ci-cd');
            },
            setTemplateConstants() {
                if (this.abort) return;
                if (this.cicdIntegrations === undefined) {
                    this.cicdIntegrations = [];
                }
                this.gitLabIndent = this.sendBuildToGitlab ? '    ' : '';
                this.indent = this.insideDocker ? '    ' : '';
                this.indent += this.gitLabIndent;
                if (this.clientFramework === 'react') {
                    this.frontTestCommand = 'test-ci';
                } else {
                    this.frontTestCommand = 'test';
                }
            }
        };
    }

    writing() {
        if (this.pipeline === 'jenkins') {
            this.template('jenkins/Jenkinsfile.ejs', 'Jenkinsfile');
            this.template('jenkins/jenkins.yml.ejs', `${this.DOCKER_DIR}jenkins.yml`);
            this.template('jenkins/idea.gdsl', `${this.SERVER_MAIN_RES_DIR}idea.gdsl`);
        }
        if (this.pipeline === 'gitlab') {
            this.template('.gitlab-ci.yml.ejs', '.gitlab-ci.yml');
        }
        if (this.pipeline === 'circle') {
            this.template('circle.yml.ejs', 'circle.yml');
        }
        if (this.pipeline === 'travis') {
            this.template('travis.yml.ejs', '.travis.yml');
        }
        if (this.pipeline === 'azure') {
            this.template('azure-pipelines.yml.ejs', 'azure-pipelines.yml');
        }

        if (this.cicdIntegrations.includes('deploy')) {
            if (this.buildTool === 'maven') {
                this.addMavenDistributionManagement(
                    this.artifactorySnapshotsId,
                    this.artifactorySnapshotsUrl,
                    this.artifactoryReleasesId,
                    this.artifactoryReleasesUrl
                );
            } else if (this.buildTool === 'gradle') {
                // TODO: add support here
                // this.addGradleDistributionManagement(this.artifactoryId, this.artifactoryName);
                this.warning('No support for Artifactory yet, when using Gradle.\n');
            }
        }

        if (this.cicdIntegrations.includes('publishDocker')) {
            this.template('docker-registry.yml.ejs', `${this.DOCKER_DIR}docker-registry.yml`);
        }
    }
};
