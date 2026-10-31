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

import { lookupGenerators } from '../../../lib/utils/index.ts';

import { detectChanges, isKubernetesOnly, noChanges } from './git-changes.ts';

describe('git-changes', () => {
  for (const generator of [
    ...lookupGenerators().filter(ns => !ns.includes('/generators/') || ns.includes('/spring-boot/generators/')),
    '.github/actions/sonar/any-file.txt',
  ]) {
    describe(generator, () => {
      it(`should match changes snapshot`, async () => {
        expect(detectChanges([generator])).toMatchSnapshot();
      });
    });
  }

  describe('isKubernetesOnly', () => {
    it('should accept the files of the Kubernetes generators only', () => {
      expect(isKubernetesOnly(['generators/kubernetes/index.ts', 'generators/kubernetes/generators/knative/generator.ts'])).toBe(true);
      expect(isKubernetesOnly(['generators/kubernetes/generators/helm/index.ts'])).toBe(true);
      expect(isKubernetesOnly(['generators/kubernetes/index.ts', 'generators/vue/index.ts'])).toBe(false);
      expect(isKubernetesOnly([])).toBe(false);
    });
  });

  describe('noChanges', () => {
    it('should have no area changed', () => {
      expect(Object.values(noChanges()).some(Boolean)).toBe(false);
    });
  });
});
