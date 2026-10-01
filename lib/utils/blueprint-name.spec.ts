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

import { normalizeBlueprintName } from './blueprint-name.ts';

describe('utils - blueprint-name', () => {
  describe('::normalizeBlueprintName', () => {
    it('adds generator-jhipster prefix if it is absent', () => {
      const generatorName = normalizeBlueprintName('foo');
      expect(generatorName).toBe('generator-jhipster-foo');
    });
    it('keeps generator-jhipster prefix if it is present', () => {
      const generatorName = normalizeBlueprintName('generator-jhipster-foo');
      expect(generatorName).toBe('generator-jhipster-foo');
    });
    it('adds generator-jhipster prefix for scoped package', () => {
      const generatorName = normalizeBlueprintName('@corp/foo');
      expect(generatorName).toBe('@corp/generator-jhipster-foo');
    });
  });
});
