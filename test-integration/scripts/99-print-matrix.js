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
          .map(file => {
            try {
              return JSON.parse(readFileSync(join(__dirname, `../../${file}`)))
                .include.filter(sample => !sample.disabled)
                .map(sample => ({
                  ...sample,
                  'skip-backend-tests': sample['skip-backend-tests'] ? 'true' : 'false',
                  'skip-frontend-tests': sample['skip-frontend-tests'] ? 'true' : 'false',
                }));
            } catch (_) {
              console.log(`File ${file} not found`);
              return [];
            }
          })
          .flat(),
      ],
    },
    null,
    2
  )
);
