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
import { describe, it } from 'expect-node';

import { RuleTester } from 'eslint';

import rule from './snapshot-test-name.ts';

RuleTester.describe = describe;
RuleTester.it = it;

const ruleTester = new RuleTester({ languageOptions: { ecmaVersion: 2022, sourceType: 'module' } });

ruleTester.run('snapshot-test-name', rule, {
  valid: [
    `it('should match files snapshot', () => { expect(result).toMatchSnapshot(); });`,
    `it('should compose with generators - snapshot', () => { expect(composed).toMatchInlineSnapshot(); });`,
    `it(\`should match \${name} Snapshot\`, () => { expect(result).toMatchSnapshot(); });`,
    // A test that compares no snapshot keeps its name.
    `it('should write files', () => { expect(files).toHaveLength(1); });`,
    // A helper call is not a test.
    `run('should parse it', () => { expect(result).toMatchSnapshot(); });`,
  ],
  invalid: [
    {
      code: `it('should parse it', () => { expect(result).toMatchSnapshot(); });`,
      errors: [{ messageId: 'missing', data: { title: 'should parse it' } }],
    },
    {
      code: `it.only('should compose with generators', async () => { expect(composed).toMatchInlineSnapshot(\`[]\`); });`,
      errors: [{ messageId: 'missing', data: { title: 'should compose with generators' } }],
    },
    {
      code: `test(\`should convert \${name}\`, function () { expect(converted).toMatchSnapshot(); });`,
      errors: [{ messageId: 'missing', data: { title: 'should convert ' } }],
    },
  ],
});
