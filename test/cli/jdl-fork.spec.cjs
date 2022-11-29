/* eslint-disable no-unused-expressions, no-console */

const path = require('path');
const sinon = require('sinon');

const { prepareTempDir, getTemplatePath } = require('./utils/utils.cjs');
const { runJHipster } = require('../../cli/program.cjs');

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
      this.timeout(60000);
      return runJHipster();
    });
  });
});
