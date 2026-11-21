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
import { describe, expect, it } from 'expect-node';

import { resolveGeneratorNamespace } from './namespace.ts';

describe('resolver - namespace', () => {
  describe('resolveGeneratorNamespace', () => {
    it('should resolve a generator of the same package', () => {
      expect(resolveGeneratorNamespace(':node-server', { from: 'jhipster-foo:server' })).toBe('jhipster-foo:node-server');
      expect(resolveGeneratorNamespace(':node-server:bootstrap', { from: 'jhipster-foo:server:bootstrap' })).toBe(
        'jhipster-foo:node-server:bootstrap',
      );
      expect(resolveGeneratorNamespace(':server', { from: 'jhipster:app' })).toBe('jhipster:server');
    });

    it('should keep the scope of the package', () => {
      expect(resolveGeneratorNamespace(':node-server', { from: '@scope/jhipster-foo:server' })).toBe('@scope/jhipster-foo:node-server');
    });

    it('should prefix a name without a package', () => {
      expect(resolveGeneratorNamespace('server', { from: 'jhipster-foo:app' })).toBe('jhipster:server');
      expect(resolveGeneratorNamespace('server', { namespacePrefix: 'jhipster-foo' })).toBe('jhipster-foo:server');
    });

    it('should keep a namespace', () => {
      expect(resolveGeneratorNamespace('jhipster-bar:server', { from: 'jhipster-foo:app' })).toBe('jhipster-bar:server');
    });

    it('should fail for a generator of the same package without the generator naming it', () => {
      expect(() => resolveGeneratorNamespace(':server')).toThrow('The generator :server is of the package of the generator naming it');
    });
  });
});
