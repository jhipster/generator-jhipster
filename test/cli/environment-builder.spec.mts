/**
 * Copyright 2013-2023 the original author or authors from the JHipster project.
 *
 * This file is part of the JHipster project, see https://www.jhipster.tech/
 * for more information.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *      https://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */
/* eslint-disable no-unused-expressions */
import assert from 'assert';
import { expect } from 'chai';
import fs from 'fs';
import sinon from 'sinon';
import helpers from 'yeoman-test';

import EnvironmentBuilder from '../../cli/environment-builder.mjs';
import { getTemplatePath } from '../support/index.mjs';

import { prepareTempDir, revertTempDir, testInTempDir, copyBlueprint, lnYeoman } from './utils/utils.cjs';

describe('Environment builder', () => {
  let cleanup;
  before(() => {
    cleanup = prepareTempDir();
  });
  after(() => cleanup());

  describe('create', () => {
    let envBuilder;
    before(() => {
      envBuilder = EnvironmentBuilder.create();
    });
    it('should return an EnvironmentBuilder', () => {
      expect(envBuilder).to.not.be.undefined;
      expect(envBuilder.getEnvironment()).to.not.be.undefined;
      expect(envBuilder.getEnvironment().adapter).to.not.be.undefined;
      expect(envBuilder.getEnvironment().sharedOptions).to.not.be.undefined;
    });
  });

  describe('createDefaultBuilder', () => {
    before(() => {
      sinon.spy(EnvironmentBuilder, 'create');
      sinon.spy(EnvironmentBuilder.prototype, '_lookupJHipster');
      sinon.spy(EnvironmentBuilder.prototype, '_loadBlueprints');
      sinon.spy(EnvironmentBuilder.prototype, '_lookupBlueprints');
      // Use localOnly to lookup at local node_modules only to improve lookup speed.
      EnvironmentBuilder.createDefaultBuilder();
    });
    after(() => {
      EnvironmentBuilder.create.restore();
      EnvironmentBuilder.prototype._lookupJHipster.restore();
      EnvironmentBuilder.prototype._loadBlueprints.restore();
      EnvironmentBuilder.prototype._lookupBlueprints.restore();
    });
    it('should call create, _lookupJHipster, _loadBlueprints and _lookupBlueprints', () => {
      expect(EnvironmentBuilder.create.callCount).to.be.equal(1);
      expect(EnvironmentBuilder.prototype._lookupJHipster.callCount).to.be.equal(1);
      expect(EnvironmentBuilder.prototype._loadBlueprints.callCount).to.be.equal(1);
      expect(EnvironmentBuilder.prototype._lookupBlueprints.callCount).to.be.equal(1);
    });
  });

  describe('_loadBlueprints', () => {
    let envBuilder;
    beforeEach(() => {
      envBuilder = EnvironmentBuilder.create()._loadBlueprints();
    });
    describe('when there is no .yo-rc.json', () => {
      let oldCwd;
      let blueprintsWithVersion;

      before(() => {
        oldCwd = testInTempDir(() => {}, true);
        assert(!fs.existsSync('.yo-rc.json'));
      });
      after(() => {
        revertTempDir(oldCwd);
      });
      beforeEach(() => {
        blueprintsWithVersion = envBuilder._blueprintsWithVersion;
      });

      it('returns an empty object', () => {
        expect(blueprintsWithVersion).to.deep.equal({});
      });
    });

    describe('when blueprints were passed by command', () => {
      let oldCwd;
      let oldArgv;
      let blueprintsWithVersion;

      before(() => {
        oldCwd = testInTempDir(() => {}, true);
        oldArgv = process.argv;
        process.argv = ['--blueprints', 'vuejs,dotnet'];
        assert(!fs.existsSync('.yo-rc.json'));
      });
      after(() => {
        process.argv = oldArgv;
        revertTempDir(oldCwd);
      });
      beforeEach(() => {
        blueprintsWithVersion = envBuilder._blueprintsWithVersion;
      });

      it('returns blueprints with no version', () => {
        expect(blueprintsWithVersion).to.deep.equal({
          'generator-jhipster-vuejs': undefined,
          'generator-jhipster-dotnet': undefined,
        });
      });
    });

    describe('when there are no blueprints on .yo-rc.json', () => {
      let oldCwd;
      let blueprintsWithVersion;

      before(() => {
        oldCwd = testInTempDir(() => {}, true);
        const yoRcContent = {
          'generator-jhipster': {
            blueprints: [],
          },
        };
        fs.writeFileSync('.yo-rc.json', JSON.stringify(yoRcContent));
      });
      after(() => {
        fs.unlinkSync('.yo-rc.json');
        revertTempDir(oldCwd);
      });
      beforeEach(() => {
        blueprintsWithVersion = envBuilder._blueprintsWithVersion;
      });

      it('returns an empty object', () => {
        expect(blueprintsWithVersion).to.deep.equal({});
      });
    });

    describe('when there are blueprints on .yo-rc.json', () => {
      let oldCwd;
      let blueprintsWithVersion;

      before(() => {
        oldCwd = testInTempDir(() => {}, true);
        const yoRcContent = {
          'generator-jhipster': {
            blueprints: [
              { name: 'generator-jhipster-beeblebrox', version: 'latest' },
              { name: 'generator-jhipster-h2g2-answer', version: '42' },
            ],
          },
        };
        fs.writeFileSync('.yo-rc.json', JSON.stringify(yoRcContent));
      });
      after(() => {
        fs.unlinkSync('.yo-rc.json');
        revertTempDir(oldCwd);
      });
      beforeEach(() => {
        blueprintsWithVersion = envBuilder._blueprintsWithVersion;
      });

      it('returns the blueprints names & versions', () => {
        expect(blueprintsWithVersion).to.deep.equal({
          'generator-jhipster-beeblebrox': 'latest',
          'generator-jhipster-h2g2-answer': '42',
        });
      });
    });

    describe('when blueprints are defined in both command and .yo-rc.json', () => {
      let oldCwd;
      let oldArgv;
      let blueprintsWithVersion;

      before(() => {
        oldCwd = testInTempDir(() => {}, true);
        oldArgv = process.argv;

        assert(!fs.existsSync('.yo-rc.json'));
        process.argv = ['--blueprints', 'vuejs,dotnet'];
        const yoRcContent = {
          'generator-jhipster': {
            blueprints: [
              { name: 'generator-jhipster-vuejs', version: 'latest' },
              { name: 'generator-jhipster-h2g2-answer', version: '42' },
            ],
          },
        };
        fs.writeFileSync('.yo-rc.json', JSON.stringify(yoRcContent));
      });
      after(() => {
        fs.unlinkSync('.yo-rc.json');
        process.argv = oldArgv;
        revertTempDir(oldCwd);
      });
      beforeEach(() => {
        blueprintsWithVersion = envBuilder._blueprintsWithVersion;
      });

      it('returns the blueprints names & versions, .yo-rc taking precedence', () => {
        expect(blueprintsWithVersion).to.deep.equal({
          'generator-jhipster-vuejs': 'latest',
          'generator-jhipster-dotnet': undefined,
          'generator-jhipster-h2g2-answer': '42',
        });
      });
    });
  });

  describe('_lookupBlueprints', () => {
    let envBuilder;
    beforeEach(() => {
      // Use localOnly to lookup at local node_modules only to improve lookup speed.
      envBuilder = EnvironmentBuilder.create()._loadBlueprints()._lookupBlueprints({ localOnly: true });
    });
    describe('with multiple blueprints', () => {
      let oldCwd;
      let oldArgv;

      before(() => {
        oldArgv = process.argv;
        oldCwd = testInTempDir(tmpdir => {
          lnYeoman(tmpdir);
          copyBlueprint(getTemplatePath('cli/blueprint-cli'), tmpdir, 'cli');
          copyBlueprint(getTemplatePath('cli/blueprint-cli-shared'), tmpdir, 'cli-shared');
        }, true);

        process.argv = ['--blueprints', 'cli,cli-shared'];
      });
      after(() => {
        process.argv = oldArgv;
        revertTempDir(oldCwd);
      });

      it('should load all blueprints', () => {
        expect(envBuilder.getEnvironment().isPackageRegistered('jhipster-cli')).to.be.true;
        expect(envBuilder.getEnvironment().isPackageRegistered('jhipster-cli-shared')).to.be.true;
      });

      it('should load all generators', () => {
        expect(envBuilder.getEnvironment().get('jhipster-cli:foo')).to.not.be.undefined;
        expect(envBuilder.getEnvironment().get('jhipster-cli-shared:foo')).to.not.be.undefined;
        expect(envBuilder.getEnvironment().get('jhipster-cli-shared:bar')).to.not.be.undefined;
      });
    });
  });

  describe('_loadSharedOptions', () => {
    let envBuilder;
    beforeEach(async () => {
      // Use localOnly to lookup at local node_modules only to improve lookup speed.
      envBuilder = await EnvironmentBuilder.create()._loadBlueprints()._lookupBlueprints({ localOnly: true })._loadSharedOptions();
    });
    describe('with multiple blueprints', () => {
      let oldCwd;
      let oldArgv;

      before(() => {
        oldArgv = process.argv;
        oldCwd = testInTempDir(tmpdir => {
          lnYeoman(tmpdir);
          copyBlueprint(getTemplatePath('cli/blueprint-cli'), tmpdir, 'cli');
          copyBlueprint(getTemplatePath('cli/blueprint-cli-shared'), tmpdir, 'cli-shared');
        }, true);

        process.argv = ['--blueprints', 'cli,cli-shared'];
      });
      after(() => {
        process.argv = oldArgv;
        revertTempDir(oldCwd);
      });

      it('should load sharedOptions', () => {
        expect(envBuilder.getEnvironment().sharedOptions.fooBar.includes('fooValue')).to.be.true;
        expect(envBuilder.getEnvironment().sharedOptions.single).to.be.true;
      });

      it('should merge sharedOptions', () => {
        expect(envBuilder.getEnvironment().sharedOptions.fooBar.includes('fooValue')).to.be.true;
        expect(envBuilder.getEnvironment().sharedOptions.fooBar.includes('barValue')).to.be.true;
      });
    });
  });

  describe('yeoman-test integration', () => {
    before(() => {
      sinon.spy(EnvironmentBuilder.prototype, 'getEnvironment');
    });
    after(() => {
      EnvironmentBuilder.prototype.getEnvironment.restore();
    });
    it('calls getEnvironment', () => {
      return helpers
        .create('jhipster:info', { cwd: process.cwd(), autoCleanup: false }, { createEnv: EnvironmentBuilder.createEnv })
        .run(() => {
          expect(EnvironmentBuilder.prototype.getEnvironment.callCount).to.be.equal(1);
        });
    });
  });
});
