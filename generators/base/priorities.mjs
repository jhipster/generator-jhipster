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

export const PRIORITY_PREFIX = '>';
export const QUEUE_PREFIX = 'jhipster:';

/** Yeoman priorities */
const INITIALIZING = 'initializing';

const PROMPTING = 'prompting';

const CONFIGURING = 'configuring';

const DEFAULT = 'default';

const WRITING = 'writing';

const TRANSFORM = 'transform';

const CONFLICTS = 'conflicts';

const INSTALL = 'install';

const END = 'end';

/** Custom priorities */
const COMPOSING = 'composing';
const COMPOSING_QUEUE = `${QUEUE_PREFIX}${COMPOSING}`;

const LOADING = 'loading';
const LOADING_QUEUE = `${QUEUE_PREFIX}${LOADING}`;

const PREPARING = 'preparing';
const PREPARING_QUEUE = `${QUEUE_PREFIX}${PREPARING}`;

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
export const CUSTOM_PRIORITIES = [
  {
    priorityName: INITIALIZING,
    args: generator => generator.getArgsForPriority(INITIALIZING),
    edit: true,
  },
  {
    priorityName: PROMPTING,
    args: generator => generator.getArgsForPriority(PROMPTING),
    edit: true,
  },
  {
    priorityName: CONFIGURING,
    args: generator => generator.getArgsForPriority(CONFIGURING),
    edit: true,
  },
  {
    priorityName: COMPOSING,
    queueName: COMPOSING_QUEUE,
    before: LOADING,
    args: generator => generator.getArgsForPriority(COMPOSING),
  },
  {
    priorityName: LOADING,
    queueName: LOADING_QUEUE,
    before: PREPARING,
    args: generator => generator.getArgsForPriority(LOADING),
  },
  {
    priorityName: PREPARING,
    queueName: PREPARING_QUEUE,
    before: DEFAULT,
    args: generator => generator.getArgsForPriority(PREPARING),
  },
  {
    priorityName: DEFAULT,
    args: generator => generator.getArgsForPriority(DEFAULT),
    edit: true,
  },
  {
    priorityName: WRITING,
    args: generator => generator.getArgsForPriority(WRITING),
    edit: true,
  },
  {
    priorityName: POST_WRITING,
    queueName: POST_WRITING_QUEUE,
    before: PRE_CONFLICTS,
    args: generator => generator.getArgsForPriority(POST_WRITING),
  },
  {
    priorityName: PRE_CONFLICTS,
    queueName: PRE_CONFLICTS_QUEUE,
    args: generator => generator.getArgsForPriority(PRE_CONFLICTS),
    before: CONFLICTS,
  },
  {
    priorityName: INSTALL,
    args: generator => generator.getArgsForPriority(INSTALL),
    edit: true,
  },
  {
    priorityName: POST_INSTALL,
    queueName: POST_INSTALL_QUEUE,
    before: END,
    args: generator => generator.getArgsForPriority(POST_INSTALL),
  },
  {
    priorityName: END,
    args: generator => generator.getArgsForPriority(END),
    edit: true,
  },
].reverse();

export const PRIORITY_NAMES = {
  INITIALIZING,
  PROMPTING,
  CONFIGURING,
  COMPOSING,
  LOADING,
  PREPARING,

  DEFAULT,
  WRITING,
  TRANSFORM,
  POST_WRITING,
  PRE_CONFLICTS,
  INSTALL,
  POST_INSTALL,
  END,
};

export const PRIORITY_NAMES_LIST = [
  INITIALIZING,
  PROMPTING,
  CONFIGURING,
  COMPOSING,
  LOADING,
  PREPARING,

  DEFAULT,
  WRITING,
  TRANSFORM,
  POST_WRITING,
  INSTALL,
  POST_INSTALL,
  END,
];

export const QUEUES = {
  INITIALIZING_QUEUE: INITIALIZING,
  PROMPTING_QUEUE: PROMPTING,
  CONFIGURING_QUEUE: CONFIGURING,
  COMPOSING_QUEUE,
  LOADING_QUEUE,
  PREPARING_QUEUE,

  DEFAULT_QUEUE: DEFAULT,
  WRITING_QUEUE: WRITING,
  TRANSFORM_QUEUE: TRANSFORM,
  POST_WRITING_QUEUE,
  PRE_CONFLICTS_QUEUE,
  INSTALL_QUEUE: INSTALL,
  POST_INSTALL_QUEUE,
  END_QUEUE: END,
};
