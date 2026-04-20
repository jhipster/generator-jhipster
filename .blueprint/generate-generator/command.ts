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

const command = {
  configs: {
    generatorNamespace: {
      argument: {
        type: String,
      },
      prompt: {
        type: 'input',
        message: 'The generator namespace (e.g. "foo:bar" for a generator located in generators/foo/generators/bar)',
        validate: (input: string) => {
          if (!input) {
            return 'The generator namespace is required.';
          }
          if (!/^[a-z0-9-]+(:[a-z0-9-]+)?$/.test(input)) {
            return 'The generator namespace must be in the format "foo:bar" (lowercase letters, numbers, and hyphens, separated by colons).';
          }
          return true;
        },
      },
      configure: gen => {
        gen.generatorNamespace = gen.generatorNamespace.replaceAll(':', '/');
      },
      scope: 'generator',
    },
  },
  import: [],
} as const satisfies JHipsterCommandDefinition<any>;

export default command;
