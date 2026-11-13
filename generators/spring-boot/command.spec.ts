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

import command from './command.ts';

const devDatabaseChoices = (prodDatabaseType?: string) => {
  const prompt = command.configs.devDatabaseType.prompt as (gen: unknown) => {
    choices: (answers: unknown) => { value: string; name: string }[];
  };
  return prompt({ jhipsterConfigWithDefaults: { databaseType: 'sql', prodDatabaseType } }).choices({});
};

describe('command - spring-boot', () => {
  describe('the development database choices', () => {
    it('should keep a supported production database first', () => {
      expect(devDatabaseChoices('postgresql')).toEqual([
        { value: 'postgresql', name: 'PostgreSQL (requires Docker or manually configured database)' },
        { value: 'h2Disk', name: 'H2 with disk-based persistence' },
        { value: 'h2Memory', name: 'H2 with in-memory persistence' },
      ]);
    });

    it('should keep the relational database of a blueprint by its own value', () => {
      expect(devDatabaseChoices('sqlite')).toEqual([
        { value: 'sqlite', name: 'sqlite (requires Docker or manually configured database)' },
        { value: 'h2Disk', name: 'H2 with disk-based persistence' },
        { value: 'h2Memory', name: 'H2 with in-memory persistence' },
      ]);
    });

    it('should only ask for a temporary database without a production database', () => {
      expect(devDatabaseChoices()).toEqual([
        { value: 'h2Disk', name: 'H2 with disk-based persistence' },
        { value: 'h2Memory', name: 'H2 with in-memory persistence' },
      ]);
    });
  });
});
