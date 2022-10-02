import { readFileSync } from 'fs';

export * from '../cli/index.mjs';

export const packageJson = JSON.parse(readFileSync(new URL('../../package.json', import.meta.url)));
