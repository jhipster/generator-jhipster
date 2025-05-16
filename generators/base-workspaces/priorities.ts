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

import { PRIORITY_NAMES as PRIORITY_NAMES_BASE, QUEUES as QUEUES_BASE, QUEUE_PREFIX } from '../base/priorities.js';

const { DEFAULT } = PRIORITY_NAMES_BASE;

/** Custom priorities */
const PROMPTING_WORKSPACES = 'promptingWorkspaces';
const PROMPTING_WORKSPACES_QUEUE = `${QUEUE_PREFIX}${PROMPTING_WORKSPACES}`;

const CONFIGURING_WORKSPACES = 'configuringWorkspaces';
const CONFIGURING_WORKSPACES_QUEUE = `${QUEUE_PREFIX}${CONFIGURING_WORKSPACES}`;

const LOADING_WORKSPACES = 'loadingWorkspaces';
const LOADING_WORKSPACES_QUEUE = `${QUEUE_PREFIX}${LOADING_WORKSPACES}`;

const PREPARING_WORKSPACES = 'preparingWorkspaces';
const PREPARING_WORKSPACES_QUEUE = `${QUEUE_PREFIX}${PREPARING_WORKSPACES}`;

/**
 * Custom priorities to improve jhipster workflow.
 */
export const CUSTOM_PRIORITIES = [
  {
    priorityName: PROMPTING_WORKSPACES,
    queueName: PROMPTING_WORKSPACES_QUEUE,
    before: CONFIGURING_WORKSPACES,
    args: generator => generator.getArgsForPriority(PROMPTING_WORKSPACES),
  },
  {
    priorityName: CONFIGURING_WORKSPACES,
    queueName: CONFIGURING_WORKSPACES_QUEUE,
    before: LOADING_WORKSPACES,
    args: generator => generator.getArgsForPriority(CONFIGURING_WORKSPACES),
  },
  {
    priorityName: LOADING_WORKSPACES,
    queueName: LOADING_WORKSPACES_QUEUE,
    before: PREPARING_WORKSPACES,
    args: generator => generator.getArgsForPriority(LOADING_WORKSPACES),
  },
  {
    priorityName: PREPARING_WORKSPACES,
    queueName: PREPARING_WORKSPACES_QUEUE,
    before: DEFAULT,
    args: generator => generator.getArgsForPriority(PREPARING_WORKSPACES),
  },
].reverse();

const WORKSPACES_QUEUES = {
  PROMPTING_WORKSPACES_QUEUE,
  CONFIGURING_WORKSPACES_QUEUE,
  LOADING_WORKSPACES_QUEUE,
  PREPARING_WORKSPACES_QUEUE,
};

export const WORKSPACES_PRIORITY_NAMES = {
  PROMPTING_WORKSPACES,
  CONFIGURING_WORKSPACES,
  LOADING_WORKSPACES,
  PREPARING_WORKSPACES,
} as const;

export const PRIORITY_NAMES = {
  ...PRIORITY_NAMES_BASE,
  ...WORKSPACES_PRIORITY_NAMES,
} as const;

export const QUEUES = {
  ...QUEUES_BASE,
  ...WORKSPACES_QUEUES,
};

export const PRIORITY_NAMES_LIST = [
  PRIORITY_NAMES.INITIALIZING,
  PRIORITY_NAMES.PROMPTING,
  PRIORITY_NAMES.CONFIGURING,
  PRIORITY_NAMES.COMPOSING,
  PRIORITY_NAMES.LOADING,
  PRIORITY_NAMES.PREPARING,
  PROMPTING_WORKSPACES,
  CONFIGURING_WORKSPACES,
  LOADING_WORKSPACES,
  PREPARING_WORKSPACES,
  PRIORITY_NAMES.DEFAULT,
  PRIORITY_NAMES.WRITING,
  PRIORITY_NAMES.POST_WRITING,
  PRIORITY_NAMES_BASE.INSTALL,
  PRIORITY_NAMES_BASE.POST_INSTALL,
  PRIORITY_NAMES_BASE.END,
];
