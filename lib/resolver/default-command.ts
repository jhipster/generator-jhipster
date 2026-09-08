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
import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import process from 'node:process';

export const DEFAULT_COMMAND = 'app';

/**
 * The command `jhipster` runs without one: the `defaultCommand` of the `.yo-rc.json` in the directory, `app` otherwise.
 */
export const resolveDefaultCommand = ({ cwd = process.cwd() }: { cwd?: string } = {}): string => {
  try {
    const yoRc = JSON.parse(readFileSync(join(cwd, '.yo-rc.json'), 'utf8'));
    return yoRc?.['generator-jhipster']?.defaultCommand ?? DEFAULT_COMMAND;
  } catch {
    // No .yo-rc.json file or invalid content; the default command applies.
    return DEFAULT_COMMAND;
  }
};
