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
import type { JHipsterCommandDefinition } from '../../lib/command/index.js';

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
    },
    tableName: {
      description: 'Specify table name that will be used by the entity',
      cli: {
        type: String,
      },
    },
    fluentMethods: {
      description: 'Generate fluent methods in entity beans to allow chained object construction',
      cli: {
        type: Boolean,
      },
    },
    angularSuffix: {
      description: 'Use a suffix to generate Angular routes and files, to avoid name clashes',
      cli: {
        type: String,
      },
    },
    clientRootFolder: {
      description:
        'Use a root folder name for entities on client side. By default its empty for monoliths and name of the microservice for gateways',
      cli: {
        type: String,
      },
    },
    skipUiGrouping: {
      description: 'Disables the UI grouping behaviour for entity client side code',
      cli: {
        type: Boolean,
      },
    },
    skipDbChangelog: {
      description: 'Skip the generation of database changelog (liquibase for sql databases)',
      cli: {
        type: Boolean,
      },
    },
    singleEntity: {
      description: 'Regenerate only a single entity, relationships can be not correctly generated',
      cli: {
        type: Boolean,
      },
    },
  },
} as const satisfies JHipsterCommandDefinition;

export default command;
