#!/usr/bin/env node
import { writeFileSync, readFileSync } from 'fs';
import { join } from 'path';
import {
  packageRoot,
  JAVA_VERSION,
  NODE_VERSION,
  NPM_VERSION,
  JHIPSTER_BOM_BRANCH,
  JHIPSTER_BOM_CICD_VERSION,
  BUILD_JHIPSTER_BOM,
} from '../integration-test-constants.js';

const MATRIX_FILE = 'matrix.json';

let existing = {};
try {
  existing = JSON.parse(readFileSync(MATRIX_FILE));
} catch (_) {
  console.log(`File ${MATRIX_FILE} not found`);
  existing = { include: [] };
}

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
                .map(({ generatorOptions, ...sample }) => ({
                  workspaces: generatorOptions?.workspaces ? 'true' : undefined,
                  'extra-args': `${generatorOptions?.workspaces ? ' --workspaces' : ''}${generatorOptions?.monorepository ? ' --monorepository' : ''}`,
                  'skip-backend-tests': sample['skip-backend-tests'] ? 'true' : 'false',
                  'skip-frontend-tests': sample['skip-frontend-tests'] ? 'true' : 'false',
                  'setup-application-sample': sample['jhi-app-sample'] || sample['app-sample'] || 'jdl',
                  'setup-application-environment': generatorOptions?.defaultEnvironment ?? 'prod',
                  'setup-application-packaging': generatorOptions?.defaultPackaging ?? 'jar',
                  'setup-entities-sample': sample.entity ?? 'none',
                  'setup-jdl-entities-sample': sample['jdl-entity'] ?? '',
                  'setup-jdl-sample': sample['jdl-samples'] ?? '',
                  java: sample['java-version'] ?? JAVA_VERSION,
                  node: sample['node-version'] ?? NODE_VERSION,
                  'java-version': JAVA_VERSION,
                  'node-version': NODE_VERSION,
                  'npm-version': generatorOptions?.workspaces ? NPM_VERSION : undefined,
                  'build-jhipster-bom': BUILD_JHIPSTER_BOM,
                  'jhipster-bom-branch': BUILD_JHIPSTER_BOM ? JHIPSTER_BOM_BRANCH : undefined,
                  'jhipster-bom-cicd-version': BUILD_JHIPSTER_BOM ? JHIPSTER_BOM_CICD_VERSION : undefined,
                  'gradle-cache': generatorOptions?.workspaces || sample.name.includes('gradle') ? true : undefined,
                  ...sample,
                }));
            } catch (error) {
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
