/**
 * Copyright 2013-2026 the original author or authors from the JHipster project.
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
import { before, describe, expect, it } from 'expect-node';
import { join } from 'node:path';

import { resolveJDLDefinitionsOf } from '../../generators/jdl/internal/jdl-definitions.ts';

import { getGeneratorAlias } from './blueprint-aliases.ts';
import { GeneratorsResolver } from './blueprints.ts';

import { createBlueprintFiles, defaultHelpers as helpers, result as runResult } from '#testing';

const taken = 'generator-jhipster-taken';

/** A generator of the package taken, writing a file named after the namespace it runs in. */
const nodeServerGenerator = `export const createGenerator = async env => {
  const BaseGenerator = await env.requireGenerator('jhipster:base');
  return class extends BaseGenerator {
    constructor(args, options, features) {
      super(args, options, { ...features, storeBlueprintVersion: true });
    }

    get [BaseGenerator.COMPOSING]() {
      return {
        async composeBootstrap() {
          await this.dependsOnJHipster(':node-server:bootstrap');
        },
      };
    }

    get [BaseGenerator.POST_WRITING]() {
      return {
        async write({ control }) {
          this.writeDestination(this.options.namespace.replaceAll(':', '-') + '.txt', String(this.blueprintConfig.nodeOption));
          await control.cleanupBlueprintFiles({ '2.0.0': ['removed.txt'] });
        },
      };
    }
  };
};
`;

const takenFiles = createBlueprintFiles(taken, {
  packageJson: { version: '2.0.0' },
  generator: 'git',
  generatorContent: `export const createGenerator = async env => {
  const BaseGenerator = await env.requireGenerator('jhipster:base');
  return class extends BaseGenerator {
    get [BaseGenerator.COMPOSING]() {
      return {
        async composeNodeServer() {
          await this.composeWithJHipster(':node-server');
        },
      };
    }
  };
};
`,
  files: {
    'generators/node-server/index.js': nodeServerGenerator,
    'generators/node-server/command.js': `export default { configs: { nodeOption: { cli: { type: String }, scope: 'blueprint' } } };
`,
    'generators/node-server/generators/bootstrap/index.js': `export const createGenerator = async env => {
  const BaseGenerator = await env.requireGenerator('jhipster:base');
  return class extends BaseGenerator {
    get [BaseGenerator.INITIALIZING]() {
      return {};
    }
  };
};
`,
    'generators/app/index.js': `export const createGenerator = async env => env.requireGenerator('jhipster:base');
`,
    'generators/app/command.js': `export default {
  configs: { fooFramework: { jdl: { type: 'string', tokenType: 'NAME' }, choices: ['foo'], scope: 'storage' } },
};
`,
  },
});

/** A blueprint taking the package, with a generator of its own. */
const takingFiles = (blueprintPackage: string) =>
  createBlueprintFiles(blueprintPackage, { packageJson: { version: '1.5.0', jhipster: { aliases: [taken] } }, generator: 'info' });

describe('resolver - blueprint aliases', () => {
  describe('with a blueprint taking a package', () => {
    before(async () => {
      await helpers
        .runJHipster('git')
        .withFiles({ ...takenFiles, ...takingFiles('generator-jhipster-taker'), 'removed.txt': 'removed' })
        .withFiles({ '.yo-rc.json': { 'generator-jhipster-taker': { aliasVersions: { [taken]: '1.0.0' } } } })
        .withLookups({ localOnly: true })
        .commitFiles()
        .withOptions({ blueprints: 'taker', nodeOption: 'bar', skipGit: true, reproducibleTests: false });
    });

    it('should register the generators the blueprint lacks under its namespace, the nested ones too', () => {
      for (const namespace of ['jhipster-taker:git', 'jhipster-taker:node-server', 'jhipster-taker:node-server:bootstrap']) {
        expect(getGeneratorAlias(runResult.env.getGeneratorMeta(namespace))).toMatchObject({ aliasOf: taken });
      }
      expect(getGeneratorAlias(runResult.env.getGeneratorMeta('jhipster-taker:info'))).toBeUndefined();
    });

    it('should keep the package path of the blueprint', () => {
      expect(runResult.env.getPackagePath('jhipster-taker')).toBe(join(runResult.cwd, 'node_modules/generator-jhipster-taker'));
    });

    it('should compose the generators of the package by :<generator> in the namespace of the blueprint', () => {
      runResult.assertFileContent('jhipster-taker-node-server.txt', 'bar');
    });

    it('should store the configs and the version of the package in the section of the blueprint', () => {
      runResult.assertJsonFileContent('.yo-rc.json', {
        'generator-jhipster-taker': { nodeOption: 'bar', aliasVersions: { [taken]: '2.0.0' } },
      });
      runResult.assertNoJsonFileContent('.yo-rc.json', { 'generator-jhipster-taker': { blueprintVersion: '2.0.0' } });
    });

    it('should read the old version of the package from the section of the blueprint', () => {
      runResult.assertNoFile('removed.txt');
    });
  });

  describe('with two blueprints taking a package declared too', () => {
    before(async () => {
      await helpers
        .runJHipster('git')
        .withFiles({ ...takenFiles, ...takingFiles('generator-jhipster-taker'), ...takingFiles('generator-jhipster-other-taker') })
        .withLookups({ localOnly: true })
        .commitFiles()
        .withOptions({ blueprints: 'taker,other-taker,taken', nodeOption: 'bar', skipGit: true, reproducibleTests: false });
    });

    it('should run the generators of the package in the namespace of each one', () => {
      runResult.assertFile(['jhipster-taker-node-server.txt', 'jhipster-other-taker-node-server.txt', 'jhipster-taken-node-server.txt']);
    });

    it('should store the version of the package in the section of each one', () => {
      runResult.assertJsonFileContent('.yo-rc.json', {
        'generator-jhipster-taker': { aliasVersions: { [taken]: '2.0.0' } },
        'generator-jhipster-other-taker': { aliasVersions: { [taken]: '2.0.0' } },
        [taken]: { blueprintVersion: '2.0.0' },
      });
      runResult.assertNoJsonFileContent('.yo-rc.json', { [taken]: { aliasVersions: {} } });
    });
  });

  describe('the JDL definitions', () => {
    it('should have the configs of the generators taken', async () => {
      await helpers
        .prepareTemporaryDir()
        .withFiles({ ...takenFiles, ...takingFiles('generator-jhipster-taker') })
        .commitFiles();
      const resolver = new GeneratorsResolver();
      resolver.lookupBlueprints(['jhipster-taker'], { packagePatterns: ['generator-jhipster-taker'], localOnly: true });
      const definitions = resolveJDLDefinitionsOf({
        blueprints: 'generator-jhipster-taker',
        entrypointGenerator: 'app',
        getGeneratorMeta: namespace => resolver.getGeneratorMeta(namespace),
      });
      expect(definitions.application?.optionsValues).toMatchObject({ fooFramework: { foo: 'foo' } });
    });
  });
});
