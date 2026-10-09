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
import chalk from 'chalk';

import type { JHipsterCommandDefinition } from '../../lib/command/index.ts';
import { ALPHABETIC_LOWER_PATTERN, ALPHANUMERIC_PATTERN } from '../../lib/constants/jdl.ts';
import { applicationTypesChoices } from '../../lib/core/application-types.ts';

const command = {
  configs: {
    defaultEnvironment: {
      description: 'Default environment for the application',
      cli: {
        type: String,
        hide: true,
        env: 'JHI_PROFILE',
      },
      choices: ['prod', 'dev'],
      default: 'prod',
      scope: 'storage',
    },
    skipClient: {
      cli: {
        description: 'Skip the client-side application generation',
        type: Boolean,
      },
      jdl: { type: 'boolean', tokenType: 'BOOLEAN' },
      scope: 'storage',
    },
    skipServer: {
      cli: {
        description: 'Skip the server-side application generation',
        type: Boolean,
      },
      jdl: { type: 'boolean', tokenType: 'BOOLEAN' },
      scope: 'storage',
    },
    authenticationType: {
      cli: {
        name: 'auth',
        description: 'Provide authentication type for the application when skipping server side generation',
        type: String,
      },
      jdl: {
        type: 'string',
        tokenType: 'NAME',
        tokenValuePattern: ALPHANUMERIC_PATTERN,
      },
      choices: [
        { value: 'jwt', name: 'JWT authentication (stateless, with a token)' },
        { value: 'oauth2', name: 'OAuth 2.0 / OIDC Authentication (stateful, works with Keycloak and Okta)' },
        { value: 'session', name: 'HTTP Session Authentication (stateful, default Spring Security mechanism)' },
      ],
      scope: 'storage',
    },
    skipUserManagement: {
      description: 'Skip the user management module during app generation',
      cli: {
        type: Boolean,
      },
      jdl: {
        type: 'boolean',
        tokenType: 'BOOLEAN',
      },
      scope: 'storage',
    },
    applicationType: {
      description: 'Application type to generate',
      cli: {
        type: String,
      },
      jdl: {
        type: 'string',
        tokenType: 'NAME',
        tokenValuePattern: ALPHABETIC_LOWER_PATTERN,
      },
      prompt: {
        type: 'select',
        message: `Which ${chalk.yellow('*type*')} of application would you like to create?`,
      },
      choices: applicationTypesChoices,
      scope: 'storage',
    },
    serverPort: {
      description: 'Server port to use',
      cli: {
        type: Number,
      },
      jdl: {
        type: 'integer',
        tokenType: 'INTEGER',
      },
      default: 8080,
      scope: 'storage',
    },
    gatewayServerPort: {
      description: 'Gateway server port, used by the client dev server proxy and the e2e base url',
      cli: {
        type: Number,
        hide: true,
      },
      jdl: {
        type: 'integer',
        tokenType: 'INTEGER',
      },
      scope: 'storage',
    },
  },
  entity: {
    skipClient: { description: 'Skip the client code of the entities', jdl: { type: 'unary' } },
    skipServer: { description: 'Skip the server code of the entities', jdl: { type: 'unary' } },
    readOnly: { description: 'Read only entities', jdl: { type: 'unary' } },
    microserviceName: { description: 'Microservice the entities belong to', jdl: { type: 'binary', keyword: 'microservice' } },
    pagination: {
      description: 'Pagination of the entities',
      choices: ['pagination', 'infinite-scroll', 'no'],
      default: 'no',
      jdl: { type: 'binary', deprecatedKeywords: ['paginate'] },
    },
  },
  field: {
    types: {
      String: { validations: ['required', 'unique', 'minlength', 'maxlength', 'pattern'] },
      Integer: { validations: ['required', 'unique', 'min', 'max'] },
      Long: { validations: ['required', 'unique', 'min', 'max'] },
      BigDecimal: { validations: ['required', 'unique', 'min', 'max'] },
      Float: { validations: ['required', 'unique', 'min', 'max'] },
      Double: { validations: ['required', 'unique', 'min', 'max'] },
      // The type of a field whose type is an enum of the jdl.
      Enum: { validations: ['required', 'unique'] },
      Boolean: { validations: ['required', 'unique'] },
      LocalDate: { validations: ['required', 'unique'] },
      ZonedDateTime: { validations: ['required', 'unique'] },
      Blob: { validations: ['required', 'unique', 'minbytes', 'maxbytes'] },
      AnyBlob: { validations: ['required', 'unique', 'minbytes', 'maxbytes'] },
      ImageBlob: { validations: ['required', 'unique', 'minbytes', 'maxbytes'] },
      TextBlob: { validations: ['required', 'unique'] },
      UUID: { validations: ['required', 'unique'] },
      Instant: { validations: ['required', 'unique'] },
      Duration: { validations: ['required', 'unique'] },
      LocalTime: { validations: ['required', 'unique'] },
    },
    validations: {
      min: { description: 'Minimum value of a number', jdl: { value: 'number' } },
      max: { description: 'Maximum value of a number', jdl: { value: 'number' } },
      minlength: { description: 'Minimum length of a string', jdl: { value: 'integer' } },
      maxlength: { description: 'Maximum length of a string', jdl: { value: 'integer' } },
      minbytes: { description: 'Minimum size of a blob', jdl: { value: 'integer' } },
      maxbytes: { description: 'Maximum size of a blob', jdl: { value: 'integer' } },
      pattern: { description: 'Pattern a string matches', jdl: { value: 'regex' } },
    },
  },
  import: [
    'jhipster:base-application:bootstrap',
    'jhipster:javascript-simple-application:prettier',
    'jhipster:javascript-simple-application:husky',
  ],
} as const satisfies JHipsterCommandDefinition;

export default command;
