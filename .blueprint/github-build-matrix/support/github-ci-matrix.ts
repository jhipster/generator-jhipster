import { createHash } from 'node:crypto';
import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { RECOMMENDED_JAVA_VERSION, RECOMMENDED_NODE_VERSION } from '../../../generators/index.js';
import { getPackageRoot } from '../../../lib/index.js';
import { JAVA_COMPATIBLE_VERSIONS, JAVA_VERSION, NODE_VERSION } from '../../../generators/generator-constants.js';

export type GitHubMatrix = {
  os: string;
  'node-version': string;
  'java-version': string;
  'default-environment': string;
  'job-name': string;
  sample: string;
  args?: string;
  'jwt-secret-key'?: string;
};

export type GitHubMatrixRecord = Record<string, Partial<Omit<GitHubMatrix, 'job-name'>> & { disabled?: boolean }>;

export type GitHubMatrixOutput = {
  include: GitHubMatrix[];
};

const NPM_VERSION = JSON.parse(readFileSync(join(getPackageRoot(), 'generators/common/resources/package.json'), 'utf-8')).devDependencies
  .npm;

export const defaultEnvironment = {
  os: 'ubuntu-latest',
  'node-version': RECOMMENDED_NODE_VERSION,
  'java-version': RECOMMENDED_JAVA_VERSION,
  'npm-version': NPM_VERSION,
  'default-environment': 'prod',
  'jwt-secret-key':
    'ZjY4MTM4YjI5YzMwZjhjYjI2OTNkNTRjMWQ5Y2Q0Y2YwOWNmZTE2NzRmYzU3NTMwM2NjOTE3MTllOTM3MWRkMzcyYTljMjVmNmQ0Y2MxOTUzODc0MDhhMTlkMDIxMzI2YzQzZDM2ZDE3MmQ3NjVkODk3OTVmYzljYTQyZDNmMTQ=',
};

export const defaultEnvironmentMatrix = {
  os: ['ubuntu-latest'],
  'node-version': [RECOMMENDED_NODE_VERSION],
  'java-version': [RECOMMENDED_JAVA_VERSION],
  'npm-version': [NPM_VERSION],
  'default-environment': ['prod'],
};

const randomReproducibleValue = <Choice = any>(seed: string, choices: Choice[]): Choice => {
  return choices[createHash('shake256', { outputLength: 1 }).update(seed, 'utf8').digest('binary').charCodeAt(0) % choices.length];
};

const randomEnvironmentMatrix = (key: string) => {
  const javaVersion = randomReproducibleValue(`java-${key}`, [JAVA_VERSION, ...JAVA_COMPATIBLE_VERSIONS]);
  const nodeVersion = randomReproducibleValue(`node-${key}`, [NODE_VERSION, '18', '20']);
  return {
    'job-name': `${key} (n${nodeVersion}/j${javaVersion})`,
    'java-version': javaVersion,
    'node-version': nodeVersion,
  };
};

export const convertToGitHubMatrix = (matrix: GitHubMatrixRecord, options?: { randomEnvironment?: boolean }): GitHubMatrixOutput => {
  const { randomEnvironment } = options ?? {};
  return {
    include: Object.entries(matrix)
      .filter(([_key, value]) => !value.disabled)
      .map(([key, value]) => ({
        'job-name': key,
        sample: key,
        ...defaultEnvironment,
        ...value,
        ...(randomEnvironment ? randomEnvironmentMatrix(key) : {}),
      })),
  };
};
