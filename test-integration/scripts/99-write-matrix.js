#!/usr/bin/env node
import { writeFileSync, readFileSync } from 'fs';
import { dirname, join } from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

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
          .map(file => join(__dirname, `../../${file.includes('/') ? file : `test-integration/workflow-samples/${file}.json`}`))
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
