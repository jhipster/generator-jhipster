/**
 * Copyright 2013-2022 the original author or authors from the JHipster project.
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

import GENERATOR_LIST from '../generator-list.js';
import { BASE_PRIORITY_NAMES, ENTITY_PRIORITY_NAMES } from '../../lib/constants/priorities.mjs';

const prioritiesForSub = subGenerator => (subGenerator.startsWith('entit') ? ENTITY_PRIORITY_NAMES : BASE_PRIORITY_NAMES);

export const GENERATORS = 'generators';
export const SUB_GENERATORS = 'subGenerators';
export const ADDITIONAL_SUB_GENERATORS = 'additionalSubGenerators';
export const DYNAMIC = 'dynamic';
export const JS = 'js';

export const SBS = 'sbs';
export const COMMAND = 'command';
export const PRIORITIES = 'priorities';
export const ALL_GENERATORS = 'allGenerators';
export const WRITTEN = 'written';

/**
 * Options exposed to cli
 */
export const options = () => ({
  [SUB_GENERATORS]: {
    desc: 'Sub generators to generate',
    type: Array,
    scope: 'storage',
  },
  [ADDITIONAL_SUB_GENERATORS]: {
    desc: 'Comma separated additional sub generators to generate',
    type: String,
    scope: 'storage',
  },
  [DYNAMIC]: {
    desc: 'Genate dynamic generators (advanced)',
    type: Boolean,
    scope: 'storage',
  },
  [JS]: {
    desc: 'Use js extension',
    type: Boolean,
    scope: 'storage',
  },
  [ALL_GENERATORS]: {
    desc: 'Use js extension',
    type: Boolean,
    scope: 'generator',
  },
});

/**
 * Config that needs to be written to config
 */
export const requiredConfig = () => ({});

/**
 * Default config that will be used for templates
 */
export const defaultConfig = () => ({
  ...requiredConfig,
  [DYNAMIC]: false,
  [JS]: false,
  [SUB_GENERATORS]: [],
  [ADDITIONAL_SUB_GENERATORS]: '',
});

export const defaultSubGeneratorConfig = () => ({
  [SBS]: true,
  [COMMAND]: false,
  [WRITTEN]: false,
  [PRIORITIES]: [],
});

const allSubGeneratorConfig = subGenerator => ({
  [SBS]: true,
  [COMMAND]: false,
  [PRIORITIES]: prioritiesForSub(subGenerator),
});

export const allGeneratorsConfig = () => ({
  ...requiredConfig,
  [SUB_GENERATORS]: Object.values(GENERATOR_LIST),
  [ADDITIONAL_SUB_GENERATORS]: '',
  [DYNAMIC]: false,
  [JS]: false,
  [GENERATORS]: Object.fromEntries(
    Object.values(GENERATOR_LIST).map(subGenerator => {
      return [subGenerator, allSubGeneratorConfig(subGenerator)];
    })
  ),
});

export const prompts = () => {
  return [
    {
      type: 'checkbox',
      name: SUB_GENERATORS,
      message: 'Which sub-generators do you want to override?',
      choices: Object.values(GENERATOR_LIST),
      pageSize: 30,
      loop: false,
    },
    {
      type: 'input',
      name: ADDITIONAL_SUB_GENERATORS,
      message: 'Comma separated additional sub-generators.',
      validate: input => {
        if (input) {
          return /^([\w,-]*)$/.test(input) ? true : 'Please provide valid generator names';
        }
        return true;
      },
    },
    {
      type: 'confirm',
      name: 'cli',
      message: 'Add a cli?',
      default: true,
    },
  ];
};

export const subGeneratorPrompts = (subGenerator, additionalSubGenerator) => {
  return [
    {
      type: 'confirm',
      name: SBS,
      when: !additionalSubGenerator,
      message: `Is ${chalk.yellow(subGenerator)} generator a side-by-side blueprint?`,
      default: true,
    },
    {
      type: 'confirm',
      name: COMMAND,
      message: `Is ${chalk.yellow(subGenerator)} generator a cli command?`,
      default: false,
    },
    {
      type: 'checkbox',
      name: PRIORITIES,
      message: `What task do you want do implement at ${chalk.yellow(subGenerator)} generator?`,
      choices: prioritiesForSub(subGenerator),
      pageSize: 30,
      default: answers => (answers.sbs || additionalSubGenerator ? [] : prioritiesForSub(subGenerator)),
      loop: false,
    },
  ];
};
