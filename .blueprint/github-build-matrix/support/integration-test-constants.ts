import { readFileSync } from 'node:fs';

import { JHIPSTER_DEPENDENCIES_VERSION } from '../../../generators/generator-constants.js';
import { getPackageRoot } from '../../../lib/index.ts';

const FORCE_BUILD_JHIPSTER_BOM = true;
export const JHIPSTER_BOM_BRANCH = 'main';
export const JHIPSTER_BOM_CICD_VERSION = '0.0.0-CICD';
export const BUILD_JHIPSTER_BOM = FORCE_BUILD_JHIPSTER_BOM || JHIPSTER_DEPENDENCIES_VERSION.includes('-SNAPSHOT');

export { RECOMMENDED_JAVA_VERSION, RECOMMENDED_NODE_VERSION } from '../../../generators/generator-constants.js';

export const NPM_VERSION = JSON.parse(readFileSync(getPackageRoot('generators/common/resources/package.json'), 'utf-8')).devDependencies
  .npm;
