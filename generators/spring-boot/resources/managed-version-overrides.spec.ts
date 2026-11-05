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

import { getManagedVersionOverrides, isOlderPatchVersion } from './managed-version-overrides.ts';

describe('generator - spring-boot - managed version overrides', () => {
  describe('isOlderPatchVersion', () => {
    it('should compare patch releases of the same line', () => {
      expect(isOlderPatchVersion('3.1.7', '3.1.8')).toBe(true);
      expect(isOlderPatchVersion('3.1.8', '3.1.8')).toBe(false);
      expect(isOlderPatchVersion('3.1.9', '3.1.8')).toBe(false);
    });

    it('should not cross a minor or major line', () => {
      expect(isOlderPatchVersion('3.1.7', '3.2.0')).toBe(false);
      expect(isOlderPatchVersion('2.21.7', '3.1.8')).toBe(false);
    });

    it('should accept Maven versions that are not semver', () => {
      expect(isOlderPatchVersion('3.5.10.Final', '3.5.11.Final')).toBe(true);
      expect(isOlderPatchVersion('2.13.4', '2.13.4.20221013')).toBe(false);
      expect(isOlderPatchVersion('unknown', '3.5.11')).toBe(false);
    });
  });

  describe('getManagedVersionOverrides', () => {
    it('should return the properties to override', () => {
      expect(
        getManagedVersionOverrides({
          managedProperties: { 'jackson-bom.version': '3.1.7', 'jackson-2-bom.version': '2.21.8', 'mariadb.version': '3.5.10' },
          dependencies: { 'jackson-bom': '3.1.8', 'jackson-2-bom': '2.21.8', mariadb: '3.5.11' },
        }),
      ).toEqual([
        { property: 'jackson-bom.version', value: '3.1.8' },
        { property: 'mariadb.version', value: '3.5.11' },
      ]);
    });

    it('should skip missing versions and names that are not requested', () => {
      expect(
        getManagedVersionOverrides({
          names: ['jackson-bom', 'mariadb'],
          managedProperties: { 'jackson-bom.version': '3.1.7', 'jackson-2-bom.version': '2.21.7' },
          dependencies: { 'jackson-2-bom': '2.21.8', mariadb: '3.5.11' },
        }),
      ).toEqual([]);
    });
  });
});
