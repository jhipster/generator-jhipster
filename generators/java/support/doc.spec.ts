import { describe, expect, it } from 'esmocha';

import { formatDocAsApiDescription, formatDocAsJavaDoc } from './doc.ts';

describe('generator - server - support - doc', () => {
  describe('formatDocAsJavaDoc', () => {
    describe('when passing a negative or nil increment', () => {
      it('returns the comment with no increment', () => {
        expect(formatDocAsJavaDoc('whatever', -42)).toBe('/**\n * whatever\n */');
        expect(formatDocAsJavaDoc('whatever', 0)).toBe('/**\n * whatever\n */');
      });
    });
    describe('when passing a positive increment', () => {
      it('returns the comment with the increment', () => {
        expect(formatDocAsJavaDoc('whatever', 1)).toBe(' /**\n  * whatever\n  */');
      });
    });
    describe('when passing a nil comment', () => {
      it('inserts an empty comment instead of failing', () => {
        // @ts-expect-error
        expect(formatDocAsJavaDoc(null, 1)).toBe(' /**\n  * \n  */');
      });
    });
    describe('when passing a comment containing double quotes', () => {
      it('escapes the quotes', () => {
        expect(formatDocAsJavaDoc('Comment="KO"', 1)).toBe(' /**\n  * Comment=\\"KO\\"\n  */');
      });
    });
    describe('when passing a comment with newlines', () => {
      it('formats the comment correctly with line breaks', () => {
        const comment = 'This is the first line.\\nAnd this is the second.';
        expect(formatDocAsJavaDoc(comment, 1)).toBe(' /**\n  * This is the first line.\n  * And this is the second.\n  */');
      });
    });
  });

  describe('formatDocAsApiDescription', () => {
    describe('when formatting a nil text', () => {
      it('returns it', () => {
        expect(formatDocAsApiDescription()).toEqual(undefined);
      });
    });
    describe('when formatting an empty text', () => {
      it('returns it', () => {
        expect(formatDocAsApiDescription('')).toEqual('');
      });
    });
    describe('when formatting normal texts', () => {
      describe('when having empty lines', () => {
        it('discards them', () => {
          expect(formatDocAsApiDescription('First line\n \nSecond line\n\nThird line')).toEqual('First line Second line Third line');
        });
      });
      describe('when having HTML tags', () => {
        it('keeps them', () => {
          expect(formatDocAsApiDescription('Not boldy\n<b>boldy</b>')).toEqual('Not boldy<b>boldy</b>');
        });
      });
      describe('when having a plain text', () => {
        it('puts a space before each line', () => {
          expect(formatDocAsApiDescription('JHipster is\na great generator')).toEqual('JHipster is a great generator');
        });
      });
      describe('when having quotes', () => {
        it('formats the text to make the string valid', () => {
          expect(formatDocAsApiDescription('JHipster is "the" best')).toEqual('JHipster is \\"the\\" best');
        });
      });
    });
  });
});
