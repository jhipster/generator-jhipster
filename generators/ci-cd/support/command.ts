/**
 * Copyright 2013-2026 the original author or authors from the JHipster project.
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

import type { JHipsterCommandDefinition } from '../../../lib/command/index.ts';
import buildToolCommand from '../../java-simple-application/generators/build-tool/command.ts';

import { ciCdChoices } from './providers.ts';

const { buildTool } = buildToolCommand.configs;

const includesAnyValue = (values: string[] | undefined, expected: string[]) => Boolean(values && intersection(values, expected).length > 0);

const getCiCdValues = (generator: any, answers: any) =>
  answers.ciCd ?? generator.context.ciCd ?? (generator.provider ? [generator.provider] : undefined);

const includesValue = (generator: any, answers: any, expected: string[]) => includesAnyValue(getCiCdValues(generator, answers), expected);

const includesIntegrations = (answers: any, values: string[]) => includesAnyValue(answers.ciCdIntegrations, values);

const command = {
  configs: {
    ciCd: {
      argument: {
        type: Array,
      },
      prompt: {
        type: 'checkbox',
        message: 'What CI/CD pipeline do you want to generate?',
      },
      choices: ciCdChoices,
      internal: {
        type: Array,
      },
      scope: 'context',
    },
    ciCdIntegrations: {
      prompt: {
        type: 'checkbox',
        message: 'What tasks/integrations do you want to include ?',
      },
      choices: [
        { name: `Deploy your application to an ${chalk.yellow('*Artifactory*')}`, value: 'deploy' },
        { name: `Analyze your code with ${chalk.yellow('*Sonar*')}`, value: 'sonar' },
        { name: `Build and publish a ${chalk.yellow('*Docker*')} image`, value: 'publishDocker' },
        {
          name: `${chalk.yellow('*Snyk*')}: dependency scanning for security vulnerabilities (requires SNYK_TOKEN)`,
          value: 'snyk',
        },
        {
          name: `Deploy to ${chalk.yellow('*Heroku*')} (requires HEROKU_API_KEY set on CI service)`,
          value: 'heroku',
        },
        {
          name: `Would you like to enable the ${chalk.yellow(
            '*Cypress Dashboard*',
          )} (requires both CYPRESS_PROJECT_ID and CYPRESS_RECORD_KEY set on CI service)`,
          value: 'cypressDashboard',
        },
      ],
      internal: {
        type: Array,
      },
      scope: 'context',
    },
    insideDocker: {
      prompt: generator => ({
        when: answers => includesValue(generator, answers, ['jenkins', 'gitlab']),
        type: 'confirm',
        message: 'Would you like to perform the build in a Docker container ?',
        default: false,
      }),
      internal: {
        type: Boolean,
      },
      scope: 'context',
    },
    sendBuildToGitlab: {
      prompt: generator => ({
        when: answers => includesValue(generator, answers, ['jenkins']),
        type: 'confirm',
        message: 'Would you like to send build status to GitLab ?',
        default: false,
      }),
      internal: {
        type: Boolean,
      },
      scope: 'context',
    },
    artifactorySnapshotsId: {
      prompt: {
        when: answers => includesIntegrations(answers, ['deploy']),
        type: 'input',
        message: `${chalk.yellow('*Artifactory*')}: what is the ID of distributionManagement for snapshots ?`,
      },
      default: 'snapshots',
      internal: {
        type: String,
      },
      scope: 'context',
    },
    artifactorySnapshotsUrl: {
      prompt: {
        when: answers => includesIntegrations(answers, ['deploy']),
        type: 'input',
        message: `${chalk.yellow('*Artifactory*')}: what is the URL of distributionManagement for snapshots ?`,
      },
      default: 'http://artifactory:8081/artifactory/libs-snapshot',
      internal: {
        type: String,
      },
      scope: 'context',
    },
    artifactoryReleasesId: {
      prompt: {
        when: answers => includesIntegrations(answers, ['deploy']),
        type: 'input',
        message: `${chalk.yellow('*Artifactory*')}: what is the ID of distributionManagement for releases ?`,
      },
      default: 'releases',
      internal: {
        type: String,
      },
      scope: 'context',
    },
    artifactoryReleasesUrl: {
      prompt: {
        when: answers => includesIntegrations(answers, ['deploy']),
        type: 'input',
        message: `${chalk.yellow('*Artifactory*')}: what is the URL of distributionManagement for releases ?`,
      },
      default: 'http://artifactory:8081/artifactory/libs-release',
      internal: {
        type: String,
      },
      scope: 'context',
    },
    sonarName: {
      prompt: generator => ({
        when: answers => includesValue(generator, answers, ['jenkins']) && includesIntegrations(answers, ['sonar']),
        type: 'input',
        message: `${chalk.yellow('*Sonar*')}: what is the name of the Sonar server ?`,
      }),
      default: 'sonar',
      internal: {
        type: String,
      },
      scope: 'context',
    },
    sonarUrl: {
      prompt: generator => ({
        when: answers =>
          includesValue(generator, answers, ['jenkins', 'github', 'gitlab', 'travis']) && includesIntegrations(answers, ['sonar']),
        type: 'input',
        message: `${chalk.yellow('*Sonar*')}: what is the URL of the Sonar server ?`,
      }),
      default: 'https://sonarcloud.io',
      internal: {
        type: String,
      },
      scope: 'context',
    },
    sonarOrga: {
      prompt: generator => ({
        when: answers =>
          includesValue(generator, answers, ['jenkins', 'github', 'gitlab', 'travis']) && includesIntegrations(answers, ['sonar']),
        type: 'input',
        message: `${chalk.yellow('*Sonar*')}: what is the Organization of the Sonar server ?`,
      }),
      internal: {
        type: String,
      },
      scope: 'context',
    },
    dockerImage: {
      prompt: generator => ({
        when: answers => includesValue(generator, answers, ['github']) && includesIntegrations(answers, ['publishDocker']),
        type: 'input',
        message: `${chalk.yellow('*Docker*')}: what is the name of the image ?`,
        default: () => `jhipster/${generator.jhipsterConfigWithDefaults.dasherizedBaseName}`,
      }),
      internal: {
        type: String,
      },
      scope: 'context',
    },
    herokuAppName: {
      prompt: {
        when: answers => includesIntegrations(answers, ['heroku']),
        type: 'input',
        message: `${chalk.yellow('*Heroku*')}: name of your Heroku Application ?`,
      },
      internal: {
        type: String,
      },
      scope: 'context',
      default: data => kebabCase(data.baseName),
    },
    buildTool: {
      ...buildTool,
      cli: {
        ...buildTool.cli,
        hide: true,
      },
      prompt: undefined,
    },
  },
} as const satisfies JHipsterCommandDefinition<any>;

export default command;
