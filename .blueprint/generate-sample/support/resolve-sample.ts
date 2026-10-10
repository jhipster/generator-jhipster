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

import { globSync } from 'tinyglobby';

import { type GithubSample, type WorkflowSample, getGithubSamples } from '../../../lib/ci/index.ts';
import {
  dailyBuildsFolder,
  entitiesSamplesDir,
  githubSamplesGroupFolder,
  jdlEntitiesSamplesFolder,
  jdlSamplesFolder,
  samplesFolder,
} from '../../constants.ts';

import { entitiesByType } from './copy-entity-samples.ts';
import { jdlEntitySamplePath } from './copy-jdl-entity-samples.ts';
import { DAILY_PREFIX, getWorkflowSamples, isDaily } from './get-workflow-samples.ts';

export type ResolvedSample = {
  name: string;
  /** Workflow sample definition, undefined for a sample that is not part of a workflow. */
  sample?: WorkflowSample;
  generator: 'jdl' | 'app';
  /** `.yo-rc.json` copied to the project, undefined for jdl samples. */
  yoRcFile?: string;
  /** Entity set name, `document` for mongodb and couchbase. */
  entitiesSample?: string;
  /** `.jhipster/*.json` entity files copied to the project. */
  entityFiles: string[];
  /** Names passed to `copyJdlEntitySamples`, `*` expanded. */
  jdlEntityNames: string[];
  /** `jdl-entities` files or folders copied to the project. */
  jdlEntityFiles: string[];
  /** Names listed by `jdl-samples`. */
  jdlSampleNames: string[];
  /** `jdl-samples` folders (copied with their content) or jdl entity files listed by `jdl-samples`. */
  jdlSampleFiles: string[];
  /** `defaultEnvironment` option. */
  profile?: string;
  /** `defaultPackaging: 'war'` option. */
  war: boolean;
};

/** Entity set aliases: mongodb and couchbase share the document entities, `none` copies nothing. */
const resolveEntitiesSample = (entity?: string): string | undefined => {
  if (entity === 'mongodb' || entity === 'couchbase') return 'document';
  return entity === 'none' ? undefined : entity;
};

/** A sample of a group workflow (`github-build-matrix/samples/<group>.ts`), by its name. */
export const resolveGroupSample = async (sampleName: string): Promise<GithubSample | undefined> =>
  (await getGithubSamples(githubSamplesGroupFolder))[sampleName];

/**
 * A sample of a group workflow generated from a `.yo-rc.json` folder (`app-sample`), as the workflow sample it stands for:
 * its entities and its generator options given like the ones of a json workflow.
 */
export const groupWorkflowSample = (name: string, { sample }: GithubSample): WorkflowSample | undefined =>
  // A group item is a partial matrix, as the samples of the json workflows are.
  sample['app-sample'] ? ({ ...sample, name } as WorkflowSample) : undefined;

const findWorkflowSample = (sampleName: string): WorkflowSample | undefined =>
  Object.values(getWorkflowSamples())
    .map(samples => samples[sampleName])
    .find(Boolean);

/**
 * Resolve what `generate-sample` copies and runs for a sample, without touching the file system.
 */
export const resolveSample = (
  sampleName: string,
  { entity: passedEntity, sample: groupSample }: { entity?: string; sample?: WorkflowSample } = {},
): ResolvedSample => {
  const sample = groupSample ?? findWorkflowSample(sampleName);
  const jdlEntity = sample?.['jdl-entity'];
  const jdlSamples = sample?.['jdl-samples'];
  const appSample = sample?.['app-sample'] ?? sample?.name ?? sampleName;

  const entitiesSample = resolveEntitiesSample(passedEntity ?? sample?.entity);
  const entityFiles = (entitiesByType[entitiesSample ?? ''] ?? []).map(entity => join(entitiesSamplesDir, `${entity}.json`));

  let jdlEntityNames: string[] = [];
  if (jdlEntity && jdlEntity !== 'none') {
    jdlEntityNames = jdlEntity === '*' ? globSync('*', { cwd: jdlEntitiesSamplesFolder }) : jdlEntity.split(',');
  }

  const jdlSampleNames = jdlSamples?.split(',') ?? [];
  const jdlSampleFiles = jdlSampleNames.map(jdlSample =>
    existsSync(join(jdlSamplesFolder, jdlSample)) ? join(jdlSamplesFolder, jdlSample) : jdlEntitySamplePath(jdlSample),
  );

  const yoRcFolder = isDaily(appSample) ? join(dailyBuildsFolder, appSample.replace(DAILY_PREFIX, '')) : join(samplesFolder, appSample);

  return {
    name: sampleName,
    sample,
    generator: jdlSamples ? 'jdl' : 'app',
    yoRcFile: jdlSamples || appSample === 'none' ? undefined : join(yoRcFolder, '.yo-rc.json'),
    entitiesSample,
    entityFiles,
    jdlEntityNames,
    jdlEntityFiles: jdlEntityNames.map(jdlEntitySamplePath),
    jdlSampleNames,
    jdlSampleFiles,
    profile: sample?.environment,
    war: sample?.war === true || sample?.war === 1 || sample?.war === '1',
  };
};
