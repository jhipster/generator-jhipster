/**
 * Copyright 2013-2025 the original author or authors from the JHipster project.
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

import { before, describe, expect, it } from 'esmocha';

import { addAll, join } from './set-utils.ts';

describe('jdl - SetUtils', () => {
  describe('addAll', () => {
    describe('when not passing a set', () => {
      it('should fail', () => {
        // @ts-expect-error
        expect(() => addAll()).toThrow(/^A Set must be passed so as to insert elements\.$/);
      });
    });
    describe('when not passing elements', () => {
      let set: Set<unknown>;

      before(() => {
        set = new Set([1, 2, 3]);
        // @ts-expect-error
        addAll(set);
      });

      it('should return the set unchanged', () => {
        expect(set).toMatchInlineSnapshot(`
Set {
  1,
  2,
  3,
}
`);
      });
    });
    describe('when passing an empty list as elements', () => {
      let set: Set<any>;

      before(() => {
        set = new Set([1, 2, 3]);
        addAll(set, []);
      });

      it('should return the set unchanged', () => {
        expect(set).toMatchInlineSnapshot(`
Set {
  1,
  2,
  3,
}
`);
      });
    });
    describe('when passing elements', () => {
      let set: Set<number>;

      before(() => {
        set = new Set([1, 2, 3]);
        addAll(set, [3, 42]);
      });

      it('should add them to the set', () => {
        expect(set).toMatchInlineSnapshot(`
Set {
  1,
  2,
  3,
  42,
}
`);
      });
    });
  });
  describe('join', () => {
    describe('when not passing a set', () => {
      it('should fail', () => {
        // @ts-expect-error
        expect(() => join()).toThrow(/^A Set must be passed so as to join elements\.$/);
      });
    });
    describe('when not passing the separator', () => {
      let result: string;

      before(() => {
        const set = new Set();
        set.add(42);
        set.add('a');
        result = join(set);
      });

      it('should join the elements using a comma', () => {
        expect(result).toEqual('42,a');
      });
    });
    describe('when passing a separator', () => {
      describe('should use it', () => {
        let result: string;

        before(() => {
          const set = new Set();
          set.add(42);
          set.add('a');
          result = join(set, ', ');
        });

        it('should join the elements using the separator', () => {
          expect(result).toEqual('42, a');
        });
      });
    });
  });
});
