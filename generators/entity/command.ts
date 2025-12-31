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
import type { JHipsterCommandDefinition } from '../../lib/command/index.ts';
import commonCommand from '../common/command.ts';
import serverCommand from '../server/command.ts';

const { skipCheckLengthOfIdentifier } = serverCommand.configs;

const { skipClient, skipServer } = commonCommand.configs;

const command = {
  arguments: {
    name: {
      type: String,
      required: true,
      description: 'Entity name',
    },
  },
  configs: {
    regenerate: {
      description: 'Regenerate the entity without presenting an option to update it',
      cli: {
        type: Boolean,
      },
      default: false,
      scope: 'none',
    },
    tableName: {
      description: 'Specify table name that will be used by the entity',
      cli: {
        type: String,
      },
      scope: 'none',
    },
    fluentMethods: {
      description: 'Generate fluent methods in entity beans to allow chained object construction',
      cli: {
        type: Boolean,
      },
      scope: 'none',
    },
    angularSuffix: {
      description: 'Use a suffix to generate Angular routes and files, to avoid name clashes',
      cli: {
        type: String,
      },
      scope: 'none',
    },
    clientRootFolder: {
      description:
        'Use a root folder name for entities on client side. By default its empty for monoliths and name of the microservice for gateways',
      cli: {
        type: String,
      },
      scope: 'none',
    },
    skipUiGrouping: {
      description: 'Disables the UI grouping behaviour for entity client side code',
      cli: {
        type: Boolean,
      },
      scope: 'none',
    },
    skipDbChangelog: {
      description: 'Skip the generation of database changelog (liquibase for sql databases)',
      cli: {
        type: Boolean,
      },
      scope: 'none',
    },
    singleEntity: {
      description: 'Regenerate only a single entity, relationships can be not correctly generated',
      cli: {
        type: Boolean,
      },
      scope: 'none',
    },
    skipCheckLengthOfIdentifier,
    skipClient,
    skipServer,
  },
} as const satisfies JHipsterCommandDefinition;

export default command;
