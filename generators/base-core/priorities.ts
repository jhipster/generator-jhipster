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
import type { Priority } from 'yeoman-generator';
import type CoreGenerator from './generator.ts';

export const PRIORITY_PREFIX = '>';
export const QUEUE_PREFIX = 'jhipster:';

/** Yeoman priorities */
const INITIALIZING = 'initializing';

const PROMPTING = 'prompting';

const CONFIGURING = 'configuring';

const DEFAULT = 'default';

const WRITING = 'writing';

const TRANSFORM = 'transform';

// eslint-disable-next-line unused-imports/no-unused-vars
const CONFLICTS = 'conflicts';

const INSTALL = 'install';

const END = 'end';

/** Custom priorities */
const COMPOSING = 'composing';
const COMPOSING_QUEUE = `${QUEUE_PREFIX}${COMPOSING}`;

const COMPOSING_COMPONENT = 'composingComponent';
const COMPOSING_COMPONENT_QUEUE = `${QUEUE_PREFIX}${COMPOSING_COMPONENT}`;

const LOADING = 'loading';
const LOADING_QUEUE = `${QUEUE_PREFIX}${LOADING}`;

const PREPARING = 'preparing';
const PREPARING_QUEUE = `${QUEUE_PREFIX}${PREPARING}`;

const POST_PREPARING = 'postPreparing';
const POST_PREPARING_QUEUE = `${QUEUE_PREFIX}${POST_PREPARING}`;

const MULTISTEP_TRANSFORM = 'multistepTransform';
const MULTISTEP_TRANSFORM_QUEUE = `${QUEUE_PREFIX}${MULTISTEP_TRANSFORM}`;

const POST_WRITING = 'postWriting';
const POST_WRITING_QUEUE = `${QUEUE_PREFIX}${POST_WRITING}`;

const POST_INSTALL = 'postInstall';
const POST_INSTALL_QUEUE = `${QUEUE_PREFIX}${POST_INSTALL}`;

/** @private */
const PRE_CONFLICTS = 'preConflicts';
/** @private */
const PRE_CONFLICTS_QUEUE = `${QUEUE_PREFIX}${PRE_CONFLICTS}`;

/**
 * Custom priorities to improve jhipster workflow.
 */
export const CUSTOM_PRIORITIES = (
  [
    {
      priorityName: INITIALIZING,
      args: generator => (generator as CoreGenerator).getArgsForPriority(INITIALIZING),
      edit: true,
    },
    {
      priorityName: PROMPTING,
      args: generator => (generator as CoreGenerator).getArgsForPriority(PROMPTING),
      edit: true,
    },
    {
      priorityName: CONFIGURING,
      args: generator => (generator as CoreGenerator).getArgsForPriority(CONFIGURING),
      edit: true,
    },
    {
      priorityName: COMPOSING,
      queueName: COMPOSING_QUEUE,
      before: COMPOSING_COMPONENT,
      args: generator => (generator as CoreGenerator).getArgsForPriority(COMPOSING),
    },
    {
      priorityName: COMPOSING_COMPONENT,
      queueName: COMPOSING_COMPONENT_QUEUE,
      before: LOADING,
      args: generator => (generator as CoreGenerator).getArgsForPriority(COMPOSING_COMPONENT),
    },
    {
      priorityName: LOADING,
      queueName: LOADING_QUEUE,
      before: PREPARING,
      args: generator => (generator as CoreGenerator).getArgsForPriority(LOADING),
    },
    {
      priorityName: PREPARING,
      queueName: PREPARING_QUEUE,
      before: POST_PREPARING,
      args: generator => (generator as CoreGenerator).getArgsForPriority(PREPARING),
    },
    {
      priorityName: POST_PREPARING,
      queueName: POST_PREPARING_QUEUE,
      before: DEFAULT,
      args: generator => (generator as CoreGenerator).getArgsForPriority(POST_PREPARING),
    },
    {
      priorityName: DEFAULT,
      args: generator => (generator as CoreGenerator).getArgsForPriority(DEFAULT),
      edit: true,
    },
    {
      priorityName: WRITING,
      args: generator => (generator as CoreGenerator).getArgsForPriority(WRITING),
      edit: true,
    },
    {
      priorityName: MULTISTEP_TRANSFORM,
      queueName: MULTISTEP_TRANSFORM_QUEUE,
      before: POST_WRITING,
    },
    {
      priorityName: POST_WRITING,
      queueName: POST_WRITING_QUEUE,
      before: PRE_CONFLICTS,
      args: generator => (generator as CoreGenerator).getArgsForPriority(POST_WRITING),
    },
    {
      priorityName: PRE_CONFLICTS,
      queueName: PRE_CONFLICTS_QUEUE,
      args: generator => (generator as CoreGenerator).getArgsForPriority(PRE_CONFLICTS),
      before: TRANSFORM,
    },
    {
      priorityName: INSTALL,
      args: generator => (generator as CoreGenerator).getArgsForPriority(INSTALL),
      edit: true,
    },
    {
      priorityName: POST_INSTALL,
      queueName: POST_INSTALL_QUEUE,
      before: END,
      args: generator => (generator as CoreGenerator).getArgsForPriority(POST_INSTALL),
    },
    {
      priorityName: END,
      args: generator => (generator as CoreGenerator).getArgsForPriority(END),
      edit: true,
    },
  ] satisfies Priority[]
).reverse();

export const PRIORITY_NAMES = {
  INITIALIZING,
  PROMPTING,
  CONFIGURING,
  COMPOSING,
  COMPOSING_COMPONENT,
  LOADING,
  PREPARING,
  POST_PREPARING,

  DEFAULT,
  WRITING,
  MULTISTEP_TRANSFORM,
  POST_WRITING,
  TRANSFORM,
  PRE_CONFLICTS,
  INSTALL,
  POST_INSTALL,
  END,
} as const;

export const PRIORITY_NAMES_LIST = [
  INITIALIZING,
  PROMPTING,
  CONFIGURING,
  COMPOSING,
  COMPOSING_COMPONENT,
  LOADING,
  PREPARING,
  POST_PREPARING,

  DEFAULT,
  WRITING,
  MULTISTEP_TRANSFORM,
  POST_WRITING,
  TRANSFORM,
  INSTALL,
  POST_INSTALL,
  END,
];

export const QUEUES = {
  INITIALIZING_QUEUE: INITIALIZING,
  PROMPTING_QUEUE: PROMPTING,
  CONFIGURING_QUEUE: CONFIGURING,
  COMPOSING_QUEUE,
  COMPOSING_COMPONENT_QUEUE,
  LOADING_QUEUE,
  PREPARING_QUEUE,
  POST_PREPARING_QUEUE,

  DEFAULT_QUEUE: DEFAULT,
  WRITING_QUEUE: WRITING,
  MULTISTEP_TRANSFORM_QUEUE,
  POST_WRITING_QUEUE,
  TRANSFORM_QUEUE: TRANSFORM,
  PRE_CONFLICTS_QUEUE,
  INSTALL_QUEUE: INSTALL,
  POST_INSTALL_QUEUE,
  END_QUEUE: END,
};
