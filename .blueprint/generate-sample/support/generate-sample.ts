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
import { join } from 'node:path';
import process from 'node:process';

import type { MemFsEditor } from 'mem-fs-editor';

import { jdlSamplesFolder } from '../../constants.ts';

import copyEntitySamples from './copy-entity-samples.ts';
import copyJdlEntitySamples from './copy-jdl-entity-samples.ts';
import { resolveSample } from './resolve-sample.ts';

export const generateSample = async (
  sampleName = process.env.JHI_APP,
  {
    destProjectFolder,
    entity: passedEntity,
    memFs,
  }: {
    destProjectFolder: string;
    entity?: string;
    memFs: MemFsEditor;
  },
) => {
  if (!sampleName) {
    throw new Error('Sample name is required');
  }

  const resolved = resolveSample(sampleName, { entity: passedEntity });
  const { sample, profile, war, entitiesSample, jdlEntityNames, jdlSampleNames, yoRcFile } = resolved;

  if (!sample) {
    // eslint-disable-next-line no-console
    console.log(`Sample ${sampleName} was not found`);
  }

  if (profile) {
    process.env.JHI_PROFILE = profile;
  }
  if (war) {
    process.env.JHI_WAR = '1';
  }

  if (entitiesSample) {
    copyEntitySamples(memFs, destProjectFolder, entitiesSample);
  }

  if (jdlEntityNames.length > 0) {
    copyJdlEntitySamples(memFs, destProjectFolder, ...jdlEntityNames);
  }

  if (resolved.generator === 'jdl') {
    for (const jdlSample of jdlSampleNames) {
      if (existsSync(join(jdlSamplesFolder, jdlSample))) {
        memFs.copy(join(jdlSamplesFolder, jdlSample, '**'), destProjectFolder);
      } else {
        copyJdlEntitySamples(memFs, destProjectFolder, jdlSample);
      }
    }

    return {
      generator: 'jdl',
      jdlFiles: true,
      sample,
    };
  }

  if (yoRcFile) {
    memFs.copy(yoRcFile, join(destProjectFolder, '.yo-rc.json'));
  }

  // Generate the application
  return {
    generator: 'app',
    jdlFiles: jdlEntityNames.length > 0,
    sample,
  };
};
