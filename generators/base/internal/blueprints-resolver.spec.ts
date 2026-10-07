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
import { before, describe, expect, it } from 'esmocha';

import type BaseGenerator from '../generator.ts';

import { type BlueprintsResolver, getBlueprintsResolver } from './blueprints-resolver.ts';

import { defaultHelpers as helpers, runResult } from '#testing';

describe('generator - base - internal - blueprints-resolver', () => {
  describe('with a blueprint option and a blueprint in the config', () => {
    let generator: BaseGenerator;
    let resolver: BlueprintsResolver;

    before(async () => {
      await helpers
        .runJHipster('project-name')
        .withMockedGenerators(['jhipster-foo:other', 'jhipster-bar:other', 'jhipster-baz:other'])
        .withJHipsterConfig({ blueprints: [{ name: 'generator-jhipster-bar' }] })
        .withOptions({ blueprints: 'foo' });
      generator = runResult.generator as unknown as BaseGenerator;
      resolver = getBlueprintsResolver(generator);
    });

    it('should be the resolver the generators of the destination composed with', async () => {
      expect(await resolver.getBlueprints()).toEqual(['generator-jhipster-foo', 'generator-jhipster-bar']);
    });

    it('should store the blueprints in the config', () => {
      expect(generator.config.get('blueprints')).toEqual([{ name: 'generator-jhipster-foo' }, { name: 'generator-jhipster-bar' }]);
    });

    it('should resolve them again when the blueprints of the config change, the option merged', async () => {
      generator.config.set('blueprints', [{ name: 'generator-jhipster-baz' }]);
      expect(await resolver.getBlueprints()).toEqual(['generator-jhipster-foo', 'generator-jhipster-baz']);
      expect(generator.config.get('blueprints')).toEqual([{ name: 'generator-jhipster-foo' }, { name: 'generator-jhipster-baz' }]);
    });

    it('should keep the blueprints of the option when the config loses its blueprints', async () => {
      generator.config.delete('blueprints');
      expect(await resolver.getBlueprints()).toEqual(['generator-jhipster-foo']);
      expect(generator.config.get('blueprints')).toEqual([{ name: 'generator-jhipster-foo' }]);
    });
  });
});
