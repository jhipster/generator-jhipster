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
import { afterEach, beforeEach, describe, esmocha, expect, it } from 'esmocha';

import type Environment from 'yeoman-environment';

import type { CommandDescription } from '../lib/command/describe-command.ts';
import { getJHipsterStore } from '../lib/resolver/lookups.ts';

import describeCliCommand from './describe.ts';

const store = getJHipsterStore();
// What the command reads from the environment: the registered generators.
const env = { getGeneratorMeta: (namespace: string) => store.getMeta(namespace) } as unknown as Environment;

describe('cli - describe', () => {
  let printed: string[];

  beforeEach(() => {
    printed = [];
    esmocha.spyOn(console, 'log').mockImplementation((value: string) => {
      printed.push(value);
    });
  });

  afterEach(() => {
    esmocha.restoreAllMocks();
  });

  const describeJson = async (generator: string, options: { imports?: boolean } = {}): Promise<CommandDescription> => {
    await describeCliCommand([generator], { json: true, ...options }, env);
    return JSON.parse(printed.join('\n'));
  };

  it('should name the generators without the jhipster prefix', async () => {
    const { namespace, dependencies, configs } = await describeJson('spring-boot');
    expect(namespace).toBe('spring-boot');
    expect(dependencies).toEqual(expect.arrayContaining(['bootstrap', 'spring-boot', 'java', 'spring-boot:cache']));
    expect([...dependencies, ...configs.map(({ owner }) => owner)].filter(name => name.startsWith('jhipster:'))).toEqual([]);
  });

  for (const generator of ['spring-boot:cache', 'jhipster:spring-boot:cache']) {
    it(`should describe the nested generator given as ${generator}`, async () => {
      const { namespace, dependencies, configs } = await describeJson(generator, { imports: false });
      expect(namespace).toBe('spring-boot:cache');
      expect(dependencies).toEqual(['spring-boot:cache']);
      expect(configs.map(({ name }) => name)).toContain('cacheProvider');
      expect(new Set(configs.map(({ owner }) => owner))).toEqual(new Set(['spring-boot:cache']));
    });
  }

  it('should describe a generator given with the prefix like the one given without it', async () => {
    const withoutPrefix = await describeJson('app');
    printed = [];
    expect(await describeJson('jhipster:app')).toEqual(withoutPrefix);
  });

  it('should describe the generators it gives as dependencies', async () => {
    const { dependencies } = await describeJson('spring-boot');
    for (const dependency of dependencies) {
      printed = [];
      expect((await describeJson(dependency, { imports: false })).namespace).toBe(dependency);
    }
  });
});
