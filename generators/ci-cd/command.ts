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
import buildToolCommand from '../java-simple-application/generators/build-tool/command.ts';

import { ciCdChoices } from './support/providers.ts';

const { buildTool } = buildToolCommand.configs;

const command = {
  configs: {
    ciCd: {
      argument: {
        type: Array,
      },
      prompt: {
        type: 'checkbox',
        message: 'What CI/CD pipeline do you want to generate?',
      },
      choices: ciCdChoices,
      internal: {
        type: Array,
      },
      scope: 'context',
    },
    buildTool: {
      ...buildTool,
      cli: {
        ...buildTool.cli,
        hide: true,
      },
      prompt: undefined,
    },
  },
  import: ['jhipster:ci-cd:common'],
} as const satisfies JHipsterCommandDefinition;

export default command;
