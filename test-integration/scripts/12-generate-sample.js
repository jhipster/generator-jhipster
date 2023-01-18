#!/usr/bin/env node
import { cpSync, existsSync, mkdirSync } from 'fs';
import { dirname, join, resolve } from 'path';
import process from 'process';
import { fileURLToPath } from 'url';
import glob from 'glob';

import { runJHipster } from '../../cli/program.mjs';
import { done } from '../../cli/utils.mjs';

import getWorkflowSamples from './lib/get-workflow-samples.js';
import copyEntitySamples from './lib/copy-entity-samples.js';
import copyJdlEntitySamples from './lib/copy-jdl-entity-samples.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const argv = process.argv;
const sampleName = argv.length > 2 ? argv[2] : process.env.JHI_APP;
if (!sampleName) {
  throw new Error('Sample name is required');
}

const jdlSamplesFolder = join(__dirname, '../jdl-samples');
const samplesFolder = join(__dirname, '../samples');
const jdlEntitiesSamplesFolder = join(samplesFolder, 'jdl-entities');

const destSamplesFolder = join(__dirname, '../../../jhipster-samples');
const destSampleFolder = process.env.JHI_FOLDER_APP ? resolve(process.env.JHI_FOLDER_APP) : join(destSamplesFolder, sampleName);

const samples = getWorkflowSamples();

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
    const files = glob.sync('*', { cwd: jdlEntitiesSamplesFolder });
    copyJdlEntitySamples(destSampleFolder, ...files);
  } else {
    copyJdlEntitySamples(destSampleFolder, jdlEntity.split(','));
  }
}

if (sample['app-sample']) {
  cpSync(join(samplesFolder, sample['app-sample'], '.yo-rc.json'), join(destSampleFolder, '.yo-rc.json'));

  if (jdlEntity) {
    // Generate jdl entities
    const files = glob.sync('*.jdl');
    await runJHipster({ argv: ['jhipster', 'jhipster', 'jdl', ...files, '--json-only', '--no-insight'] }).catch(done);
  }

  // Generate the application
  await runJHipster({
    argv: [
      'jhipster',
      'jhipster',
      '--with-entities',
      '--skip-jhipster-dependencies',
      '--skip-install',
      '--no-insight',
      ...(sample['extra-args']?.split(' ') ?? []),
    ],
  }).catch(done);
} else if (sample['jdl-samples']) {
  const jdlSamples = sample['jdl-samples'].split(',');
  for (const jdlSample of jdlSamples) {
    if (existsSync(join(jdlSamplesFolder, jdlSample))) {
      cpSync(join(jdlSamplesFolder, jdlSample), destSampleFolder, { recursive: true });
    } else {
      copyJdlEntitySamples(destSampleFolder, jdlSample);
    }
  }

  const files = glob.sync('*.jdl');
  // Generate the application using every jdl file
  await runJHipster({
    argv: [
      'jhipster',
      'jhipster',
      'jdl',
      ...files,
      '--skip-jhipster-dependencies',
      '--skip-install',
      '--no-insight',
      ...(sample['extra-args'] ?? '').split(' '),
    ],
  }).catch(done);
}

await runJHipster({ argv: ['jhipster', 'jhipster', 'info'] }).catch(done);
