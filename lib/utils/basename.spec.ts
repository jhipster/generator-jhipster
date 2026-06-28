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

import { getFrontendAppName } from './basename.ts';

describe('generator > base', () => {
  describe('getFrontendAppName', () => {
    describe('when called with name having App', () => {
      it('returns the frontend app name', () => {
        expect(getFrontendAppName({ baseName: 'myAmazingApp' })).toBe('myAmazingApp');
      });
    });
    describe('when called with name', () => {
      it('returns the frontend app name with the App suffix added', () => {
        expect(getFrontendAppName({ baseName: 'myAwesomeProject' })).toBe('myAwesomeProjectApp');
      });
    });
    describe('when called with name starting with a digit', () => {
      it('returns the default frontend app name - App', () => {
        expect(getFrontendAppName({ baseName: '1derful' })).toBe('App');
      });
    });
  });
});
