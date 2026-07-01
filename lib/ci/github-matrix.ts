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

import { createHash } from 'node:crypto';
import { readFileSync } from 'node:fs';
import { join } from 'node:path';

import { JAVA_COMPATIBLE_VERSIONS, RECOMMENDED_JAVA_VERSION, RECOMMENDED_NODE_VERSION } from '../../generators/generator-constants.ts';
import { getSourceRoot } from '../index.ts';

const knownGitHubMatrixProperties = new Set([
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
]);

export type GitHubMatrix = {
  os: string;
  'node-version': string;
  'java-version': string;
  'default-environment': string;
  'job-name': string;
  sample: string;
  'samples-group'?: string;
  'sample-type'?: string;
  'sample-file'?: string;
  'sample-folder'?: string;
  generatorOptions?: Record<string, unknown>;
  args?: string;
  'jwt-secret-key'?: string;
  jdl?: string;
};

export type GitHubMatrixGroup = Record<string, Partial<Omit<GitHubMatrix, 'job-name'>> & { disabled?: boolean }>;

export type GitHubMatrixOutput = {
  include: GitHubMatrix[];
};

export const getUnknownGitHubMatrixProperties = (matrix: Partial<GitHubMatrix>): string[] =>
  Object.keys(matrix).filter(key => !knownGitHubMatrixProperties.has(key));

export const getUnknownGitHubMatrixGroupProperties = (matrixRecord: GitHubMatrixGroup): string[] => {
  let unknownProperties: string[] = [];
  for (const matrix of Object.values(matrixRecord)) {
    unknownProperties = [...new Set([...unknownProperties, ...getUnknownGitHubMatrixProperties(matrix)])];
  }
  return unknownProperties;
};

const NPM_VERSION = JSON.parse(readFileSync(join(getSourceRoot(), 'generators/common/resources/package.json'), 'utf-8')).devDependencies
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

const randomReproducibleValue = <const Choice = string>(
  seed: string,
  choices: Choice[],
  options?: { useVersionPlaceholders?: boolean },
): Choice => {
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
    javaVersions = [RECOMMENDED_JAVA_VERSION, ...JAVA_COMPATIBLE_VERSIONS],
    nodeVersions = [RECOMMENDED_NODE_VERSION, '22', '24'],
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
