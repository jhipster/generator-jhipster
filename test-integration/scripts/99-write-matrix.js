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
                .map(sample => ({
                  ...sample,
                  'skip-backend-tests': sample['skip-backend-tests'] ? 'true' : 'false',
                  'skip-frontend-tests': sample['skip-frontend-tests'] ? 'true' : 'false',
                  'setup-application-sample': sample['jhi-app-sample'] || sample['app-sample'] || 'jdl',
                  'setup-application-environment': sample.environment ?? 'prod',
                  'setup-application-packaging': sample.packaging ?? 'jar',
                  'setup-entities-sample': sample.entity ?? 'none',
                  'setup-jdl-entities-sample': sample['jdl-entity'] ?? '',
                  'setup-jdl-sample': sample['jdl-samples'] ?? '',
                  java: sample['java'] ?? JAVA_VERSION,
                  node: sample['node'] ?? NODE_VERSION,
                  npm: NPM_VERSION,
                  'build-jhipster-bom': BUILD_JHIPSTER_BOM,
                  'jhipster-bom-branch': BUILD_JHIPSTER_BOM ? JHIPSTER_BOM_BRANCH : '',
                  'jhipster-bom-cicd-version': BUILD_JHIPSTER_BOM ? JHIPSTER_BOM_CICD_VERSION : '',
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
