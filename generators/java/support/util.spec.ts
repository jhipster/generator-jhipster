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

import { getMainClassName } from './util.ts';

describe('generator > java', () => {
  describe('getMainClassName', () => {
    describe('when called with name', () => {
      it('return the app name', () => {
        expect(getMainClassName({ baseName: 'myTest' })).toBe('MyTestApp');
      });
    });
    describe('when called with name having App', () => {
      it('return the app name', () => {
        expect(getMainClassName({ baseName: 'myApp' })).toBe('MyApp');
      });
    });
    describe('when called with name having invalid java chars', () => {
      it('return the default app name', () => {
        expect(getMainClassName({ baseName: '9myApp' })).toBe('Application');
      });
    });
  });
});
