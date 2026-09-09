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
import { mkdtempSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';

import { resolveDefaultCommand } from './default-command.ts';

describe('resolver - default command', () => {
  it('should default to app', () => {
    expect(resolveDefaultCommand({ cwd: mkdtempSync(join(tmpdir(), 'jhipster-')) })).toBe('app');
  });

  it('should read the defaultCommand of .yo-rc.json', () => {
    const cwd = mkdtempSync(join(tmpdir(), 'jhipster-'));
    writeFileSync(join(cwd, '.yo-rc.json'), JSON.stringify({ 'generator-jhipster': { defaultCommand: 'generate-generator' } }));
    expect(resolveDefaultCommand({ cwd })).toBe('generate-generator');
  });

  it('should ignore an invalid .yo-rc.json', () => {
    const cwd = mkdtempSync(join(tmpdir(), 'jhipster-'));
    writeFileSync(join(cwd, '.yo-rc.json'), '{');
    expect(resolveDefaultCommand({ cwd })).toBe('app');
  });
});
