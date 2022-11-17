/* eslint-disable no-unused-expressions, no-console */

import path from 'path';
import sinon from 'sinon';
import { fileURLToPath } from 'url';

import { prepareTempDir } from '../utils/utils.mjs';
import { runJHipster } from '../../cli/program.mjs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

describe('jhipster cli with jdl fork', () => {
  let cleanup;
  beforeEach(() => {
    cleanup = prepareTempDir();
  });
  afterEach(() => cleanup());

  describe('generates an application', () => {
    const sandbox = sinon.createSandbox();
    before(() => {
      sandbox
        .stub(process, 'argv')
        .value([
          'jhipster',
          'jhipster',
          'jdl',
          path.join(__dirname, '..', 'templates', 'import-jdl', 'single-app-only.jdl'),
          '--skip-install',
          '--fork',
          '--skip-sample-repository',
          '--skip-prettier',
          '--dry-run',
        ]);
    });
    after(() => {
      sandbox.restore();
    });

    it('should succeed', async () => runJHipster());
  });

  describe('generates entities', () => {
    const sandbox = sinon.createSandbox();
    before(() => {
      sandbox
        .stub(process, 'argv')
        .value([
          'jhipster',
          'jhipster',
          'jdl',
          path.join(__dirname, '..', 'templates', 'import-jdl', 'jdl.jdl'),
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
        ]);
    });
    after(() => {
      sandbox.restore();
    });

    it('should succeed', async () => runJHipster());
  });

  describe('generates an application with deployments', () => {
    const sandbox = sinon.createSandbox();
    before(() => {
      sandbox
        .stub(process, 'argv')
        .value([
          'jhipster',
          'jhipster',
          'jdl',
          path.join(__dirname, '..', 'templates', 'import-jdl', 'apps-and-entities-and-deployments.jdl'),
          '--skip-install',
          '--fork',
          '--skip-prettier',
          '--skip-sample-repository',
        ]);
    });
    after(() => {
      sandbox.restore();
    });

    it('should succeed', async () => runJHipster());
  });
});
