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
import type { WritableDeep } from 'type-fest';

import { PRIORITY_NAMES_LIST } from '../base-application/priorities.ts';
import * as GENERATOR_LIST from '../generator-list.ts';

const prioritiesForSub = (_subGen: string) => PRIORITY_NAMES_LIST;

export const GENERATE_SNAPSHOTS = 'generateSnapshots';
export const LINK_JHIPSTER_DEPENDENCY = 'linkJhipsterDependency';
export const SUB_GENERATORS = 'subGenerators';
export const ADDITIONAL_SUB_GENERATORS = 'additionalSubGenerators';
export const DYNAMIC = 'dynamic';
export const JS = 'js';
export const LOCAL_BLUEPRINT_OPTION = 'localBlueprint';
export const CLI_OPTION = 'cli';
export const SAMPLE_GENERATION = 'sampleGeneration';
export const SAMPLE_NAME = 'sampleName';
export const DATABASE_TYPE = 'databaseType';

export const SBS = 'sbs';
export const COMMAND = 'command';
export const PRIORITIES = 'priorities';
export const WRITTEN = 'written';

/**
 * Config that needs to be written to config
 */
export const requiredConfig = () => ({});

/**
 * Default config that will be used for templates
 */
export const defaultConfig = ({ config = {} }: { config?: any } = {}) => ({
  ...requiredConfig,
  [DYNAMIC]: false,
  [JS]: !config[LOCAL_BLUEPRINT_OPTION],
  [LOCAL_BLUEPRINT_OPTION]: false,
  [CLI_OPTION]: !config[LOCAL_BLUEPRINT_OPTION],
  [SUB_GENERATORS]: [] as string[],
  [ADDITIONAL_SUB_GENERATORS]: '',
  [SAMPLE_GENERATION]: false,
  [SAMPLE_NAME]: 'ng-default',
  [DATABASE_TYPE]: 'sql',
});

export const defaultSubGeneratorConfig = () => ({
  [SBS]: true,
  [COMMAND]: false,
  [WRITTEN]: false,
  [PRIORITIES]: [],
});

const allSubGeneratorConfig = (subGenerator: string) => ({
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
  generators: Object.fromEntries(Object.values(GENERATOR_LIST).map(subGenerator => [subGenerator, allSubGeneratorConfig(subGenerator)])),
});

export const prompts = () => {
  const { [LOCAL_BLUEPRINT_OPTION]: LOCAL_BLUEPRINT_OPTION_DEFAULT_VALUE, [CLI_OPTION]: CLI_OPTION_DEFAULT_VALUE, [SAMPLE_GENERATION]: SAMPLE_GENERATION_DEFAULT_VALUE, [SAMPLE_NAME]: SAMPLE_NAME_DEFAULT_VALUE, [DATABASE_TYPE]: DATABASE_TYPE_DEFAULT_VALUE } = defaultConfig();
  const ret = [
    {
      type: 'confirm',
      name: SAMPLE_GENERATION,
      message: 'Do you want to generate a sample application configuration?',
      default: SAMPLE_GENERATION_DEFAULT_VALUE,
    },
    {
      type: 'list',
      name: SAMPLE_NAME,
      message: 'Which sample do you want to generate?',
      choices: [
        { name: 'Angular Default', value: 'ng-default' },
        { name: 'React Default', value: 'react-default' },
        { name: 'Vue Default', value: 'vue-default' },
      ],
      default: SAMPLE_NAME_DEFAULT_VALUE,
      when: (answers: any) => answers[SAMPLE_GENERATION],
    },
    {
      type: 'list',
      name: DATABASE_TYPE,
      message: 'Which database type do you want to use?',
      choices: [
        { name: 'SQL', value: 'sql' },
        { name: 'SQL Full', value: 'sqlfull' },
        { name: 'MongoDB', value: 'mongodb' },
        { name: 'Cassandra', value: 'cassandra' },
        { name: 'Couchbase', value: 'couchbase' },
        { name: 'Neo4j', value: 'neo4j' },
        { name: 'Microservice', value: 'micro' },
      ],
      default: DATABASE_TYPE_DEFAULT_VALUE,
      when: (answers: any) => answers[SAMPLE_GENERATION],
    },
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
      validate: (input: string) => {
        if (input) {
          return /^([\w,-:]*)$/.test(input) ? true : 'Please provide valid generator names (must match ([w,-:]*))';
        }
        return true;
      },
    },
    {
      when: (answers: any) => !answers[LOCAL_BLUEPRINT_OPTION],
      type: 'confirm',
      name: CLI_OPTION,
      message: 'Add a cli?',
      default: CLI_OPTION_DEFAULT_VALUE,
    },
  ] as const;
  // Inquirer doen't support readonly prompts, so we need to cast it
  return ret as WritableDeep<typeof ret>;
};

export const subGeneratorPrompts = ({
  subGenerator,
  additionalSubGenerator,
  localBlueprint,
}: {
  subGenerator: string;
  additionalSubGenerator: boolean;
  localBlueprint?: boolean;
}) => {
  const { [SBS]: SBS_DEFAULT_VALUE } = defaultSubGeneratorConfig();
  const prompts = [
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
      default: (answers: any) => (answers.sbs || additionalSubGenerator ? [] : prioritiesForSub(subGenerator)),
      loop: false,
    },
  ] as const;
  // Inquirer doen't support readonly prompts, so we need to cast it
  return prompts as WritableDeep<typeof prompts>;
};
