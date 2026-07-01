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
import { isAbsolute, join, resolve } from 'node:path';

import { getSourceRoot } from '../index.ts';

export const getGeneratorRelativeFolder = (generatorNamespace: string) => {
  generatorNamespace = generatorNamespace.replace('jhipster:', '');
  return join('generators', generatorNamespace.split(':').join('/generators/'));
};

export const getGeneratorFolder = (generatorNamespace: string) => resolve(getSourceRoot(), getGeneratorRelativeFolder(generatorNamespace));

const getGenerator = (generatorNamespace: string) => {
  if (isAbsolute(generatorNamespace)) {
    return generatorNamespace;
  }
  const generatorFolder = getGeneratorFolder(generatorNamespace);
  const resolved = resolve(generatorFolder, 'index.ts');
  if (existsSync(resolved)) {
    return resolved;
  }
  return resolve(generatorFolder, 'index.js');
};

export default getGenerator;
