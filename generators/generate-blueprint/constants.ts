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
import chalk from 'chalk';

import * as GENERATOR_LIST from '../generator-list.js';
import { PRIORITY_NAMES_LIST } from '../base-application/priorities.js';

const prioritiesForSub = (_subGen: string) => PRIORITY_NAMES_LIST;

export const GENERATE_SNAPSHOTS = 'generateSnapshots';
export const LINK_JHIPSTER_DEPENDENCY = 'linkJhipsterDependency';
export const GENERATORS = 'generators';
export const SUB_GENERATORS = 'subGenerators';
export const ADDITIONAL_SUB_GENERATORS = 'additionalSubGenerators';
export const DYNAMIC = 'dynamic';
export const JS = 'js';
export const LOCAL_BLUEPRINT_OPTION = 'localBlueprint';
export const CLI_OPTION = 'cli';

export const SBS = 'sbs';
export const COMMAND = 'command';
export const PRIORITIES = 'priorities';
export const ALL_GENERATORS = 'allGenerators';
export const ALL_PRIORITIES = 'allPriorities';
export const WRITTEN = 'written';

/**
 * Config that needs to be written to config
 */
export const requiredConfig = () => ({});

/**
 * Default config that will be used for templates
 */
export const defaultConfig = ({ config = {} } = {}) => ({
  ...requiredConfig,
  [DYNAMIC]: false,
  [JS]: !config[LOCAL_BLUEPRINT_OPTION],
  [LOCAL_BLUEPRINT_OPTION]: false,
  [CLI_OPTION]: !config[LOCAL_BLUEPRINT_OPTION],
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
  [JS]: true,
  [GENERATORS]: Object.fromEntries(Object.values(GENERATOR_LIST).map(subGenerator => [subGenerator, allSubGeneratorConfig(subGenerator)])),
});

export const prompts = () => {
  const { [LOCAL_BLUEPRINT_OPTION]: LOCAL_BLUEPRINT_OPTION_DEFAULT_VALUE, [CLI_OPTION]: CLI_OPTION_DEFAULT_VALUE } = defaultConfig();
  return [
    {
      type: 'confirm',
      name: LOCAL_BLUEPRINT_OPTION,
      message: 'Do you want to generate a local blueprint inside your application?',
      default: LOCAL_BLUEPRINT_OPTION_DEFAULT_VALUE,
    },
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
      when: answers => !answers[LOCAL_BLUEPRINT_OPTION],
      type: 'confirm',
      name: CLI_OPTION,
      message: 'Add a cli?',
      default: CLI_OPTION_DEFAULT_VALUE,
    },
  ];
};

export const subGeneratorPrompts = ({ subGenerator, additionalSubGenerator, localBlueprint }) => {
  const { [SBS]: SBS_DEFAULT_VALUE } = defaultSubGeneratorConfig();
  return [
    {
      type: 'confirm',
      name: SBS,
      when: !additionalSubGenerator,
      message: `Is ${chalk.yellow(subGenerator)} generator a side-by-side blueprint?`,
      default: SBS_DEFAULT_VALUE,
    },
    {
      when: !localBlueprint,
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
