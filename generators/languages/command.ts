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
import type { JHipsterCommandDefinition } from '../../lib/command/index.js';

const command = {
  arguments: {
    languages: {
      description: 'Languages to generate',
      type: Array,
      required: false,
    },
  },
  configs: {
    languages: {
      cli: {
        type: Array,
        hide: true,
      },
      scope: 'storage',
    },
    enableTranslation: {
      cli: {
        description: 'Enable translation',
        type: Boolean,
      },
      scope: 'storage',
    },
    language: {
      cli: {
        alias: 'l',
        description: 'Language to be added to application (existing languages are not removed)',
        type: Array,
      },
      scope: 'none',
    },
    nativeLanguage: {
      cli: {
        alias: 'n',
        description: 'Set application native language',
        type: String,
        required: false,
      },
      scope: 'storage',
    },
    regenerateLanguages: {
      cli: {
        description: 'Regenerate languages',
        type: Boolean,
      },
      scope: 'generator',
    },
  },
} as const satisfies JHipsterCommandDefinition;

export default command;
