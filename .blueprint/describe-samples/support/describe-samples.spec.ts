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

import { type SampleGroupSummary, describeSample, describeSampleGroup, describeSampleGroups } from './describe-samples.ts';

describe('describe-samples - support', () => {
  // The nested objects of the samples of a group, matched by their type only, so the snapshot shows their shape.
  const shapeOf = (description: object) =>
    Object.fromEntries(
      Object.entries(description)
        .filter(([_key, value]) => value && typeof value === 'object')
        .map(([key, value]) => [key, expect.any(Array.isArray(value) ? Array : Object)]),
    );

  describe('describeSampleGroups', () => {
    let groups: Record<string, SampleGroupSummary>;

    before(() => {
      groups = describeSampleGroups();
    });

    // A change of the samples groups, or of their samples, shows here.
    it('should match the samples groups and their samples', () => {
      expect(groups).toMatchSnapshot();
    });
  });

  describe('describeSampleGroup', () => {
    it('should match the samples of a group', () => {
      const group = describeSampleGroup('angular');
      expect(group).toMatchSnapshot({
        samples: Object.fromEntries(Object.entries(group.samples).map(([name, sample]) => [name, shapeOf(sample)])),
      });
    });

    it('should fail for an unknown group', () => {
      expect(() => describeSampleGroup('unknown')).toThrow(/Samples group unknown not found/);
    });
  });

  describe('describeSample', () => {
    it('should match a sample', () => {
      // The files copied to the project shown in full.
      expect(describeSample('ng-default')).toMatchSnapshot();
    });

    it('should fail for an unknown sample', () => {
      expect(() => describeSample('unknown')).toThrow(/^Sample unknown not found, expected one of .*\bng-default\b/);
    });
  });
});
