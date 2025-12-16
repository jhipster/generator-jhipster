import { existsSync } from 'node:fs';
import { join } from 'node:path';
import process from 'node:process';

import type { MemFsEditor } from 'mem-fs-editor';
import { globSync } from 'tinyglobby';

import { dailyBuildsFolder, jdlEntitiesSamplesFolder, jdlSamplesFolder, samplesFolder } from '../../constants.ts';

import copyEntitySamples from './copy-entity-samples.ts';
import copyJdlEntitySamples from './copy-jdl-entity-samples.ts';
import getSamples, { DAILY_PREFIX, isDaily } from './get-workflow-samples.ts';

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

  const samples = getSamples();

  const sample = samples[sampleName];

  if (!sample) {
    // eslint-disable-next-line no-console
    console.log(`Sample ${sampleName} was not found`);
  }

  const profile = sample?.environment;
  const war = sample?.war;
  const entity = passedEntity ?? sample?.entity;
  const jdlEntity = sample?.['jdl-entity'];
  const jdlSamples = sample?.['jdl-samples'];
  const appSample = sample?.['app-sample'] ?? sample?.name ?? sampleName;

  if (profile) {
    process.env.JHI_PROFILE = profile;
  }
  if (war === true || war === 1 || war === '1') {
    process.env.JHI_WAR = '1';
  }

  if (entity && entity !== 'none') {
    copyEntitySamples(memFs, destProjectFolder, entity);
  }

  if (jdlEntity && jdlEntity !== 'none') {
    if (jdlEntity === '*') {
      const files = globSync('*', { cwd: jdlEntitiesSamplesFolder });
      copyJdlEntitySamples(memFs, destProjectFolder, ...files);
    } else {
      copyJdlEntitySamples(memFs, destProjectFolder, ...jdlEntity.split(','));
    }
  }

  if (jdlSamples) {
    for (const jdlSample of jdlSamples.split(',')) {
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
  const isDailySample = isDaily(appSample);

  memFs.copy(
    join(isDailySample ? dailyBuildsFolder : samplesFolder, isDailySample ? appSample.replace(DAILY_PREFIX, '') : appSample, '.yo-rc.json'),
    join(destProjectFolder, '.yo-rc.json'),
  );

  // Generate the application
  return {
    generator: 'app',
    jdlFiles: Boolean(jdlEntity),
    sample,
  };
};
