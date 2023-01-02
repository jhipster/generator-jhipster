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

import { checkContentIn, insertContentBeforeNeedle, createNeedleCallback, createBaseNeedle } from './needles.mjs';

describe('needles support', () => {
  describe('checkContentIn', () => {
    it('should throw without content', () => {
      expect(() => checkContentIn('bar')).toThrow();
    });

    it('should throw without contentToCheck', () => {
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
  foo`
        )
      ).toBeTruthy();
    });

    it('should be truthy for new lines changes', () => {
      expect(
        checkContentIn(
          `bar
 foo`,
          'foo    bar foo'
        )
      ).toBeTruthy();
    });
  });

  describe('insertContentBeforeNeedle', () => {
    it('should throw without content', () => {
      expect(() =>
        insertContentBeforeNeedle({
          contentToAdd: 'bar',
          needle: 'bar',
        })
      ).toThrow();
    });

    it('should throw without needle', () => {
      expect(() =>
        insertContentBeforeNeedle({
          content: 'bar',
          contentToAdd: 'bar',
        })
      ).toThrow();
    });

    it('should throw without contentToAdd', () => {
      expect(() =>
        insertContentBeforeNeedle({
          content: 'bar',
          needle: 'bar',
        })
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
            })
          ).toThrow();
        });
      });
    });
  });

  describe('createNeedleCallback', () => {
    const needle = 'a-needle';
    const contentToAdd = 'content to add';

    it('should throw without needle', () => {
      expect(() => createNeedleCallback({ contentToAdd })).toThrow();
    });

    it('should throw without contentToAdd', () => {
      expect(() => createNeedleCallback({ needle })).toThrow();
    });

    it('should return a function', () => {
      expect(typeof createNeedleCallback({ contentToAdd, needle })).toBe('function');
    });

    it('returned function should throw on missing content', () => {
      expect(() => createNeedleCallback({ contentToAdd, needle })()).toThrow(/content is required/);
    });

    it('returned function should throw on missing needle', () => {
      expect(() => createNeedleCallback({ contentToAdd, needle })('no needle')).toThrow(/Missing required jhipster-needle/);
    });

    it('returned function should not throw on optional missing needle', () => {
      const content = 'no needle';
      expect(createNeedleCallback({ contentToAdd, needle, optional: true }).call({ log() {} }, content, 'file')).toBe(content);
    });

    it('returned function should add contentToAdd', () => {
      expect(createNeedleCallback({ contentToAdd, needle })(`\\ jhipster-needle-${needle}`)).toMatchInlineSnapshot(`
"content to add
\\\\ jhipster-needle-a-needle"
`);
    });

    it('returned function should add contentToAdd array', () => {
      expect(createNeedleCallback({ contentToAdd: [contentToAdd, `${contentToAdd}2`], needle })(`\\ jhipster-needle-${needle}`))
        .toMatchInlineSnapshot(`
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
        editFile: jest.fn(),
      };
    });

    it('should throw without needles parameter', () => {
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

    it('should throw with generator without filePath', () => {
      expect(() => createBaseNeedle({ generator }, needles)).toThrow(/filePath is required/);
    });

    it('should execute editFile if generator and filePath is passed', () => {
      const filePath = 'file.foo';
      createBaseNeedle({ generator, filePath }, needles);
      expect(generator.editFile).toBeCalledTimes(1);
      expect(generator.editFile.mock.lastCall[0]).toBe(filePath);
      expect(typeof generator.editFile.mock.lastCall[1]).toBe('function');
    });
  });
});
