#!/usr/bin/env node
const { writeFileSync, readFileSync } = require('fs');

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
              return require(`../../${file}`).include;
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
