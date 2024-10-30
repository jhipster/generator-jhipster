import { cpSync, existsSync, mkdirSync } from 'fs';
import { join } from 'path';
import process from 'process';
import { globSync } from 'glob';
import { execa } from 'execa';

import { dailyBuildsFolder, jdlEntitiesSamplesFolder, jdlSamplesFolder, jhipsterBin, samplesFolder } from '../../constants.js';
import getSamples, { DAILY_PREFIX, isDaily } from './get-workflow-samples.js';
import copyEntitySamples from './copy-entity-samples.js';
import copyJdlEntitySamples from './copy-jdl-entity-samples.js';

const commonCliOptions = ['--skip-jhipster-dependencies', '--skip-checks', '--skip-install', '--no-insight'];

export const generateSample = async (
  sampleName = process.argv.length > 2 ? process.argv[2] : process.env.JHI_APP,
  {
    destProjectFolder,
    environment: passedEnvironment,
    war: passedWar,
    entity: passedEntity,
    jdlEntity: passedJdlEntity,
    jdlSamples: passedJdlSamples,
    fork = true,
  }: {
    destProjectFolder: string;
    environment?: string;
    war?: boolean;
    entity?: string;
    jdlEntity?: string;
    jdlSamples?: string;
    fork?: boolean;
  },
) => {
  if (!sampleName) {
    throw new Error('Sample name is required');
  }

  const samples = getSamples();

  const sample = samples[sampleName];
  mkdirSync(destProjectFolder, { recursive: true });
  process.chdir(destProjectFolder);

  if (!sample) {
    // eslint-disable-next-line no-console
    console.log(`Sample ${sampleName} was not found`);
  }

  const profile = passedEnvironment ?? sample?.environment;
  const war = passedWar ?? sample?.war;
  const entity = passedEntity ?? sample?.entity;
  const jdlEntity = passedJdlEntity ?? sample?.['jdl-entity'];
  const jdlSamples = passedJdlSamples ?? sample?.['jdl-samples'];
  const extraArgs = sample?.['extra-args']?.split(' ') ?? [];
  const appSample = sample?.['app-sample'] ?? sample?.name ?? sampleName;

  if (profile) {
    process.env.JHI_PROFILE = profile;
  }
  if (war === true || war === 1 || war === '1') {
    process.env.JHI_WAR = '1';
  }

  if (entity && entity !== 'none') {
    copyEntitySamples(destProjectFolder, entity);
  }

  if (jdlEntity && jdlEntity !== 'none') {
    if (jdlEntity === '*') {
      const files = globSync('*', { cwd: jdlEntitiesSamplesFolder });
      copyJdlEntitySamples(destProjectFolder, ...files);
    } else {
      copyJdlEntitySamples(destProjectFolder, ...jdlEntity.split(','));
    }
  }

  if (jdlSamples) {
    for (const jdlSample of jdlSamples.split(',')) {
      if (existsSync(join(jdlSamplesFolder, jdlSample))) {
        cpSync(join(jdlSamplesFolder, jdlSample), destProjectFolder, { recursive: true });
      } else {
        copyJdlEntitySamples(destProjectFolder, jdlSample);
      }
    }

    const files = globSync('*.jdl');
    // Generate the application using every jdl file
    if (fork) {
      await execa(jhipsterBin, ['jdl', ...files, ...commonCliOptions, ...extraArgs], { stdio: 'inherit' });
    } else {
      return {
        generator: 'jdl',
        jdlFiles: files,
        sample,
      };
    }
  } else {
    const isDailySample = isDaily(appSample);
    cpSync(
      join(
        isDailySample ? dailyBuildsFolder : samplesFolder,
        isDailySample ? appSample.replace(DAILY_PREFIX, '') : appSample,
        '.yo-rc.json',
      ),
      join(destProjectFolder, '.yo-rc.json'),
    );

    if (jdlEntity) {
      // Generate jdl entities
      const files = globSync('*.jdl');
      if (fork) {
        await execa(jhipsterBin, ['jdl', ...files, '--json-only', ...commonCliOptions], { stdio: 'inherit' });
      } else {
        return {
          generator: 'app',
          jdlFiles: files,
          sample,
        };
      }
    }

    // Generate the application
    if (fork) {
      await execa(jhipsterBin, [...commonCliOptions, ...extraArgs], { stdio: 'inherit' });
    } else {
      return {
        generator: 'app',
        sample,
      };
    }
  }

  if (fork) {
    await execa(jhipsterBin, ['info'], { stdio: 'inherit' });
  }
};
