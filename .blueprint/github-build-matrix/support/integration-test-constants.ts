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

import { JHIPSTER_DEPENDENCIES_VERSION } from '../../../generators/generator-constants.ts';
import { getPackageRoot } from '../../../lib/index.ts';

const FORCE_BUILD_JHIPSTER_BOM = false;
export const JHIPSTER_BOM_BRANCH = 'release';
export const JHIPSTER_BOM_CICD_VERSION = '0.0.0-CICD';
export const BUILD_JHIPSTER_BOM = FORCE_BUILD_JHIPSTER_BOM || JHIPSTER_DEPENDENCIES_VERSION.includes('-SNAPSHOT');

export { RECOMMENDED_JAVA_VERSION, RECOMMENDED_NODE_VERSION } from '../../../generators/generator-constants.ts';

export const NPM_VERSION = JSON.parse(readFileSync(getPackageRoot('generators/common/resources/package.json'), 'utf-8')).devDependencies
  .npm;
