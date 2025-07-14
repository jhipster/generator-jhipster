#!/usr/bin/env node
import { createHash } from 'node:crypto';
import { readFileSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
import {
  BUILD_JHIPSTER_BOM,
  JHIPSTER_BOM_BRANCH,
  JHIPSTER_BOM_CICD_VERSION,
  NPM_VERSION,
  RECOMMENDED_JAVA_VERSION,
  RECOMMENDED_NODE_VERSION,
  packageRoot,
} from '../integration-test-constants.js';
import { JAVA_COMPATIBLE_VERSIONS } from '../../generators/generator-constants.js';

const MATRIX_FILE = 'matrix.json';

let existing = {};
try {
  existing = JSON.parse(readFileSync(MATRIX_FILE));
} catch {
  // eslint-disable-next-line no-console
  console.log(`File ${MATRIX_FILE} not found`);
  existing = { include: [] };
}

const randomReproducibleValue = (seed, choices) =>
  choices[createHash('shake256', { outputLength: 1 }).update(seed, 'utf8').digest('binary').charCodeAt(0) % choices.length];

writeFileSync(
  MATRIX_FILE,
  JSON.stringify(
    {
      include: [
        ...existing.include,
        ...process.argv
          .slice(2)
          .map(file => join(packageRoot, file.includes('/') ? file : `test-integration/workflow-samples/${file}.json`))
          .map(file => {
            try {
              return JSON.parse(readFileSync(file).toString())
                .include.filter(sample => !sample.disabled)
                .map(({ generatorOptions, name, ...sample }) => {
                  const javaVersion = randomReproducibleValue(`java-${name}`, [RECOMMENDED_JAVA_VERSION, ...JAVA_COMPATIBLE_VERSIONS]);
                  const nodeVersion = randomReproducibleValue(`node-${name}`, [RECOMMENDED_NODE_VERSION, '20', '22']);
                  return {
                    name,
                    workspaces: generatorOptions?.workspaces ? 'true' : undefined,
                    'extra-args': `${generatorOptions?.workspaces ? ' --workspaces' : ''}${generatorOptions?.monorepository ? ' --monorepository' : ''}`,
                    'setup-application-sample': sample['jhi-app-sample'] || sample['app-sample'] || 'jdl',
                    'setup-application-environment': generatorOptions?.defaultEnvironment ?? 'prod',
                    'setup-application-packaging': generatorOptions?.defaultPackaging ?? 'jar',
                    'setup-entities-sample': sample.entity ?? 'none',
                    'setup-jdl-entities-sample': sample['jdl-entity'] ?? '',
                    'setup-jdl-sample': sample['jdl-samples'] ?? '',
                    java: javaVersion,
                    node: nodeVersion,
                    'java-version': javaVersion,
                    'node-version': nodeVersion,
                    'npm-version': generatorOptions?.workspaces ? NPM_VERSION : undefined,
                    'build-jhipster-bom': BUILD_JHIPSTER_BOM,
                    'jhipster-bom-branch': BUILD_JHIPSTER_BOM ? JHIPSTER_BOM_BRANCH : undefined,
                    'jhipster-bom-cicd-version': BUILD_JHIPSTER_BOM ? JHIPSTER_BOM_CICD_VERSION : undefined,
                    'gradle-cache': generatorOptions?.workspaces || name.includes('gradle') ? true : undefined,
                    ...sample,
                    'skip-backend-tests': sample['skip-backend-tests'] ? 'true' : 'false',
                    'skip-frontend-tests': sample['skip-frontend-tests'] ? 'true' : 'false',
                    'jwt-secret-key':
                      'ZjY4MTM4YjI5YzMwZjhjYjI2OTNkNTRjMWQ5Y2Q0Y2YwOWNmZTE2NzRmYzU3NTMwM2NjOTE3MTllOTM3MWRkMzcyYTljMjVmNmQ0Y2MxOTUzODc0MDhhMTlkMDIxMzI2YzQzZDM2ZDE3MmQ3NjVkODk3OTVmYzljYTQyZDNmMTQ=',
                  };
                });
            } catch (error) {
              // eslint-disable-next-line no-console
              console.log(`File ${file} not found`, error);
              return [];
            }
          })
          .flat(),
      ],
    },
    null,
    2,
  ),
);
