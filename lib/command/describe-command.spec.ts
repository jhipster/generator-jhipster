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
import { describe, expect, it } from 'esmocha';

import { Store, type StoreGeneratorMeta } from 'yeoman-environment';

import { getPackageRoot } from '../index.ts';
import { lookupGeneratorCommands } from '../resolver/generator-commands.ts';
import { resolveGeneratorDependencies } from '../resolver/generator-dependencies.ts';
import { customizeNestedNamespace, jhipsterGeneratorsLookup } from '../resolver/lookups.ts';

import { describeCommand, findConfigOwners } from './describe-command.ts';
import type { JHipsterCommandDefinition } from './types.ts';

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
        customizeNamespace: customizeNestedNamespace,
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
});
