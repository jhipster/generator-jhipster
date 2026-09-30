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

import { customizeJHipsterNamespace } from './lookups.ts';

describe('resolver - lookups', () => {
  describe('customizeJHipsterNamespace', () => {
    it('should keep the jhipster prefix', () => {
      expect(customizeJHipsterNamespace('jhipster:app')).toBe('jhipster:app');
    });
    it('should replace the prefix derived from another package folder name', () => {
      expect(customizeJHipsterNamespace('jhipster-9.4.0:app')).toBe('jhipster:app');
    });
    it('should flatten nested generators', () => {
      expect(customizeJHipsterNamespace('generator-jhipster-worktree:spring-boot:generators:cache')).toBe('jhipster:spring-boot:cache');
    });
    it('should keep undefined', () => {
      expect(customizeJHipsterNamespace(undefined)).toBeUndefined();
    });
  });
});
