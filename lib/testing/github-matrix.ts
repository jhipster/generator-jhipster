import { createHash } from 'node:crypto';
import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { RECOMMENDED_JAVA_VERSION, RECOMMENDED_NODE_VERSION } from '../../generators/index.js';
import { getPackageRoot } from '../index.js';
import { JAVA_COMPATIBLE_VERSIONS, JAVA_VERSION, NODE_VERSION } from '../../generators/generator-constants.js';

const knwonGitHubMatrixProperties = [
  'os',
  'node-version',
  'java-version',
  'default-environment',
  'job-name',
  'sample',
  'samples-group',
  'sample-type',
  'args',
  'jwt-secret',
  'jdl',
];

export type GitHubMatrix = {
  os: string;
  'node-version': string;
  'java-version': string;
  'default-environment': string;
  'job-name': string;
  sample: string;
  'samples-group'?: string;
  'sample-type'?: string;
  args?: string;
  'jwt-secret-key'?: string;
  jdl?: string;
};

export type GitHubMatrixGroup = Record<string, Partial<Omit<GitHubMatrix, 'job-name'>> & { disabled?: boolean }>;

export type GitHubMatrixOutput = {
  include: GitHubMatrix[];
};

export const getUnknownGitHubMatrixProperties = (matrix: Partial<GitHubMatrix>): string[] => {
  return Object.keys(matrix).filter(key => !knwonGitHubMatrixProperties.includes(key));
};

export const getUnknownGitHubMatrixGroupProperties = (matrixRecord: GitHubMatrixGroup): string[] => {
  let unknownProperties: string[] = [];
  for (const matrix of Object.values(matrixRecord)) {
    unknownProperties = [...new Set([...unknownProperties, ...getUnknownGitHubMatrixProperties(matrix)])];
  }
  return unknownProperties;
};

const NPM_VERSION = JSON.parse(readFileSync(join(getPackageRoot(), 'generators/common/resources/package.json'), 'utf-8')).devDependencies
  .npm;

export const defaultGithubEnvironment = {
  os: 'ubuntu-latest',
  'node-version': RECOMMENDED_NODE_VERSION,
  'java-version': RECOMMENDED_JAVA_VERSION,
  'npm-version': NPM_VERSION,
  'default-environment': 'prod',
  'jwt-secret-key':
    'ZjY4MTM4YjI5YzMwZjhjYjI2OTNkNTRjMWQ5Y2Q0Y2YwOWNmZTE2NzRmYzU3NTMwM2NjOTE3MTllOTM3MWRkMzcyYTljMjVmNmQ0Y2MxOTUzODc0MDhhMTlkMDIxMzI2YzQzZDM2ZDE3MmQ3NjVkODk3OTVmYzljYTQyZDNmMTQ=',
};

const randomReproducibleValue = <Choice = any>(seed: string, choices: Choice[], options?: { useVersionPlaceholders?: boolean }): Choice => {
  const { useVersionPlaceholders } = options ?? {};
  const index = createHash('shake256', { outputLength: 1 }).update(seed, 'utf8').digest('binary').charCodeAt(0) % choices.length;
  if (useVersionPlaceholders) {
    return `[${index}]` as any;
  }
  return choices[index];
};

type RandomEnvironmentOptions = { useVersionPlaceholders?: boolean; javaVersions?: string[]; nodeVersions?: string[] };

const randomEnvironmentMatrix = (key: string, options: RandomEnvironmentOptions) => {
  const {
    useVersionPlaceholders,
    javaVersions = [JAVA_VERSION, ...JAVA_COMPATIBLE_VERSIONS],
    nodeVersions = [NODE_VERSION, '18', '20'],
  } = options;
  const javaVersion = randomReproducibleValue(`java-${key}`, javaVersions, { useVersionPlaceholders });
  const nodeVersion = randomReproducibleValue(`node-${key}`, nodeVersions, { useVersionPlaceholders });
  return {
    'job-name': `${key} (n${nodeVersion}/j${javaVersion})`,
    'java-version': javaVersion,
    'node-version': nodeVersion,
  };
};

export const convertToGitHubMatrix = (
  matrix: GitHubMatrixGroup,
  options?: { randomEnvironment?: boolean } & RandomEnvironmentOptions,
): GitHubMatrixOutput => {
  const { randomEnvironment, useVersionPlaceholders, ...randomEnvironmentOptions } = options ?? {};
  return {
    include: Object.entries(matrix)
      .filter(([_key, value]) => !value.disabled)
      .map(([key, value]) => ({
        'job-name': key,
        sample: key,
        ...defaultGithubEnvironment,
        ...(useVersionPlaceholders ? { 'java-version': 'JAVA-VERSION', 'node-version': 'NODE-VERSION', 'npm-version': 'NPM-VERSION' } : {}),
        ...value,
        ...(randomEnvironment ? randomEnvironmentMatrix(key, { useVersionPlaceholders, ...randomEnvironmentOptions }) : {}),
      })),
  };
};
