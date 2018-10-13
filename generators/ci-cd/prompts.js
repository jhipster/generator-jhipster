/**
 * Copyright 2013-2018 the original author or authors from the JHipster project.
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

module.exports = {
    askPipeline,
    askIntegrations
};

function askPipeline() {
    if (this.abort) return;
    if (this.autoconfigureTravis) {
        this.log('Auto-configuring Travis CI');
        this.pipeline = 'travis';
        return;
    }
    if (this.autoconfigureJenkins) {
        this.log('Auto-configuring Jenkins');
        this.pipeline = 'jenkins';
        this.sendBuildToGitlab = false;
        this.insideDocker = false;
        return;
    }

    if (this.autoconfigureGitlab) {
        this.log('Auto-configuring Gitlab');
        this.pipeline = 'gitlab';
        this.sendBuildToGitlab = true;
        this.insideDocker = true;
        return;
    }

    if (this.autoconfigureAzure) {
        this.log('Auto-configuring Azure');
        this.pipeline = 'azure';
        return;
    }

    const done = this.async();
    const prompts = [
        {
            type: 'list',
            name: 'pipeline',
            message: 'What CI/CD pipeline do you want to generate?',
            default: 'jenkins',
            choices: [
                { name: 'Jenkins pipeline', value: 'jenkins' },
                { name: 'Azure Pipelines', value: 'azure' },
                { name: 'GitLab CI', value: 'gitlab' },
                { name: 'Travis CI', value: 'travis' }
            ]
        }
    ];
    this.prompt(prompts).then(props => {
        this.pipeline = props.pipeline;
        done();
    });
}

function askIntegrations() {
    if (this.abort || !this.pipeline || this.pipeline === 'azure') return;
    if (this.autoconfigureTravis) {
        this.cicdIntegrations = [];
        return;
    }
    if (this.autoconfigureJenkins) {
        this.cicdIntegrations = [];
        this.sendBuildToGitlab = false;
        this.insideDocker = false;
        return;
    }

    if (this.autoconfigureGitlab) {
        this.cicdIntegrations = [];
        this.sendBuildToGitlab = true;
        this.insideDocker = true;
        return;
    }

    if (this.autoconfigureAzure) {
        this.log('Auto-configuring Azure');
        this.pipeline = 'azure';
        return;
    }

    const done = this.async();
    const prompts = [
        {
            when: this.pipeline === 'jenkins',
            type: 'confirm',
            name: 'insideDocker',
            message: 'Would you like to perform the build in a Docker container ?',
            default: false
        },
        {
            when: this.pipeline === 'gitlab',
            type: 'confirm',
            name: 'insideDocker',
            message: 'In GitLab CI, perform the build in a docker container (hint: GitLab.com uses Docker container) ?',
            default: false
        },
        {
            when: this.pipeline === 'jenkins',
            type: 'confirm',
            name: 'sendBuildToGitlab',
            message: 'Would you like to send build status to GitLab ?',
            default: false
        },
        {
            when: this.pipeline === 'jenkins',
            type: 'checkbox',
            name: 'cicdIntegrations',
            message: 'What tasks/integrations do you want to include ?',
            default: [],
            choices: [
                { name: `Deploy your application to an ${chalk.yellow('*Artifactory*')}`, value: 'deploy' },
                { name: `Analyze your code with ${chalk.yellow('*Sonar*')}`, value: 'sonar' },
                { name: `Build and publish a ${chalk.yellow('*Docker*')} image`, value: 'publishDocker' },
                { name: `Deploy to ${chalk.yellow('*Heroku*')} (requires HEROKU_API_KEY set on CI service)`, value: 'heroku' }
            ]
        },
        {
            when: this.pipeline === 'gitlab',
            type: 'checkbox',
            name: 'cicdIntegrations',
            message: 'What tasks/integrations do you want to include ?',
            default: [],
            choices: [
                { name: `Deploy your application to an ${chalk.yellow('*Artifactory*')}`, value: 'deploy' },
                { name: `Analyze your code with ${chalk.yellow('*Sonar*')} (requires SONAR_TOKEN set on CI service)`, value: 'sonar' },
                { name: `Deploy to ${chalk.yellow('*Heroku*')} (requires HEROKU_API_KEY set on CI service)`, value: 'heroku' }
            ]
        },
        {
            when: this.pipeline === 'travis',
            type: 'checkbox',
            name: 'cicdIntegrations',
            message: 'What tasks/integrations do you want to include?',
            default: [],
            choices: [
                { name: `Analyze your code with ${chalk.yellow('*Sonar*')} (requires SONAR_TOKEN set on CI service)`, value: 'sonar' },
                { name: `Deploy to ${chalk.yellow('*Heroku*')} (requires HEROKU_API_KEY set on CI service)`, value: 'heroku' }
            ]
        },
        {
            when: response => response.cicdIntegrations.includes('deploy'),
            type: 'input',
            name: 'artifactorySnapshotsId',
            message: `${chalk.yellow('*Artifactory*')}: what is the ID of distributionManagement for snapshots ?`,
            default: 'snapshots'
        },
        {
            when: response => response.cicdIntegrations.includes('deploy'),
            type: 'input',
            name: 'artifactorySnapshotsUrl',
            message: `${chalk.yellow('*Artifactory*')}: what is the URL of distributionManagement for snapshots ?`,
            default: 'http://artifactory:8081/artifactory/libs-snapshot'
        },
        {
            when: response => response.cicdIntegrations.includes('deploy'),
            type: 'input',
            name: 'artifactoryReleasesId',
            message: `${chalk.yellow('*Artifactory*')}: what is the ID of distributionManagement for releases ?`,
            default: 'releases'
        },
        {
            when: response => response.cicdIntegrations.includes('deploy'),
            type: 'input',
            name: 'artifactoryReleasesUrl',
            message: `${chalk.yellow('*Artifactory*')}: what is the URL of distributionManagement for releases ?`,
            default: 'http://artifactory:8081/artifactory/libs-release'
        },
        {
            when: response => this.pipeline === 'jenkins' && response.cicdIntegrations.includes('sonar'),
            type: 'input',
            name: 'sonarName',
            message: `${chalk.yellow('*Sonar*')}: what is the name of the Sonar server ?`,
            default: 'sonar'
        },
        {
            when: response => this.pipeline !== 'jenkins' && response.cicdIntegrations.includes('sonar'),
            type: 'input',
            name: 'sonarUrl',
            message: `${chalk.yellow('*Sonar*')}: what is the URL of the Sonar server ?`,
            default: 'https://sonarcloud.io'
        },
        {
            when: response => this.pipeline !== 'jenkins' && response.cicdIntegrations.includes('sonar'),
            type: 'input',
            name: 'sonarOrga',
            message: `${chalk.yellow('*Sonar*')}: what is the Organization of the Sonar server ?`,
            default: ''
        },
        {
            when: response => response.cicdIntegrations.includes('publishDocker'),
            type: 'input',
            name: 'dockerRegistryURL',
            message: `${chalk.yellow('*Docker*')}: what is the URL of the Docker registry ?`,
            default: 'https://registry.hub.docker.com'
        },
        {
            when: response => response.cicdIntegrations.includes('publishDocker'),
            type: 'input',
            name: 'dockerRegistryCredentialsId',
            message: `${chalk.yellow('*Docker*')}: what is the Jenkins Credentials ID for the Docker registry ?`,
            default: 'docker-login'
        },
        {
            when: response => response.cicdIntegrations.includes('publishDocker'),
            type: 'input',
            name: 'dockerRegistryOrganizationName',
            message: `${chalk.yellow('*Docker*')}: what is the Organization Name for the Docker registry ?`,
            default: 'docker-login'
        },
        {
            when: response => response.cicdIntegrations.includes('heroku'),
            type: 'input',
            name: 'herokuAppName',
            message: `${chalk.yellow('*Heroku*')}: name of your Heroku Application ?`,
            default: `${this.herokuAppName}`
        }
    ];
    this.prompt(prompts).then(props => {
        this.cicdIntegrations = props.cicdIntegrations;

        this.artifactorySnapshotsId = props.artifactorySnapshotsId;
        this.artifactorySnapshotsUrl = props.artifactorySnapshotsUrl;
        this.artifactoryReleasesId = props.artifactoryReleasesId;
        this.artifactoryReleasesUrl = props.artifactoryReleasesUrl;

        this.sonarName = props.sonarName;
        this.sonarUrl = props.sonarUrl;
        this.sonarOrga = props.sonarOrga;

        this.publishDocker = props.publishDocker;
        this.dockerRegistryURL = props.dockerRegistryURL;
        this.dockerRegistryCredentialsId = props.dockerRegistryCredentialsId;
        this.dockerRegistryOrganizationName = props.dockerRegistryOrganizationName;

        this.insideDocker = props.insideDocker;

        this.sendBuildToGitlab = props.sendBuildToGitlab;

        done();
    });
}
