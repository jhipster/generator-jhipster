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

import { join } from 'node:path';
import { pathToFileURL } from 'node:url';

import { lookupGenerators } from '../utils/index.ts';

import type { JHipsterConfig, JHipsterConfigs } from './types.ts';

const cwd = join(import.meta.dirname, '../..');
let jhipsterConfigs: JHipsterConfigs;

export const lookupCommandsConfigs = async (options?: { filter: (config: JHipsterConfig) => boolean }): Promise<JHipsterConfigs> => {
  const { filter = () => true } = options ?? {};
  if (!jhipsterConfigs) {
    jhipsterConfigs = {};
    const files = lookupGenerators();
    for (const file of files) {
      try {
        const index = await import(pathToFileURL(`${cwd}/${file}`).toString());
        if (index.command?.configs) {
          Object.assign(jhipsterConfigs, index.command?.configs);
        }
      } catch (error) {
        throw new Error(`Error loading configs from ${file}`, { cause: error });
      }
    }
  }
  return Object.fromEntries(Object.entries(jhipsterConfigs).filter(([_key, value]) => filter(value)));
};
