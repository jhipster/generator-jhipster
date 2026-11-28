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

import { before, describe, expect, it } from 'expect-node';

import { defaultHelpers as helpers, result as runResult } from '#testing';

// The README is merged from the fragments of the generators, which the tests of the generated application do not read.
describe('generator - common - README fragments', () => {
  before(() => helpers.runJHipster('app').withJHipsterConfig({ enableSwaggerCodegen: true }));

  it('separates the fragments of a section with a blank line', () => {
    // The API-First fragment of openapi-generator ends a paragraph, the client one of the development section starts another.
    expect(runResult.fs.read(`${runResult.cwd}/README.md`)).toMatch(/ for more details\.\n\nThe build system will install/);
  });
});
