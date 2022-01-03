/**
 * Copyright 2013-2021 the original author or authors from the JHipster project.
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

const PRIORITY_PREFIX = '>';
const QUEUE_PREFIX = 'jhipster:';

/** Yeoman priorities */
const INITIALIZING = 'initializing';
const INITIALIZING_PRIORITY = `${PRIORITY_PREFIX}${INITIALIZING}`;

const PROMPTING = 'prompting';
const PROMPTING_PRIORITY = `${PRIORITY_PREFIX}${PROMPTING}`;

const CONFIGURING = 'configuring';
const CONFIGURING_PRIORITY = `${PRIORITY_PREFIX}${CONFIGURING}`;

const DEFAULT = 'default';
const DEFAULT_PRIORITY = `${PRIORITY_PREFIX}${DEFAULT}`;

const WRITING = 'writing';
const WRITING_PRIORITY = `${PRIORITY_PREFIX}${WRITING}`;

const CONFLICTS = 'conflicts';

const INSTALL = 'install';
const INSTALL_PRIORITY = `${PRIORITY_PREFIX}${INSTALL}`;

const END = 'end';
const END_PRIORITY = `${PRIORITY_PREFIX}${END}`;

/** Custom priorities */
const COMPOSING = 'composing';
const COMPOSING_PRIORITY = `${PRIORITY_PREFIX}${COMPOSING}`;
const COMPOSING_QUEUE = `${QUEUE_PREFIX}${COMPOSING}`;

const LOADING = 'loading';
const LOADING_PRIORITY = `${PRIORITY_PREFIX}${LOADING}`;
const LOADING_QUEUE = `${QUEUE_PREFIX}${LOADING}`;

const PREPARING = 'preparing';
const PREPARING_PRIORITY = `${PRIORITY_PREFIX}${PREPARING}`;
const PREPARING_QUEUE = `${QUEUE_PREFIX}${PREPARING}`;

const PREPARING_FIELDS = 'preparingFields';
const PREPARING_FIELDS_PRIORITY = `${PRIORITY_PREFIX}${PREPARING_FIELDS}`;
const PREPARING_FIELDS_QUEUE = `${QUEUE_PREFIX}${PREPARING_FIELDS}`;

const PREPARING_RELATIONSHIPS = 'preparingRelationships';
const PREPARING_RELATIONSHIPS_PRIORITY = `${PRIORITY_PREFIX}${PREPARING_RELATIONSHIPS}`;
const PREPARING_RELATIONSHIPS_QUEUE = `${QUEUE_PREFIX}${PREPARING_RELATIONSHIPS}`;

const POST_WRITING = 'postWriting';
const POST_WRITING_PRIORITY = `${PRIORITY_PREFIX}${POST_WRITING}`;
const POST_WRITING_QUEUE = `${QUEUE_PREFIX}${POST_WRITING}`;

/** @private */
const PRE_CONFLICTS = 'preConflicts';
/** @private */
const PRE_CONFLICTS_PRIORITY = `${PRIORITY_PREFIX}${PRE_CONFLICTS}`;
/** @private */
const PRE_CONFLICTS_QUEUE = `${QUEUE_PREFIX}${PRE_CONFLICTS}`;

/**
 * Custom priorities to improve jhipster workflow.
 */
const CUSTOM_PRIORITIES = [
  {
    priorityName: COMPOSING,
    queueName: COMPOSING_QUEUE,
    before: LOADING,
  },
  {
    priorityName: LOADING,
    queueName: LOADING_QUEUE,
    before: PREPARING,
  },
  {
    priorityName: PREPARING,
    queueName: PREPARING_QUEUE,
    before: PREPARING_FIELDS,
  },
  {
    priorityName: PREPARING_FIELDS,
    queueName: PREPARING_FIELDS_QUEUE,
    before: PREPARING_RELATIONSHIPS,
  },
  {
    priorityName: PREPARING_RELATIONSHIPS,
    queueName: PREPARING_RELATIONSHIPS_QUEUE,
    before: DEFAULT,
  },
  {
    priorityName: POST_WRITING,
    queueName: POST_WRITING_QUEUE,
    before: PRE_CONFLICTS,
  },
  {
    priorityName: PRE_CONFLICTS,
    queueName: PRE_CONFLICTS_QUEUE,
    before: CONFLICTS,
  },
].reverse();

const compat = {
  INITIALIZING_PRIORITY: INITIALIZING,
  PROMPTING_PRIORITY: PROMPTING,
  CONFIGURING_PRIORITY: CONFIGURING,
  COMPOSING_PRIORITY: COMPOSING,
  LOADING_PRIORITY: LOADING,
  PREPARING_PRIORITY: PREPARING,
  PREPARING_FIELDS_PRIORITY: PREPARING_FIELDS,
  PREPARING_RELATIONSHIPS_PRIORITY: PREPARING_RELATIONSHIPS,
  DEFAULT_PRIORITY: DEFAULT,
  WRITING_PRIORITY: WRITING,
  POST_WRITING_PRIORITY: POST_WRITING,
  INSTALL_PRIORITY: INSTALL,
  END_PRIORITY: END,
};

const PRIORITY_NAMES = [
  INITIALIZING,
  PROMPTING,
  CONFIGURING,
  COMPOSING,
  LOADING,
  PREPARING,
  PREPARING_FIELDS,
  PREPARING_RELATIONSHIPS,
  DEFAULT,
  WRITING,
  POST_WRITING,
  INSTALL,
  END,
];

module.exports = {
  PRIORITY_PREFIX,
  CUSTOM_PRIORITIES,
  PRIORITY_NAMES,
  compat,

  INITIALIZING_PRIORITY,
  PROMPTING_PRIORITY,
  CONFIGURING_PRIORITY,
  COMPOSING_PRIORITY,
  LOADING_PRIORITY,
  PREPARING_PRIORITY,
  PREPARING_FIELDS_PRIORITY,
  PREPARING_RELATIONSHIPS_PRIORITY,
  DEFAULT_PRIORITY,
  WRITING_PRIORITY,
  POST_WRITING_PRIORITY,
  PRE_CONFLICTS_PRIORITY,
  INSTALL_PRIORITY,
  END_PRIORITY,
};
