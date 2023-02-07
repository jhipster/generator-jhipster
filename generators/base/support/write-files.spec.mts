/**
 * Copyright 2013-2023 the original author or authors from the JHipster project.
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
import { jestExpect as expect } from 'mocha-expect-snapshot';
import jest from 'jest-mock';

import { joinCallbacks } from './write-files.mjs';
import { EditFileCallback } from '../api.mjs';

describe('generator - base - support - writeFiles', () => {
  describe('joinCallbacks', () => {
    it('should return a function', () => {
      expect(typeof joinCallbacks()).toBe('function');
    });

    it('without callbacks, should return the original content', () => {
      expect(joinCallbacks()('original', '')).toBe('original');
    });

    it('with a callback, should return the callback return', () => {
      const mock = jest.fn().mockReturnValue('return1');
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const callback = joinCallbacks(mock as EditFileCallback<any>);

      expect(callback('original', 'file')).toBe('return1');

      expect(mock.mock.calls[0][0]).toBe('original');
      expect(mock.mock.calls[0][1]).toBe('file');
    });

    it('with two callbacks, should forward last callback and return the last callback return', () => {
      const mock1 = jest.fn().mockReturnValue('return1');
      const mock2 = jest.fn().mockReturnValue('return2');
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const callback = joinCallbacks(mock1 as EditFileCallback<any>, mock2 as EditFileCallback<any>);

      expect(callback('original', 'file')).toBe('return2');

      expect(mock2.mock.calls[0][0]).toBe('return1');
      expect(mock2.mock.calls[0][1]).toBe('file');
    });
  });
});
