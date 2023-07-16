#!/usr/bin/env node
import { cpSync, existsSync, mkdirSync } from 'fs';
import { dirname, join, resolve } from 'path';
import process from 'process';
import { fileURLToPath } from 'url';
import { globSync } from 'glob';
import { execa } from 'execa';

import getSamples, { DAILY_PREFIX, isDaily } from './lib/get-workflow-samples.js';
import copyEntitySamples from './lib/copy-entity-samples.js';
import copyJdlEntitySamples from './lib/copy-jdl-entity-samples.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const argv = process.argv;
const sampleName = argv.length > 2 ? argv[2] : process.env.JHI_APP;
if (!sampleName) {
  throw new Error('Sample name is required');
}

const jhipsterBin = join(__dirname, '../../bin/jhipster.cjs');
const jdlSamplesFolder = join(__dirname, '../jdl-samples');
const samplesFolder = join(__dirname, '../samples');
const dailyBuildsFolder = join(__dirname, '../daily-builds');
const jdlEntitiesSamplesFolder = join(samplesFolder, 'jdl-entities');

const destSamplesFolder = join(__dirname, '../../../jhipster-samples');
const destSampleFolder = process.env.JHI_FOLDER_APP ? resolve(process.env.JHI_FOLDER_APP) : join(destSamplesFolder, sampleName);

const samples = getSamples();

const sample = samples[sampleName];
mkdirSync(destSampleFolder, { recursive: true });
process.chdir(destSampleFolder);

if (sample.environment) {
  process.env.JHI_PROFILE = sample.environment;
}
if (sample.war === 1 || sample.war === '1') {
  process.env.JHI_WAR = '1';
}

if (sample.entity && sample.entity !== 'none') {
  copyEntitySamples(destSampleFolder, sample.entity);
}

const jdlEntity = sample['jdl-entity'];
if (jdlEntity && jdlEntity !== 'none') {
  if (jdlEntity === '*') {
    const files = globSync('*', { cwd: jdlEntitiesSamplesFolder });
    copyJdlEntitySamples(destSampleFolder, ...files);
  } else {
    copyJdlEntitySamples(destSampleFolder, jdlEntity.split(','));
  }
}

if (sample['jdl-samples']) {
  const jdlSamples = sample['jdl-samples'].split(',');
  for (const jdlSample of jdlSamples) {
    if (existsSync(join(jdlSamplesFolder, jdlSample))) {
      cpSync(join(jdlSamplesFolder, jdlSample), destSampleFolder, { recursive: true });
    } else {
      copyJdlEntitySamples(destSampleFolder, jdlSample);
    }
  }

  const files = globSync('*.jdl');
  // Generate the application using every jdl file
  await execa(
    jhipsterBin,
    ['jdl', ...files, '--skip-jhipster-dependencies', '--skip-install', '--no-insight', ...(sample['extra-args']?.split(' ') ?? [])],
    { stdio: 'inherit' },
  );
} else {
  const appSample = sample['app-sample'] ?? sample.name;
  const isDailySample = isDaily(appSample);
  cpSync(
    join(isDailySample ? dailyBuildsFolder : samplesFolder, isDailySample ? appSample.replace(DAILY_PREFIX, '') : appSample, '.yo-rc.json'),
    join(destSampleFolder, '.yo-rc.json'),
  );

  if (jdlEntity) {
    // Generate jdl entities
    const files = globSync('*.jdl');
    await execa(jhipsterBin, ['jdl', ...files, '--json-only', '--no-insight'], { stdio: 'inherit' });
  }

  // Generate the application
  await execa(
    jhipsterBin,
    ['--with-entities', '--skip-jhipster-dependencies', '--skip-install', '--no-insight', ...(sample['extra-args']?.split(' ') ?? [])],
    { stdio: 'inherit' },
  );
}

await execa(jhipsterBin, ['info'], { stdio: 'inherit' });
