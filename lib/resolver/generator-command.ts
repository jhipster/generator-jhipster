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
import { existsSync } from 'node:fs';
import { createRequire } from 'node:module';
import { dirname, join } from 'node:path';

import type { StoreGeneratorMeta } from 'yeoman-environment';

import type { JHipsterCommandDefinition } from '../command/types.ts';
import { getPackageRoot } from '../index.ts';

const require = createRequire(import.meta.url);
const COMMAND_FILES = ['command.ts', 'command.js', 'command.mjs'];

/**
 * The command of a generator of a store. Read from the command module next to the generator module when there is one,
 * the module the generator exports its command from, so reading a command does not load the generator and its imports.
 * A generator of JHipster without one has no command; the one of another package, like a blueprint, is read from its
 * generator module.
 */
export const requireGeneratorCommand = (
  meta: Pick<StoreGeneratorMeta, 'resolved' | 'packagePath' | 'requireModule'>,
): JHipsterCommandDefinition | undefined => {
  const commandFile =
    meta.resolved ? COMMAND_FILES.map(file => join(dirname(meta.resolved!), file)).find(file => existsSync(file)) : undefined;
  if (commandFile) {
    return (require(commandFile) as { default?: JHipsterCommandDefinition }).default;
  }
  if (meta.packagePath === getPackageRoot()) return undefined;
  return (meta.requireModule?.() as { command?: JHipsterCommandDefinition } | undefined)?.command;
};
