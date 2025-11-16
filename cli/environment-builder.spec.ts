/**
 * Copyright 2013-2025 the original author or authors from the JHipster project.
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

import { after, before, beforeEach, describe, expect as jestExpect, it } from 'esmocha';
import assert from 'node:assert';
import fs from 'node:fs';

import { expect } from 'chai';
import sinon from 'sinon';

import { createBlueprintFiles, defaultHelpers as helpers } from '../lib/testing/index.ts';

import EnvironmentBuilder from './environment-builder.ts';

const cliBlueprintFiles = {
  'cli/commands.js': `export default {
  foo: {
    blueprint: 'generator-jhipster-cli',
    description: 'Create a new foo.',
    options: [
      {
        option: '--foo',
        description: 'foo description',
      },
    ],
  },
};
`,
  'cli/sharedOptions.js': `export default {
  fooBar: 'barValue',
};
`,
  'generators/foo/index.js': `export const createGenerator = async env => {
  const BaseGenerator = await env.requireGenerator('jhipster:base');
  return class extends BaseGenerator {
    get [BaseGenerator.INITIALIZING]() {
      /* eslint-disable no-console */
      console.log('Running foo');
      if (this.options.fooBar) {
        /* eslint-disable no-console */
        console.log('Running bar');
        console.log(this.options.fooBar);
      }
    }
  };
};

export const command = {
  configs: {
    fooBar: {
      cli: {
        description: 'Sample option',
        type: Boolean,
      },
      scope: 'none',
    },
  },
};
`,
};

const cliSharedBlueprintFiles = {
  'cli/commands.js': `export default {
  bar: {
    blueprint: 'generator-jhipster-cli-shared',
    description: 'Create a new bar.',
  },
};
`,
  'cli/sharedOptions.js': `export default {
  fooBar: 'fooValue',
  single: true,
};
`,
  'generators/bar/index.js': `export const createGenerator = async env => {
  const BaseGenerator = await env.requireGenerator('jhipster:base');
  return class extends BaseGenerator {
    get [BaseGenerator.INITIALIZING]() {}
  };
};

export const command = {
  configs: {
    foo: {
      cli: {
        description: 'foo description',
        type: Boolean,
      },
      scope: 'none',
    },
  },
};
`,
};

describe('cli - EnvironmentBuilder', () => {
  describe('create', () => {
    let envBuilder: any;
    before(async () => {
      await helpers.prepareTemporaryDir();
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
    let createSpy: sinon.SinonSpy;
    let _lookupJHipsterSpy: sinon.SinonSpy;
    let _loadBlueprintsSpy: sinon.SinonSpy;
    let _lookupBlueprintsSpy: sinon.SinonSpy;

    beforeEach(async () => {
      await helpers.prepareTemporaryDir();
      createSpy = sinon.spy(EnvironmentBuilder, 'create');
      _lookupJHipsterSpy = sinon.spy(EnvironmentBuilder.prototype, '_lookupJHipster');
      _loadBlueprintsSpy = sinon.spy(EnvironmentBuilder.prototype, '_loadBlueprints');
      _lookupBlueprintsSpy = sinon.spy(EnvironmentBuilder.prototype, '_lookupBlueprints');
      // Use localOnly to lookup at local node_modules only to improve lookup speed.
      await EnvironmentBuilder.createDefaultBuilder();
    });
    afterEach(() => {
      createSpy.restore();
      _lookupJHipsterSpy.restore();
      _loadBlueprintsSpy.restore();
      _lookupBlueprintsSpy.restore();
    });
    it('should call create, _lookupJHipster, _loadBlueprints and _lookupBlueprints', () => {
      expect(createSpy.callCount).to.be.equal(1);
      expect(_lookupJHipsterSpy.callCount).to.be.equal(1);
      expect(_loadBlueprintsSpy.callCount).to.be.equal(1);
      expect(_lookupBlueprintsSpy.callCount).to.be.equal(1);
    });
  });

  describe('_loadBlueprints', () => {
    let envBuilder: EnvironmentBuilder;
    beforeEach(() => {
      // @ts-expect-error
      envBuilder = EnvironmentBuilder.create([])._loadBlueprints();
    });
    describe('when there is no .yo-rc.json', () => {
      let blueprintsWithVersion: typeof envBuilder._blueprintsWithVersion;

      before(async () => {
        await helpers.prepareTemporaryDir();
        assert(!fs.existsSync('.yo-rc.json'));
      });
      beforeEach(() => {
        blueprintsWithVersion = envBuilder._blueprintsWithVersion;
      });

      it('returns an empty object', () => {
        expect(blueprintsWithVersion).to.deep.equal({});
      });
    });

    describe('when blueprints were passed by command', () => {
      let oldArgv: string[];
      let blueprintsWithVersion: typeof envBuilder._blueprintsWithVersion;

      before(async () => {
        await helpers.prepareTemporaryDir();
        oldArgv = process.argv;
        process.argv = ['--blueprints', 'vuejs,dotnet'];
        assert(!fs.existsSync('.yo-rc.json'));
      });
      after(() => {
        process.argv = oldArgv;
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
      let blueprintsWithVersion: typeof envBuilder._blueprintsWithVersion;

      before(async () => {
        await helpers.prepareTemporaryDir();
        const yoRcContent = {
          'generator-jhipster': {
            blueprints: [],
          },
        };
        fs.writeFileSync('.yo-rc.json', JSON.stringify(yoRcContent));
      });
      beforeEach(() => {
        blueprintsWithVersion = envBuilder._blueprintsWithVersion;
      });

      it('returns an empty object', () => {
        expect(blueprintsWithVersion).to.deep.equal({});
      });
    });

    describe('when there are blueprints on .yo-rc.json', () => {
      let blueprintsWithVersion: typeof envBuilder._blueprintsWithVersion;

      before(async () => {
        await helpers.prepareTemporaryDir();
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
      let oldArgv: string[];
      let blueprintsWithVersion: typeof envBuilder._blueprintsWithVersion;

      before(async () => {
        await helpers.prepareTemporaryDir();
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
        process.argv = oldArgv;
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
    let envBuilder: any;
    beforeEach(async () => {
      // Use localOnly to lookup at local node_modules only to improve lookup speed.
      envBuilder = EnvironmentBuilder.create();
      await envBuilder._loadBlueprints();
      await envBuilder._lookupBlueprints({ localOnly: true });
    });
    describe('with multiple blueprints', () => {
      let oldArgv: string[];

      before(async () => {
        await helpers
          .prepareTemporaryDir()
          .withFiles(createBlueprintFiles('generator-jhipster-cli', { generator: ['foo'] }))
          .withFiles(createBlueprintFiles('generator-jhipster-cli-shared', { generator: ['foo', 'bar'] }))
          .commitFiles();
        oldArgv = process.argv;

        process.argv = ['--blueprints', 'cli,cli-shared'];
      });
      after(() => {
        process.argv = oldArgv;
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
    let envBuilder: any;
    beforeEach(async () => {
      // Use localOnly to lookup at local node_modules only to improve lookup speed.
      // @ts-expect-error
      envBuilder = await EnvironmentBuilder.create()._loadBlueprints()._lookupBlueprints({ localOnly: true });
      await envBuilder._loadSharedOptions();
    });
    describe('with multiple blueprints', () => {
      let oldArgv: string[];

      before(async () => {
        await helpers
          .prepareTemporaryDir()
          .withFiles(createBlueprintFiles('generator-jhipster-cli', { files: cliBlueprintFiles }))
          .withFiles(createBlueprintFiles('generator-jhipster-cli-shared', { files: cliSharedBlueprintFiles }))
          .commitFiles();
        oldArgv = process.argv;

        process.argv = ['--blueprints', 'cli,cli-shared'];
      });
      after(() => {
        process.argv = oldArgv;
      });

      it('should load sharedOptions', () => {
        jestExpect(envBuilder.getEnvironment().sharedOptions.fooBar).toMatchObject(jestExpect.arrayContaining(['fooValue']));
        expect(envBuilder.getEnvironment().sharedOptions.single).to.be.true;
      });

      it('should merge sharedOptions', () => {
        jestExpect(envBuilder.getEnvironment().sharedOptions.fooBar).toMatchObject(jestExpect.arrayContaining(['fooValue']));
        jestExpect(envBuilder.getEnvironment().sharedOptions.fooBar).toMatchObject(jestExpect.arrayContaining(['barValue']));
      });
    });
  });
});
