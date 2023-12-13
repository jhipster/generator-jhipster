/**
 * Copyright 2013-2023 the original author or authors from the JHipster project.
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
import { existsSync } from 'fs';
import { join } from 'path';

/**
 * Check if .yo-rc.json exists inside baseName folder.
 * @param {string} baseName
 * @return {boolean}
 */
export const baseNameConfigExists = baseName => existsSync(baseName === undefined ? '.yo-rc.json' : join(baseName, '.yo-rc.json'));

/**
 * Check if every application is new.
 * @param {any} importState
 * @return {boolean}
 */
export const allNewApplications = applications => {
  if (applications.length === 1) return !baseNameConfigExists();
  return !applications.find(application => baseNameConfigExists(application.config.baseName));
};
