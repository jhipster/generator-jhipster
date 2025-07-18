import { readFileSync } from 'fs';
import { dirname, join } from 'path';
import { fileURLToPath } from 'url';
import { JHIPSTER_DEPENDENCIES_VERSION } from '../generators/generator-constants.js';

const FORCE_BUILD_JHIPSTER_BOM = true;
export const JHIPSTER_BOM_BRANCH = 'main';
export const JHIPSTER_BOM_CICD_VERSION = '0.0.0-CICD';
export const BUILD_JHIPSTER_BOM = FORCE_BUILD_JHIPSTER_BOM || JHIPSTER_DEPENDENCIES_VERSION.includes('-SNAPSHOT');

export { RECOMMENDED_NODE_VERSION, RECOMMENDED_JAVA_VERSION } from '../generators/generator-constants.js';

const __filename = fileURLToPath(import.meta.url);
export const packageRoot = join(dirname(__filename), '..');

export const NPM_VERSION = JSON.parse(readFileSync(join(packageRoot, 'generators/common/resources/package.json'), 'utf-8')).devDependencies
  .npm;
