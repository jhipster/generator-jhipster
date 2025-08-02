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
import detectLanguage from './support/detect-language.ts';

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
    languagesDefinition: {
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
      configure(gen, value) {
        if (value) {
          gen.jhipsterConfig.languages = [...(gen.jhipsterConfig.languages ?? []), ...value];
        }
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
      configure(gen, value) {
        if (value) {
          if (value === true || value === 'true') {
            gen.jhipsterConfig.nativeLanguage = detectLanguage();
          } else if (typeof value === 'string') {
            gen.jhipsterConfig.nativeLanguage = value;
          }
          if (!gen.jhipsterConfig.languages) {
            gen.jhipsterConfig.languages = [gen.jhipsterConfig.nativeLanguage];
          }
        }
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
