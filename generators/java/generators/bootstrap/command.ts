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
import type { JHipsterCommandDefinition, PromptSpec } from '../../../../lib/command/index.js';

const command = {
  configs: {
    withGeneratedFlag: {
      description: 'Add a GeneratedByJHipster annotation to all generated java classes and interfaces',
      cli: {
        type: Boolean,
      },
      scope: 'storage',
    },
    packageInfoFile: {
      description: 'write package-info.java file for every package',
      cli: {
        type: Boolean,
        default: true,
        hide: true,
      },
      scope: 'generator',
    },

    packageName: {
      cli: {
        type: String,
      },
      prompt: (gen): PromptSpec => ({
        type: 'input',
        message: 'What is your default Java package name?',
        default: gen.jhipsterConfigWithDefaults.packageName,
        validate: input =>
          /^([a-z_]{1}[a-z0-9_]*(\.[a-z_]{1}[a-z0-9_]*)*)$/.test(input)
            ? true
            : 'The package name you have provided is not a valid Java package name.',
      }),
      scope: 'storage',
      description: 'The package name for the generated application',
    },
    packageFolder: {
      cli: {
        type: String,
        hide: true,
      },
      scope: 'storage',
    },
  },
  import: [],
} as const satisfies JHipsterCommandDefinition;

export default command;
