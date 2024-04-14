/**
 * Copyright 2013-2024 the original author or authors from the JHipster project.
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
import { JHipsterCommandDefinition } from '../base/api.js';
import { GENERATOR_BOOTSTRAP_APPLICATION_BASE } from '../generator-list.js';

const command: JHipsterCommandDefinition = {
  options: {
    prettierTabWidth: {
      description: 'Default tab width for prettier',
      type: Number,
      scope: 'storage',
    },
    skipCommitHook: {
      description: 'Skip adding husky commit hooks',
      type: Boolean,
      scope: 'storage',
    },
  },
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
  },
  import: [GENERATOR_BOOTSTRAP_APPLICATION_BASE],
};

export default command;
