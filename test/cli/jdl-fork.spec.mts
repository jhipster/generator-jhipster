/* eslint-disable no-unused-expressions, no-console */

import { prepareTempDir } from './utils/utils.cjs';
import { runJHipster } from '../../cli/program.mjs';
import { getTemplatePath } from '../support/index.mjs';

describe('jhipster cli with jdl fork', () => {
  let cleanup;
  beforeEach(() => {
    cleanup = prepareTempDir();
  });
  afterEach(() => cleanup());

  describe('generates an application', () => {
    let argv;
    before(() => {
      argv = [
        'jhipster',
        'jhipster',
        'jdl',
        getTemplatePath('import-jdl/common/single-app-only.jdl'),
        '--skip-install',
        '--fork',
        '--skip-sample-repository',
        '--skip-prettier',
        '--dry-run',
      ];
    });

    it('should succeed', () => {
      return runJHipster({ argv });
    });
  });

  describe('generates entities', () => {
    let argv;
    before(() => {
      argv = [
        'jhipster',
        'jhipster',
        'jdl',
        getTemplatePath('import-jdl/common/jdl.jdl'),
        '--base-name',
        'jhipsterApp',
        '--db',
        'postgresql',
        '--skip-install',
        '--skip-prettier',
        '--fork',
        '--skip-sample-repository',
        '--dry-run',
        '--defaults',
      ];
    });

    it('should succeed', async () => {
      return runJHipster({ argv });
    });
  });

  describe('generates an application with deployments', () => {
    let argv;
    before(() => {
      argv = [
        'jhipster',
        'jhipster',
        'jdl',
        getTemplatePath('import-jdl/common/apps-and-entities-and-deployments.jdl'),
        '--skip-install',
        '--fork',
        '--skip-prettier',
        '--skip-sample-repository',
      ];
    });

    it('should succeed', function () {
      return runJHipster({ argv });
    });
  });
});
