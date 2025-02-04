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
import { readFile } from 'node:fs/promises';
import { dirname } from 'node:path';
import { globby } from 'globby';

const isApplication = async (cwd: string): Promise<boolean> => {
  const content = await readFile(cwd, { encoding: 'utf-8' });
  const jsonContent = JSON.parse(content);
  return Boolean(jsonContent?.['generator-jhipster']?.baseName);
};

export const applicationsLookup = async (cwd: string): Promise<string[]> => {
  const yoRcFiles = await globby('**/.yo-rc.json', { cwd });
  const result = await Promise.all(yoRcFiles.map(async file => ({ file, isApp: await isApplication(file) })));
  return result.filter(({ isApp }) => isApp).map(({ file }) => dirname(file));
};
