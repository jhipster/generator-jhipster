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

import { before, describe, esmocha, expect, it } from 'esmocha';
import { join } from 'node:path';

import { Store, type StoreGeneratorMeta } from 'yeoman-environment';

import { getPackageRoot } from '../index.ts';
import { lookupGeneratorCommands } from '../resolver/generator-commands.ts';
import { resolveGeneratorDependencies } from '../resolver/generator-dependencies.ts';
import { customizeJHipsterNamespace, jhipsterGeneratorsLookup } from '../resolver/lookups.ts';

import {
  type DescribeBlueprints,
  describeCommand,
  describeGenerator,
  findConfigOwners,
  listCommands,
  loadDescribeBlueprints,
} from './describe-command.ts';
import type { JHipsterCommandDefinition } from './types.ts';

import { createBlueprintFiles, defaultHelpers as helpers } from '#testing';

/** getGeneratorMeta backed by the generators of this repository plus fake blueprint generators. */
const metaLookup = (blueprints: Record<string, JHipsterCommandDefinition> = {}) => {
  const generators = lookupGeneratorCommands();
  return (namespace: string): StoreGeneratorMeta | undefined => {
    const command = blueprints[namespace] ?? generators.find(generator => `jhipster:${generator.namespace}` === namespace)?.command;
    return command ? ({ namespace, requireModule: () => ({ command }) } as unknown as StoreGeneratorMeta) : undefined;
  };
};

const resolve = (generatorNames: string[], blueprints?: Record<string, JHipsterCommandDefinition>, blueprintNamespaces: string[] = []) =>
  resolveGeneratorDependencies(generatorNames, { getGeneratorMeta: metaLookup(blueprints), blueprintNamespaces });

describe('command - describe command', () => {
  describe('describeCommand', () => {
    it('should describe a command with the configs of its dependencies', () => {
      const command = describeCommand({ namespace: 'spring-boot', dependencies: resolve(['spring-boot']) });
      expect(command.namespace).toBe('spring-boot');
      expect(command.dependencies).toContain('java');
      expect(command.configs.find(({ name }) => name === 'reactive')).toMatchObject({
        owner: 'spring-boot',
        scope: 'storage',
        cliOption: '--reactive',
        type: 'Boolean',
        prompt: 'Do you want to make it reactive with Spring WebFlux?',
      });
      expect(command.configs.find(({ name }) => name === 'messageBroker')).toMatchObject({
        choices: ['kafka', 'pulsar', 'no'],
        derivedProperties: ['messageBrokerKafka', 'messageBrokerPulsar', 'messageBrokerNo', 'messageBrokerAny'],
        jdl: true,
      });
      expect(command.configs.find(({ name }) => name === 'buildTool')?.owner).toBe('java-simple-application:build-tool');
    });

    it('should give the flags the cli registers, and none for a config that is not an option', () => {
      const { configs } = describeCommand({ namespace: 'app', dependencies: resolve(['bootstrap', 'app']) });
      const cliOption = (config: string) => configs.find(({ name }) => name === config)?.cliOption;
      expect(cliOption('baseName')).toBe('--base-name <value>');
      expect(cliOption('skipClient')).toBe('--skip-client');
      // A list of values.
      expect(cliOption('testFrameworks')).toBe('--test-frameworks <value...>');
      // Internal, and only set by the jdl: the cli registers no option.
      expect(configs.find(({ name }) => name === 'validateBaseName')).toMatchObject({ type: 'Function', cliOption: undefined });
      expect(configs.find(({ name }) => name === 'jhipsterVersion')).toMatchObject({ cliOption: undefined });
    });

    it('should name the generators as the cli does, without the jhipster prefix', () => {
      // A nested generator is imported by its namespace, `jhipster:spring-boot:cache`.
      const dependencies = resolve(['bootstrap', 'spring-boot']);
      expect(dependencies.map(({ namespace }) => namespace)).toContain('jhipster:spring-boot:cache');

      const command = describeCommand({ namespace: 'spring-boot', dependencies });
      expect(command.dependencies).toEqual(expect.arrayContaining(['spring-boot', 'java', 'spring-boot:cache', 'java:domain']));
      const names = [...command.dependencies, ...command.configs.map(({ owner }) => owner)];
      expect(names.filter(name => name.startsWith('jhipster:'))).toEqual([]);
    });

    it('should describe a generator given by its namespace under its cli name', () => {
      const command = describeCommand({ namespace: 'jhipster:spring-boot:cache', dependencies: resolve(['jhipster:spring-boot:cache']) });
      expect(command.namespace).toBe('spring-boot:cache');
      expect(command.dependencies[0]).toBe('spring-boot:cache');
      // The arguments and configs of the command itself are found.
      expect(command.configs.find(({ name }) => name === 'cacheProvider')?.owner).toBe('spring-boot:cache');
    });

    it('should keep the namespace of the generators of a blueprint', () => {
      const blueprint = {
        configs: { fooOption: { cli: { type: Boolean }, scope: 'storage' } },
        import: [],
      } as const satisfies JHipsterCommandDefinition;
      const command = describeCommand({
        namespace: 'git',
        dependencies: resolve(['git'], { 'jhipster-foo:git': blueprint }, ['jhipster-foo']),
      });
      expect(command.dependencies).toEqual(['jhipster-foo:git', 'git']);
      expect(command.configs.find(({ name }) => name === 'fooOption')).toMatchObject({
        owner: 'jhipster-foo:git',
        blueprint: 'jhipster-foo',
      });
    });

    it('should describe the application configuration through the imports', () => {
      const command = describeCommand({ namespace: 'app', dependencies: resolve(['bootstrap', 'app']) });
      expect(command.configs.find(({ name }) => name === 'databaseType')).toMatchObject({
        owner: 'spring-boot',
        choices: expect.arrayContaining(['sql', 'mongodb', 'no']),
      });
      expect(command.configs.some(({ name }) => name === 'clientFramework')).toBe(true);
    });

    it('should keep the last declaration of a config and mark blueprint configs', () => {
      const blueprint = {
        configs: { skipGit: { description: 'overridden', cli: { type: Boolean }, scope: 'storage' } },
        import: [],
      } as const satisfies JHipsterCommandDefinition;
      const command = describeCommand({
        namespace: 'git',
        dependencies: resolve(['git'], { 'jhipster-foo:git': blueprint }, ['jhipster-foo']),
      });
      const skipGit = command.configs.find(({ name }) => name === 'skipGit');
      expect(skipGit).toMatchObject({ owner: 'git', description: 'Skip git repository initialization' });
      expect(command.configs.find(({ name }) => name === 'skipGit')?.blueprint).toBeUndefined();
      // Positioned at the last declaration, which follows the git command order.
      expect(command.configs.map(({ name }) => name).slice(0, 2)).toEqual(['skipGit', 'forceGit']);
    });
  });

  describe('findConfigOwners', () => {
    it('should find the config owners', () => {
      const owners = findConfigOwners('databaseType');
      expect(owners.owners.map(({ owner }) => owner)).toEqual(['server', 'spring-boot']);
      expect(findConfigOwners('unknown').owners).toEqual([]);
    });

    it('should find the config owners of a store, blueprints included', () => {
      const store = new Store();
      store.lookupSync({
        packagePaths: [getPackageRoot()],
        lookups: jhipsterGeneratorsLookup,
        customizeNamespace: customizeJHipsterNamespace,
      });
      const blueprintCommand: JHipsterCommandDefinition = {
        configs: { databaseType: { cli: { type: String }, scope: 'storage' }, blueprintOnly: { cli: { type: Boolean }, scope: 'storage' } },
      };
      store.getGeneratorsMeta()['jhipster-foo:server'] = {
        namespace: 'jhipster-foo:server',
        resolved: '/generator-jhipster-foo/generators/server/index.js',
        requireModule: () => ({ command: blueprintCommand }),
      } as any;

      const owners = findConfigOwners('databaseType', { store });
      expect(owners.owners.map(({ owner }) => owner)).toEqual(['jhipster-foo:server', 'server', 'spring-boot']);
      expect(findConfigOwners('blueprintOnly', { store }).owners.map(({ owner }) => owner)).toEqual(['jhipster-foo:server']);
      // Without a store, only the jhipster generators.
      expect(findConfigOwners('blueprintOnly').owners).toEqual([]);
    });
  });

  describe('with a blueprint', () => {
    const blueprintGenerator = (configs: string) => `export const command = { configs: ${configs} };
export const createGenerator = async env => env.requireGenerator('jhipster:base');
`;
    let store: Store;
    let blueprints: DescribeBlueprints;

    before(async () => {
      await helpers
        .prepareTemporaryDir()
        .withFiles(
          createBlueprintFiles('generator-jhipster-foo', {
            generator: [],
            files: {
              'cli/commands.js': "export default { foo: { desc: 'Foo of the blueprint' } };\n",
              'generators/foo/index.js': blueprintGenerator(
                "{ fooOption: { description: 'Foo option', cli: { type: Boolean }, scope: 'storage' } }",
              ),
              'generators/git/index.js': blueprintGenerator("{ gitOption: { cli: { type: Boolean }, scope: 'storage' } }"),
            },
          }),
        )
        .commitFiles();
      const packagePath = join(process.cwd(), 'node_modules/generator-jhipster-foo');
      store = new Store();
      store.lookupSync({
        packagePaths: [getPackageRoot()],
        lookups: jhipsterGeneratorsLookup,
        customizeNamespace: customizeJHipsterNamespace,
      });
      store.lookupSync({ packagePaths: [packagePath], lookups: ['generators'] });
      blueprints = await loadDescribeBlueprints(store, ['jhipster-foo']);
    });

    it('should load the namespaces and the commands of the blueprints', () => {
      expect(blueprints).toEqual({
        namespaces: ['jhipster-foo'],
        commands: { foo: { desc: 'Foo of the blueprint', blueprint: 'jhipster-foo' } },
      });
    });

    it('should list the commands of the blueprints with the ones of JHipster', () => {
      const commands = listCommands({ blueprints });
      expect(commands).toContainEqual({ namespace: 'foo', description: 'Foo of the blueprint' });
      expect(commands).toContainEqual(expect.objectContaining({ namespace: 'app', default: true }));
      expect(listCommands().map(({ namespace }) => namespace)).not.toContain('foo');
    });

    it('should describe a command of a blueprint under the namespace of the blueprint', () => {
      const description = describeGenerator('foo', { store, blueprints });
      expect(description).toMatchObject({ namespace: 'jhipster-foo:foo', description: 'Foo of the blueprint' });
      expect(description!.dependencies).toEqual(['bootstrap', 'jhipster-foo:foo']);
      expect(description!.configs.find(({ name }) => name === 'fooOption')).toMatchObject({
        owner: 'jhipster-foo:foo',
        description: 'Foo option',
        cliOption: '--foo-option',
      });
    });

    it('should not find a command of a blueprint without the blueprint', () => {
      expect(describeGenerator('foo', { store })).toBeUndefined();
      // The namespace of the generator is enough.
      expect(describeGenerator('jhipster-foo:foo', { store })?.namespace).toBe('jhipster-foo:foo');
    });

    it('should describe a command of JHipster with the generators of the blueprint overriding it', () => {
      const description = describeGenerator('git', { store, blueprints });
      expect(description!.dependencies).toEqual(['bootstrap', 'jhipster-foo:git', 'git']);
      expect(description!.configs.find(({ name }) => name === 'gitOption')).toMatchObject({
        owner: 'jhipster-foo:git',
        blueprint: 'jhipster-foo',
      });
      expect(describeGenerator('git', { store })!.dependencies).toEqual(['bootstrap', 'git']);
      // Only what the command declares itself, without the blueprint.
      expect(describeGenerator('git', { store, blueprints, imports: false })!.dependencies).toEqual(['git']);
    });

    it('should find the config owners in the blueprints', () => {
      expect(findConfigOwners('fooOption', { store }).owners.map(({ owner }) => owner)).toEqual(['jhipster-foo:foo']);
    });
  });

  describe('loadDescribeBlueprints', () => {
    it('should log a blueprint without commands only to the log given', async () => {
      const info = esmocha.spyOn(console, 'info');
      try {
        const log = esmocha.fn<(message: string) => void>();
        const store = { getPackagesPaths: () => ({ 'jhipster-none': ['/none'] }) };
        expect(await loadDescribeBlueprints(store, ['jhipster-none'])).toEqual({ namespaces: ['jhipster-none'], commands: {} });
        await loadDescribeBlueprints(store, ['jhipster-none'], { log });
        expect(log.mock.calls).toEqual([['No custom commands found within blueprint: jhipster-none at /none']]);
        expect(info).not.toHaveBeenCalled();
      } finally {
        info.mockRestore();
      }
    });
  });

  describe('describeGenerator', () => {
    it('should describe the default command given', () => {
      expect(describeGenerator('default', { defaultCommand: 'git', imports: false })?.namespace).toBe('git');
    });

    it('should not describe an unknown generator', () => {
      expect(describeGenerator('unknown')).toBeUndefined();
    });
  });
});
