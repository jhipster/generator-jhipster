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

import {
  describeCommand,
  describeGenerators,
  findConfigOwners,
  formatCommandDescription,
  formatConfigOwners,
  formatGenerators,
} from './describe.ts';

describe('command - describe', () => {
  it('should list the generators with the usage description', async () => {
    const generators = await describeGenerators();
    expect(generators.map(({ namespace }) => namespace)).toEqual(expect.arrayContaining(['app', 'info', 'spring-boot:cache']));
    expect(generators.find(({ namespace }) => namespace === 'info')?.description).toBe(
      'Display information about your current project and system.',
    );
    expect(formatGenerators(generators)).toContain('info  ');
  });

  it('should prefer the passed descriptions', async () => {
    const generators = await describeGenerators({ descriptions: { info: 'custom' } });
    expect(generators.find(({ namespace }) => namespace === 'info')?.description).toBe('custom');
  });

  it('should describe a command', async () => {
    const command = await describeCommand('spring-boot');
    expect(command.namespace).toBe('spring-boot');
    expect(command.imports).toContain('java');
    expect(command.configs.find(({ name }) => name === 'reactive')).toMatchObject({
      owner: 'spring-boot',
      scope: 'storage',
      cliOption: '--reactive',
      type: 'Boolean',
    });
    expect(command.configs.some(({ name }) => name === 'databaseType')).toBe(false);
    expect(command.configs.find(({ name }) => name === 'messageBroker')).toMatchObject({
      choices: ['kafka', 'pulsar', 'no'],
      derivedProperties: ['messageBrokerKafka', 'messageBrokerPulsar', 'messageBrokerNo', 'messageBrokerAny'],
      jdl: true,
    });
  });

  it('should include the imported commands', async () => {
    const command = await describeCommand('app', { includeImports: true });
    expect(command.configs.find(({ name }) => name === 'databaseType')).toMatchObject({
      owner: 'server',
      choices: expect.arrayContaining(['sql', 'mongodb', 'no']),
    });
    expect(command.configs.some(({ name }) => name === 'clientFramework')).toBe(true);
  });

  it('should accept the jhipster prefix and fail for unknown generators', async () => {
    expect((await describeCommand('jhipster:info')).namespace).toBe('info');
    await expect(describeCommand('unknown')).rejects.toThrow('Generator unknown not found');
  });

  it('should find the config owners', async () => {
    const owners = await findConfigOwners('databaseType');
    expect(owners.owners.map(({ owner }) => owner)).toEqual(['server']);
    expect(formatConfigOwners(owners)).toContain('databaseType is declared by: server');
    expect(formatConfigOwners(await findConfigOwners('unknown'))).toBe('no command declares the config unknown');
  });

  it('should format a command', async () => {
    const formatted = formatCommandDescription(await describeCommand('info'));
    expect(formatted).toMatchInlineSnapshot(`
"info: Display information about your current project and system.

no configs"
`);
    const prompts = formatCommandDescription(await describeCommand('spring-boot'), { prompts: true });
    expect(prompts).toContain('prompts, in the order they are asked:');
    expect(prompts).toContain('\n  reactive: ');
    expect(prompts.indexOf('\n  reactive: ')).toBeLessThan(prompts.indexOf('\n  authenticationType: '));
    const table = formatCommandDescription(await describeCommand('spring-boot'));
    expect(table).toContain('config');
    expect(table).toMatch(/\nmessageBroker\s+--message-broker <value>\s+storage\s+String\s+kafka, pulsar, no/);
    expect(table).toContain('derived properties:');
  });
});
