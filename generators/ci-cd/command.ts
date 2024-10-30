/**
 * Copyright 2013-2024 the original author or authors from the JHipster project.
 *
 * This file is part of the JHipster project, see https://www.jhipster.tech/
 * for more information.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *      https://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */
import chalk from 'chalk';
import { intersection, kebabCase } from 'lodash-es';
import type { JHipsterCommandDefinition } from '../../lib/command/index.js';

const includesValue = (prop, values) => answers => answers[prop] && intersection(answers[prop], values).length > 0;

const command: JHipsterCommandDefinition = {
  options: {},
  configs: {
    ciCd: {
      argument: {
        type: Array,
      },
      prompt: {
        type: 'checkbox',
        message: 'What CI/CD pipeline do you want to generate?',
      },
      choices: [
        { name: 'GitHub Actions', value: 'github' },
        { name: 'Jenkins pipeline', value: 'jenkins' },
        { name: 'GitLab CI', value: 'gitlab' },
        { name: 'Azure Pipelines', value: 'azure' },
        { name: 'Travis CI', value: 'travis' },
        { name: 'CircleCI', value: 'circle' },
      ],
      scope: 'context',
    },
    ciCdIntegrations: {
      prompt: {
        type: 'checkbox',
        message: 'What tasks/integrations do you want to include ?',
      },
      choices: [
        // ['jenkins', 'gitlab']
        { name: `Deploy your application to an ${chalk.yellow('*Artifactory*')}`, value: 'deploy' },
        // ['jenkins', 'gitlab', 'travis', 'github']
        { name: `Analyze your code with ${chalk.yellow('*Sonar*')}`, value: 'sonar' },
        // ['jenkins', 'github'].includes(this.pipeline)
        { name: `Build and publish a ${chalk.yellow('*Docker*')} image`, value: 'publishDocker' },
        // ['jenkins', 'gitlab', 'travis', 'github', 'circle', 'azure']
        {
          name: `${chalk.yellow('*Snyk*')}: dependency scanning for security vulnerabilities (requires SNYK_TOKEN)`,
          value: 'snyk',
        },
        // ['jenkins', 'gitlab', 'travis', 'github', 'circle']
        {
          name: `Deploy to ${chalk.yellow('*Heroku*')} (requires HEROKU_API_KEY set on CI service)`,
          value: 'heroku',
        },
        // ['github']
        {
          name: `Would you like to enable the ${chalk.yellow(
            '*Cypress Dashboard*',
          )} (requires both CYPRESS_PROJECT_ID and CYPRESS_RECORD_KEY set on CI service)`,
          value: 'cypressDashboard',
        },
      ],
      scope: 'context',
    },
    insideDocker: {
      prompt: {
        when: includesValue('ciCd', ['jenkins', 'gitlab']),
        type: 'confirm',
        message: 'Would you like to perform the build in a Docker container ?',
        default: false,
      },
      scope: 'context',
    },
    sendBuildToGitlab: {
      prompt: {
        when: includesValue('ciCd', ['jenkins']),
        type: 'confirm',
        message: 'Would you like to send build status to GitLab ?',
        default: false,
      },
      scope: 'context',
    },
    artifactorySnapshotsId: {
      prompt: {
        when: includesValue('ciCdIntegrations', ['deploy']),
        type: 'input',
        message: `${chalk.yellow('*Artifactory*')}: what is the ID of distributionManagement for snapshots ?`,
      },
      default: 'snapshots',
      scope: 'context',
    },
    artifactorySnapshotsUrl: {
      prompt: {
        when: includesValue('ciCdIntegrations', ['deploy']),
        type: 'input',
        message: `${chalk.yellow('*Artifactory*')}: what is the URL of distributionManagement for snapshots ?`,
      },
      default: 'http://artifactory:8081/artifactory/libs-snapshot',
      scope: 'context',
    },
    artifactoryReleasesId: {
      prompt: {
        when: includesValue('ciCdIntegrations', ['deploy']),
        type: 'input',
        message: `${chalk.yellow('*Artifactory*')}: what is the ID of distributionManagement for releases ?`,
      },
      default: 'releases',
      scope: 'context',
    },
    artifactoryReleasesUrl: {
      prompt: {
        when: includesValue('ciCdIntegrations', ['deploy']),
        type: 'input',
        message: `${chalk.yellow('*Artifactory*')}: what is the URL of distributionManagement for releases ?`,
      },
      default: 'http://artifactory:8081/artifactory/libs-release',
      scope: 'context',
    },
    sonarName: {
      prompt: {
        when: answers => includesValue('ciCd', ['jenkins'])(answers) && includesValue('ciCdIntegrations', ['sonar'])(answers),
        type: 'input',
        message: `${chalk.yellow('*Sonar*')}: what is the name of the Sonar server ?`,
      },
      default: 'sonar',
      scope: 'context',
    },
    sonarUrl: {
      prompt: {
        when: answers =>
          includesValue('ciCd', ['jenkins', 'github', 'gitlab', 'travis'])(answers) &&
          includesValue('ciCdIntegrations', ['sonar'])(answers),
        type: 'input',
        message: `${chalk.yellow('*Sonar*')}: what is the URL of the Sonar server ?`,
      },
      default: 'https://sonarcloud.io',
      scope: 'context',
    },
    sonarOrga: {
      prompt: {
        when: answers =>
          includesValue('ciCd', ['jenkins', 'github', 'gitlab', 'travis'])(answers) &&
          includesValue('ciCdIntegrations', ['sonar'])(answers),
        type: 'input',
        message: `${chalk.yellow('*Sonar*')}: what is the Organization of the Sonar server ?`,
      },
      scope: 'context',
    },
    dockerImage: {
      prompt: ({ jhipsterConfigWithDefaults: config }) => ({
        when: answers => includesValue('ciCd', ['github'])(answers) && includesValue('ciCdIntegrations', ['publishDocker'])(answers),
        type: 'input',
        message: `${chalk.yellow('*Docker*')}: what is the name of the image ?`,
        default: () => `jhipster/${config.dasherizedBaseName}`,
      }),
      scope: 'context',
    },
    herokuAppName: {
      prompt: {
        when: includesValue('ciCdIntegrations', ['heroku']),
        type: 'input',
        message: `${chalk.yellow('*Heroku*')}: name of your Heroku Application ?`,
      },
      scope: 'context',
      default() {
        return kebabCase(this.jhipsterConfigWithDefaults.baseName);
      },
    },
  },
};

export default command;
