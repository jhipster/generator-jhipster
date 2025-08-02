import { join } from 'path';

import { getPackageRoot } from '../lib/index.ts';

const packageRoot = getPackageRoot();
export const defaultSamplesFolder = join(packageRoot, '../jhipster-samples');
export const testIntegrationFolder = join(packageRoot, 'test-integration');
export const samplesFolder = join(testIntegrationFolder, 'samples');

export const jhipsterBin = join(packageRoot, 'bin/jhipster.cjs');

export const jdlSamplesFolder = join(testIntegrationFolder, 'jdl-samples');
export const dailyBuildsFolder = join(testIntegrationFolder, 'daily-builds');
export const jdlEntitiesSamplesFolder = join(samplesFolder, 'jdl-entities');

export const entitiesSamplesDir = join(samplesFolder, '.jhipster');
