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

import { createJDLRuntime } from '../jdl-config/jdl-runtime.ts';

import { convertJDLToFiles } from './convert-jdl-to-files.ts';

describe('jdl - convertJDLToFiles', () => {
  it('should throw the errors of the jdl together', () => {
    expect(() => convertJDLToFiles('entity A\nentity A\nrelationship OneToOne { A to B }')).toThrow(/\n/);
  });

  it('should parse and check the jdl with the runtime passed', () => {
    const runtime = createJDLRuntime({
      rules: [{ id: 'no-b', check: ast => ast.entities.filter(entity => entity.name === 'B').map(() => ({ message: 'No B.' })) }],
    });
    expect(() => convertJDLToFiles('entity B', runtime)).toThrow('No B.');
    expect(Object.keys(convertJDLToFiles('entity B').files)).toEqual(['.jhipster/B.json']);
  });
});
