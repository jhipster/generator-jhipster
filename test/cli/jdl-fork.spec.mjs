/* eslint-disable no-unused-expressions, no-console */

import sinon from 'sinon';

<<<<<<< HEAD
<<<<<<<< HEAD:test/cli/jdl-fork.spec.mts
import { prepareTempDir } from './utils/utils.cjs';
import { runJHipster } from '../../cli/program.mjs';
import { getTemplatePath } from '../support/index.mjs';
========
const { getTemplatePath } = require('./utils/utils.cjs');
import { prepareTempDir } from '../utils/utils.mjs';
import { runJHipster } from '../../cli/program.mjs';
>>>>>>>> e4f168bcb9 (convert some tests to mjs):test/cli/jdl-fork.spec.mjs
=======
import { prepareTempDir } from './utils/utils.cjs';
import { runJHipster } from '../../cli/program.mjs';
import { getTemplatePath } from '../support/index.mts';
>>>>>>> 453074da9c (rebased from main)

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

<<<<<<<< HEAD:test/cli/jdl-fork.spec.mts
    it('should succeed', function () {
      return runJHipster();
    });
========
    it('should succeed', async () => runJHipster());
>>>>>>>> e4f168bcb9 (convert some tests to mjs):test/cli/jdl-fork.spec.mjs
  });
});
