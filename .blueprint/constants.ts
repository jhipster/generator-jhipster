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

import { getPackageRoot } from '../lib/index.ts';

const packageRoot = getPackageRoot();
export const defaultSamplesFolder = join(packageRoot, '../jhipster-samples');
export const testIntegrationRelativeFolder = '.blueprint/generate-sample/templates/test-integration';
export const testIntegrationFolder = join(packageRoot, testIntegrationRelativeFolder);
export const samplesFolder = join(testIntegrationFolder, 'samples');

export const jhipsterBin = join(packageRoot, 'bin/jhipster.cjs');

export const jdlSamplesFolder = join(testIntegrationFolder, 'jdl-samples');
export const dailyBuildsFolder = join(testIntegrationFolder, 'daily-builds');
export const jdlEntitiesSamplesFolder = join(samplesFolder, 'jdl-entities');

export const entitiesSamplesDir = join(samplesFolder, '.jhipster');
