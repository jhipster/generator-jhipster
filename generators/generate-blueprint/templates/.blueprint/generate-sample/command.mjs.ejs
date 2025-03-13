/**
 * Copyright 2013-2025 the original author or authors from the JHipster project.
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
import { GENERATOR_APP } from 'generator-jhipster/generators';
import { getGithubSamplesGroup, getGithubSamplesGroups } from 'generator-jhipster/testing';

const DEFAULT_SAMPLES_GROUP = 'samples';

/**
 * @type {import('generator-jhipster').JHipsterCommandDefinition}
 */
const command = {
  arguments: {
    sampleName: {
      type: String,
    },
  },
  configs: {
    samplesFolder: {
      description: 'Path to the samples folder',
      cli: {
        type: String,
      },
      scope: 'generator',
    },
    samplesGroup: {
      description: 'Samples group to lookup',
      cli: {
        type: String,
      },
      prompt: gen => ({
        when: !gen.all && !gen.sampleName,
        type: 'list',
        message: 'which sample group do you want to lookup?',
        choices: async () => getGithubSamplesGroups(gen.templatePath(gen.samplesFolder ?? '')),
        default: DEFAULT_SAMPLES_GROUP,
      }),
      configure: gen => {
        gen.samplesGroup ??= DEFAULT_SAMPLES_GROUP;
      },
      scope: 'generator',
    },
    sampleName: {
      prompt: gen => ({
        when: !gen.all,
        type: 'list',
        message: 'which sample do you want to generate?',
        choices: async answers => {
          const samples = await getGithubSamplesGroup(gen.templatePath(), answers.samplesGroup ?? gen.samplesGroup);
          return Object.keys(samples.samples);
        },
      }),
      scope: 'generator',
    },
    all: {
      description: 'Generate every sample in a workspace',
      cli: {
        type: Boolean,
      },
      scope: 'generator',
    },
  },
  options: {},
  import: [GENERATOR_APP],
};

export default command;
