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

const INITIALIZING = 'initializing';
const PROMPTING = 'prompting';
const CONFIGURING = 'configuring';
const COMPOSING = 'composing';
const LOADING = 'loading';
const PREPARING = 'preparing';
const PREPARING_FIELDS = 'preparingFields';
const PREPARING_RELATIONSHIPS = 'preparingRelationships';
const DEFAULT = 'default';
const WRITING = 'writing';
const PRE_CONFLICTS = 'preConflicts';
const CONFLICTS = 'conflicts';
const POST_WRITING = 'postWriting';
const INSTALL = 'install';
const END = 'end';

const INITIALIZING_PRIORITY = `${PRIORITY_PREFIX}initializing`;
const PROMPTING_PRIORITY = `${PRIORITY_PREFIX}prompting`;
const CONFIGURING_PRIORITY = `${PRIORITY_PREFIX}configuring`;
const COMPOSING_PRIORITY = `${PRIORITY_PREFIX}composing`;
const LOADING_PRIORITY = `${PRIORITY_PREFIX}loading`;
const PREPARING_PRIORITY = `${PRIORITY_PREFIX}preparing`;
const PREPARING_FIELDS_PRIORITY = `${PRIORITY_PREFIX}preparingFields`;
const PREPARING_RELATIONSHIPS_PRIORITY = `${PRIORITY_PREFIX}preparingRelationships`;
const DEFAULT_PRIORITY = `${PRIORITY_PREFIX}default`;
const WRITING_PRIORITY = `${PRIORITY_PREFIX}writing`;
const PRE_CONFLICTS_PRIORITY = `${PRIORITY_PREFIX}preConflicts`;
const POST_WRITING_PRIORITY = `${PRIORITY_PREFIX}postWriting`;
const INSTALL_PRIORITY = `${PRIORITY_PREFIX}install`;
const END_PRIORITY = `${PRIORITY_PREFIX}end`;

// Reverse order
/**
 * Custom priorities to improve jhipster workflow.
 */
const CUSTOM_PRIORITIES = [
  {
    priorityName: PRE_CONFLICTS,
    queueName: `jhipster:${PRE_CONFLICTS}`,
    before: CONFLICTS,
  },
  {
    priorityName: POST_WRITING,
    queueName: `jhipster:${POST_WRITING}`,
    before: PRE_CONFLICTS,
  },
  {
    priorityName: PREPARING_RELATIONSHIPS,
    queueName: `jhipster:${PREPARING_RELATIONSHIPS}`,
    before: DEFAULT,
  },
  {
    priorityName: PREPARING_FIELDS,
    queueName: `jhipster:${PREPARING_FIELDS}`,
    before: PREPARING_RELATIONSHIPS,
  },
  {
    priorityName: PREPARING,
    queueName: `jhipster:${PREPARING}`,
    before: PREPARING_FIELDS,
  },
  {
    priorityName: LOADING,
    queueName: `jhipster:${LOADING}`,
    before: PREPARING,
  },
  {
    priorityName: COMPOSING,
    queueName: `jhipster:${COMPOSING}`,
    before: LOADING,
  },
];

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
  PRE_CONFLICTS,
  POST_WRITING,
  INSTALL,
  END,
];

module.exports = {
  PRIORITY_PREFIX,
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
  PRE_CONFLICTS_PRIORITY,
  POST_WRITING_PRIORITY,
  INSTALL_PRIORITY,
  END_PRIORITY,
  CUSTOM_PRIORITIES,
  PRIORITY_NAMES,
};
