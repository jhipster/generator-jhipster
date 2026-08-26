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
import assert from 'node:assert';

import { mergeBlueprints, normalizeBlueprintName, parseBlueprints, removeBlueprintDuplicates } from './blueprint.ts';

describe('generator - base - internal - blueprint', () => {
  describe('::parseBlueprints', () => {
    it('does nothing if an array', () => {
      const expected = [{ name: 'generator-jhipster-foo', version: 'latest' }];
      const actual = parseBlueprints(expected);
      assert.deepStrictEqual(actual, expected);
    });
    it('returns an array if empty string', () => {
      const expected: any[] = [];
      const actual = parseBlueprints('');
      assert.deepStrictEqual(actual, expected);
    });
    it('returns an array if not string', () => {
      assert.deepStrictEqual(parseBlueprints(), []);
    });
    it('adds generator-jhipster prefix if it is absent', () => {
      const expected = [{ name: 'generator-jhipster-foo' }];
      const actual = parseBlueprints('foo');
      assert.deepStrictEqual(actual, expected);
    });
    it('keeps generator-jhipster prefix if it is present', () => {
      const expected = [{ name: 'generator-jhipster-foo', version: '1.0.1' }];
      const actual = parseBlueprints('generator-jhipster-foo@1.0.1');
      assert.deepStrictEqual(actual, expected);
    });
    it('adds generator-jhipster prefix to scoped package and extracts version', () => {
      const expected = [{ name: '@corp/generator-jhipster-foo', version: '1.0.1' }];
      const actual = parseBlueprints('@corp/foo@1.0.1');
      assert.deepStrictEqual(actual, expected);
    });
    it('parses comma separated list', () => {
      const expected = [
        { name: 'generator-jhipster-foo' },
        { name: 'generator-jhipster-bar', version: '1.0.1' },
        { name: '@corp/generator-jhipster-foo' },
      ];
      const actual = parseBlueprints('foo,bar@1.0.1,@corp/foo');
      assert.deepStrictEqual(actual, expected);
    });
  });
  describe('::mergeBlueprints', () => {
    describe('not passing arguments', () => {
      it('returns an empty array', () => {
        const expected: any[] = [];
        const actual = mergeBlueprints();
        assert.deepStrictEqual(actual, expected);
      });
    });
    describe('passing undefined', () => {
      it('throws an error', () => {
        // @ts-expect-error Testing invalid usage
        expect(() => mergeBlueprints(undefined)).toThrow(/Only arrays are supported./);
      });
    });
    describe('passing array and undefined', () => {
      const argumentsToPass = [[], undefined];
      it('throws an error', () => {
        // @ts-expect-error Testing invalid usage
        expect(() => mergeBlueprints(...argumentsToPass)).toThrow(/Only arrays are supported./);
      });
    });
    describe('passing unique blueprints', () => {
      const argumentsToPass = [
        [{ name: 'generator-jhipster-foo', version: 'latest' }],
        [{ name: 'generator-jhipster-bar', version: '1.0.1' }],
      ];
      it('returns them concatenated', () => {
        const expected = [
          { name: 'generator-jhipster-foo', version: 'latest' },
          { name: 'generator-jhipster-bar', version: '1.0.1' },
        ];
        const actual = mergeBlueprints(...argumentsToPass);
        assert.deepStrictEqual(actual, expected);
      });
    });
    describe('passing non unique blueprints', () => {
      it('prefers prior version', () => {
        const argumentsToPass = [
          [
            { name: 'generator-jhipster-foo', version: 'latest' },
            { name: 'generator-jhipster-bar', version: '1.0.1' },
          ],
          [{ name: 'generator-jhipster-foo', version: '1.0.1' }],
        ];
        const expected = [
          { name: 'generator-jhipster-foo', version: 'latest' },
          { name: 'generator-jhipster-bar', version: '1.0.1' },
        ];
        const actual = mergeBlueprints(...argumentsToPass);
        assert.deepStrictEqual(actual, expected);
      });
      it('uses later version when prior version is not defined', () => {
        const argumentsToPass = [
          [{ name: 'generator-jhipster-foo' }, { name: 'generator-jhipster-bar', version: '1.0.1' }],
          [{ name: 'generator-jhipster-foo', version: '1.0.1' }],
        ];
        const expected = [
          { name: 'generator-jhipster-foo', version: '1.0.1' },
          { name: 'generator-jhipster-bar', version: '1.0.1' },
        ];
        const actual = mergeBlueprints(...argumentsToPass);
        assert.deepStrictEqual(actual, expected);
      });
    });
  });
  describe('::removeBlueprintDuplicates', () => {
    it('keeps blueprints with undefined version', () => {
      const argumentsToPass = [{ name: 'generator-jhipster-foo' }];
      const expected = [{ name: 'generator-jhipster-foo' }];
      const actual = removeBlueprintDuplicates(argumentsToPass);
      assert.deepStrictEqual(actual, expected);
    });
  });
  describe('::normalizeBlueprintName', () => {
    it('adds generator-jhipster prefix if it is absent', () => {
      const generatorName = normalizeBlueprintName('foo');
      expect(generatorName).toBe('generator-jhipster-foo');
    });
    it('keeps generator-jhipster prefix if it is present', () => {
      const generatorName = normalizeBlueprintName('generator-jhipster-foo');
      expect(generatorName).toBe('generator-jhipster-foo');
    });
    it('adds generator-jhipster prefix for scoped package', () => {
      const generatorName = normalizeBlueprintName('@corp/foo');
      expect(generatorName).toBe('@corp/generator-jhipster-foo');
    });
  });
});
