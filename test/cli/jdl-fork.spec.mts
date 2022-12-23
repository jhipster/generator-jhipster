/* eslint-disable no-unused-expressions, no-console */

import sinon from 'sinon';

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
    const sandbox = sinon.createSandbox();
    before(() => {
      sandbox
        .stub(process, 'argv')
        .value([
          'jhipster',
          'jhipster',
          'jdl',
          getTemplatePath('import-jdl/common/single-app-only.jdl'),
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

    it('should succeed', () => {
      return runJHipster();
    });
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
        ]);
    });
    after(() => {
      sandbox.restore();
    });

    it('should succeed', async () => {
      return runJHipster();
    });
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
          getTemplatePath('import-jdl/common/apps-and-entities-and-deployments.jdl'),
          '--skip-install',
          '--fork',
          '--skip-prettier',
          '--skip-sample-repository',
        ]);
    });
    after(() => {
      sandbox.restore();
    });

    it('should succeed', function () {
      return runJHipster();
    });
  });
});
