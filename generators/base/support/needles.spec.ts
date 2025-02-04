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
import test from 'node:test';
import { beforeEach, describe, esmocha, expect, it } from 'esmocha';
import { createJHipsterLogger } from '../../../lib/utils/logger.js';
import { checkContentIn, createBaseNeedle, createNeedleCallback, insertContentBeforeNeedle } from './needles.js';

describe('needles - support', () => {
  describe('checkContentIn', () => {
    it('should throw without content', () => {
      // @ts-expect-error
      expect(() => checkContentIn('bar')).toThrow();
    });

    it('should throw without contentToCheck', () => {
      // @ts-expect-error
      expect(() => checkContentIn(undefined, 'bar')).toThrow();
    });

    it('should be truthy for identical string', () => {
      expect(checkContentIn('bar', 'bar')).toBeTruthy();
    });

    it('should be truthy for string containing', () => {
      expect(checkContentIn('bar', 'foo bar foo')).toBeTruthy();
    });

    it('should be truthy for whitespace changes', () => {
      expect(checkContentIn('bar', 'foo    bar    foo')).toBeTruthy();
    });

    it('should be truthy for new lines changes', () => {
      expect(
        checkContentIn(
          'bar foo',
          `foo    bar
  foo`,
        ),
      ).toBeTruthy();
    });

    it('should be truthy for new lines changes', () => {
      expect(
        checkContentIn(
          `bar
 foo`,
          'foo    bar foo',
        ),
      ).toBeTruthy();
    });
  });

  describe('insertContentBeforeNeedle', () => {
    it('should throw without content', () => {
      expect(() =>
        // @ts-expect-error
        insertContentBeforeNeedle({
          contentToAdd: 'bar',
          needle: 'bar',
        }),
      ).toThrow();
    });

    it('should throw without needle', () => {
      expect(() =>
        // @ts-expect-error
        insertContentBeforeNeedle({
          content: 'bar',
          contentToAdd: 'bar',
        }),
      ).toThrow();
    });

    it('should throw without contentToAdd', () => {
      expect(() =>
        // @ts-expect-error
        insertContentBeforeNeedle({
          content: 'bar',
          needle: 'bar',
        }),
      ).toThrow();
    });

    ['//', '<!--', '/*', '#'].forEach(needlePrefix => {
      describe(`${needlePrefix} prefixed needles`, () => {
        const needle = 'a-needle';
        const contentToAdd = `a bar value
another bar value`;

        it('should insert content and add ident', () => {
          const content = insertContentBeforeNeedle({
            content: `
        ${needlePrefix} jhipster-needle-${needle}
`,
            contentToAdd,
            needle,
          });

          expect(content).toMatchInlineSnapshot(`
  "
          a bar value
          another bar value
          ${needlePrefix} jhipster-needle-a-needle
  "
  `);
        });

        it('should insert an array of content and add ident', () => {
          const content = insertContentBeforeNeedle({
            content: `
        ${needlePrefix} jhipster-needle-${needle}
`,
            contentToAdd: [contentToAdd, `${contentToAdd}2`],
            needle,
          });

          expect(content).toMatchInlineSnapshot(`
  "
          a bar value
          another bar value
          a bar value
          another bar value2
          ${needlePrefix} jhipster-needle-a-needle
  "
  `);
        });

        it('should insert content with needles at start and end of contents', () => {
          const content = insertContentBeforeNeedle({
            content: `${needlePrefix} jhipster-needle-${needle}`,
            contentToAdd,
            needle,
          });

          expect(content).toMatchInlineSnapshot(`
"a bar value
another bar value
${needlePrefix} jhipster-needle-a-needle"
`);
        });

        it('should not insert content with needles with extra letter', () => {
          const content = insertContentBeforeNeedle({
            content: `${needlePrefix} jhipster-needle-${needle}a`,
            contentToAdd,
            needle,
          });

          expect(content).toBeNull();
        });

        it('should not insert content with needles with extra dash', () => {
          const content = insertContentBeforeNeedle({
            content: `${needlePrefix} jhipster-needle-${needle}-`,
            contentToAdd,
            needle,
          });

          expect(content).toBeNull();
        });

        it('should not insert content without a leading space', () => {
          const content = insertContentBeforeNeedle({
            content: `${needlePrefix}jhipster-needle-${needle}-`,
            contentToAdd,
            needle,
          });

          expect(content).toBeNull();
        });

        it('should throw when 2 needles exists', () => {
          expect(() =>
            insertContentBeforeNeedle({
              content: `
        ${needlePrefix} jhipster-needle-${needle}
        ${needlePrefix} jhipster-needle-${needle}
`,
              contentToAdd,
              needle,
            }),
          ).toThrow();
        });
      });
    });
  });

  describe('createNeedleCallback', () => {
    const needle = 'a-needle';
    const contentToAdd = 'content to add';

    it('should throw without needle', () => {
      // @ts-expect-error
      expect(() => createNeedleCallback({ contentToAdd })).toThrow();
    });

    it('should throw without contentToAdd', () => {
      // @ts-expect-error
      expect(() => createNeedleCallback({ needle })).toThrow();
    });

    it('should return a function', () => {
      expect(typeof createNeedleCallback({ contentToAdd, needle })).toBe('function');
    });

    it('returned function should throw on missing content', () => {
      const needleCallback = createNeedleCallback({ contentToAdd, needle });
      // @ts-expect-error invalid params
      expect(() => needleCallback.call({ log() {} })).toThrow(/content is required/);
    });

    it('returned function should throw on missing needle', () => {
      const log = test.mock.fn(createJHipsterLogger());
      const needleCallback = createNeedleCallback({ contentToAdd, needle });
      // @ts-expect-error invalid params
      expect(() => needleCallback.call({ log } as any, 'no needle')).toThrow(/Missing required jhipster-needle/);
    });

    it('returned function should not throw on optional missing needle', () => {
      const content = 'no needle';
      const log = test.mock.fn(createJHipsterLogger());
      const needleCallback = createNeedleCallback({ contentToAdd, needle, optional: true });
      expect(needleCallback.call({ log } as any, content, 'file')).toBe(content);
    });

    it('returned function should add contentToAdd', () => {
      const log = test.mock.fn(createJHipsterLogger());
      const needleCallback = createNeedleCallback({ contentToAdd, needle });
      expect(needleCallback.call({ log } as any, `\\\\ jhipster-needle-${needle}`, 'file')).toMatchInlineSnapshot(`
"content to add
\\\\ jhipster-needle-a-needle"
`);
    });

    it('returned function should add contentToAdd array', () => {
      const log = test.mock.fn(createJHipsterLogger());
      const needleCallback = createNeedleCallback({ contentToAdd: [contentToAdd, `${contentToAdd}2`], needle });
      expect(needleCallback.call({ log } as any, `\\\\ jhipster-needle-${needle}`, 'any-file')).toMatchInlineSnapshot(`
"content to add
content to add2
\\\\ jhipster-needle-a-needle"
`);
    });
  });

  describe('createBaseNeedle', () => {
    const needles = { aNeedle: 'content to add' };
    let generator;

    beforeEach(() => {
      generator = {
        editFile: esmocha.fn(),
      };
    });

    it('should throw without needles parameter', () => {
      // @ts-expect-error
      expect(() => createBaseNeedle()).toThrow(/needles is required/);
    });

    it('should throw with empty needles', () => {
      expect(() => createBaseNeedle({})).toThrow(/At least 1 needle is required/);
    });

    it('should throw with options and empty needles', () => {
      expect(() => createBaseNeedle({ optional: true }, {})).toThrow(/At least 1 needle is required/);
    });

    it('should return a function', () => {
      expect(typeof createBaseNeedle(needles)).toBe('function');
    });

    it('should throw with filePath without generator', () => {
      const filePath = 'file.foo';
      // @ts-expect-error invalid params
      expect(() => createBaseNeedle({ filePath }, needles)).toThrow(/when passing filePath, the generator is required/);
    });

    it('should execute editFile if generator and filePath is passed', () => {
      const filePath = 'file.foo';
      createBaseNeedle.call(generator as any, { filePath }, needles);
      expect(generator.editFile).toBeCalledTimes(1);
      expect(generator.editFile.mock.lastCall[0]).toBe(filePath);
      expect(typeof generator.editFile.mock.lastCall[1]).toBe('function');
    });
  });
});
