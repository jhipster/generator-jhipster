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

import { merge } from './object-utils.ts';

describe('jdl - ObjectUtils', () => {
  describe('merge', () => {
    describe('when merging a nil object with a not-empty one', () => {
      let merged: any;

      before(() => {
        merged = merge(null, { a: 1 });
      });

      it('should return the second one', () => {
        expect(merged).toEqual({ a: 1 });
      });
    });
    describe('when merging a not-empty object with a nil one', () => {
      let merged: Record<string, never> | { a: number };

      before(() => {
        merged = merge({}, { a: 1 });
      });

      it('should return the first one', () => {
        expect(merged).toEqual({ a: 1 });
      });
    });
    describe('when merging two not-empty objects', () => {
      let merged: { a: number; b: number } | { b: number; c: number };

      before(() => {
        const object1 = {
          a: 1,
          b: 2,
        };
        const object2 = {
          b: 3,
          c: 4,
        };
        merged = merge(object1, object2);
      });

      it('should merge them', () => {
        expect(merged).toEqual({ a: 1, b: 3, c: 4 });
      });
    });
  });
});
