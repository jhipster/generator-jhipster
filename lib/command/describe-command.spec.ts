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

import type { GeneratorMeta } from '@yeoman/types';

import { lookupGeneratorCommands } from '../resolver/generator-commands.ts';
import { resolveGeneratorDependencies } from '../resolver/generator-dependencies.ts';

import { describeCommand, findConfigOwners } from './describe-command.ts';
import type { JHipsterCommandDefinition } from './types.ts';

/** getGeneratorMeta backed by the generators of this repository plus fake blueprint generators. */
const metaLookup = async (blueprints: Record<string, JHipsterCommandDefinition> = {}) => {
  const generators = await lookupGeneratorCommands();
  return (namespace: string): GeneratorMeta | undefined => {
    const command = blueprints[namespace] ?? generators.find(generator => `jhipster:${generator.namespace}` === namespace)?.command;
    return command ? ({ namespace, importModule: async () => ({ command }) } as unknown as GeneratorMeta) : undefined;
  };
};

const resolve = async (
  generatorNames: string[],
  blueprints?: Record<string, JHipsterCommandDefinition>,
  blueprintNamespaces: string[] = [],
) => resolveGeneratorDependencies(generatorNames, { getGeneratorMeta: await metaLookup(blueprints), blueprintNamespaces });

describe('command - describe command', () => {
  describe('describeCommand', () => {
    it('should describe a command with the configs of its dependencies', async () => {
      const command = describeCommand({ namespace: 'spring-boot', dependencies: await resolve(['spring-boot']) });
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
      expect(command.configs.find(({ name }) => name === 'buildTool')?.owner).toBe('jhipster:java-simple-application:build-tool');
    });

    it('should describe the application configuration through the imports', async () => {
      const command = describeCommand({ namespace: 'app', dependencies: await resolve(['bootstrap', 'app']) });
      expect(command.configs.find(({ name }) => name === 'databaseType')).toMatchObject({
        owner: 'server',
        choices: expect.arrayContaining(['sql', 'mongodb', 'no']),
      });
      expect(command.configs.some(({ name }) => name === 'clientFramework')).toBe(true);
    });

    it('should keep the last declaration of a config and mark blueprint configs', async () => {
      const blueprint = {
        configs: { skipGit: { description: 'overridden', cli: { type: Boolean }, scope: 'storage' } },
        import: [],
      } as const satisfies JHipsterCommandDefinition;
      const command = describeCommand({
        namespace: 'git',
        dependencies: await resolve(['git'], { 'jhipster-foo:git': blueprint }, ['jhipster-foo']),
      });
      const skipGit = command.configs.find(({ name }) => name === 'skipGit');
      expect(skipGit).toMatchObject({ owner: 'git', description: 'Skip git repository initialization' });
      expect(command.configs.find(({ name }) => name === 'skipGit')?.blueprint).toBeUndefined();
      // Positioned at the last declaration, the git command order.
      expect(command.configs.map(({ name }) => name).slice(0, 2)).toEqual(['skipGit', 'forceGit']);
    });
  });

  describe('findConfigOwners', () => {
    it('should find the config owners', async () => {
      const owners = await findConfigOwners('databaseType');
      expect(owners.owners.map(({ owner }) => owner)).toEqual(['server']);
      expect((await findConfigOwners('unknown')).owners).toEqual([]);
    });
  });
});
